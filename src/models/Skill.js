/**
 * Represents a discrete ability or action a Character can perform.
 * Follows a strict 3-step process: Determine -> Target -> Execute.
 * Follows a strict 3-step process: Determine -> Target -> Execute.
 */
import { bus } from '../systems/EventBus';

export class Skill {
    constructor(data) {
        // --- Identity & Configuration ---
        this.id = data.id;
        this.name = data.name;
        this.type = data.type; // 'OFFENSIVE', 'DEFENSIVE', 'BOTH'
        this.description = data.description;
        this.targetingMode = data.targetingMode || 'AUTO'; // 'AUTO', 'MANUAL'
        this.maxTargets = data.maxTargets || 1; // Default to single target
        this.trigger = data.trigger || 'ACTION_PHASE'; // Default to active skill behavior
        this.limitPerTurn = data.limitPerTurn !== undefined ? data.limitPerTurn : 1; // Default 1 for safety


        // --- Logic Strategies (Injected Behavior) ---
        // Defaults to always valid, no targets, no effect if not provided.
        this.checkConditionsStrat = data.checkConditions || (() => true);
        this.getTargetsStrat = data.getTargets || (() => []);
        // Selection Strategy (Step 2 Helper): Default to random if no strategy provided but selection needed.
        this.selectTargetsStrat = data.selectTargets || ((candidates, max) => {
            // Default: Pick random candidates up to max
            // Shuffle
            const shuffled = [...candidates].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, max);
        });
        this.executeStrat = data.execute || (() => ({ log: 'No effect', actions: [] }));
    }

    /**
     * MAIN ENTRY POINT
     * Orchestrates the full execution flow: Determination, Targeting, then Execution.
     * Orchestrates the strict 3-step process: Determine -> Target -> Execute.
     * @param {Character} user - The character using the skill.
     * @param {Object} context - The combat state.
     * @returns {Promise<Object|null>} The result ({ log, actions }) or null if invalid/cancelled.
     */
    async perform(user, context) {
        const { bus } = await import('../systems/EventBus');

        // Event: Determing True/False? 
        // User asked: "Determing True", "Determing False"
        // We can emit 'Skill:Determining' and then result.

        // Step 1: Determination
        const { validTargets, isActive, maxTargets } = this.determinator(user, context);

        if (isActive) {
            bus.emit('Skill:Determining', { skill: this, user, result: true });
        } else {
            bus.emit('Skill:Determining', { skill: this, user, result: false });
            return null; // Skill is not active/valid
        }

        // Step 2: Targeting
        const selectedTargets = await this.targeting(user, context, validTargets, maxTargets);

        // Event: Targeting Types
        if (selectedTargets && selectedTargets.length > 0) {
            if (selectedTargets.length === 1) {
                if (selectedTargets[0].id === user.id) {
                    bus.emit('Skill:Targeting', { skill: this, user, type: 'SELF', targets: selectedTargets });
                } else {
                    bus.emit('Skill:Targeting', { skill: this, user, type: 'SINGLE', targets: selectedTargets });
                }
            } else {
                bus.emit('Skill:Targeting', { skill: this, user, type: 'MULTI', targets: selectedTargets });
            }
        }

        if (!selectedTargets || selectedTargets.length === 0) {
            return { log: `${user.name} skipped ${this.name}.`, actions: [] };
        }

        // Step 3: Execution
        return this.execute(user, context, selectedTargets);
    }

    /**
     * STEP 1: DETERMINATOR
     * Calculates validity, identifies candidates, and decides max targets.
     * @param {Character} user 
     * @param {Object} context 
     * @returns {Object} { validTargets, isActive, maxTargets }
     */
    determinator(user, context) {
        // 0. Check Mode vs Type
        if (context.activeFaction) {
            const mode = context.mode || (context.activeFaction.id === user.faction?.id ? 'OFFENSIVE' : 'DEFENSIVE');

            if (this.type === 'OFFENSIVE' && mode !== 'OFFENSIVE') return { validTargets: [], isActive: false, maxTargets: 0 };
            if (this.type === 'DEFENSIVE' && mode !== 'DEFENSIVE') return { validTargets: [], isActive: false, maxTargets: 0 };
            if (this.type === 'OFFENSIVE' && mode === 'DEFENSIVE') return { validTargets: [], isActive: false, maxTargets: 0 };
        }

        // 1. Check Pre-conditions
        if (!this.checkConditionsStrat(context)) {
            return { validTargets: [], isActive: false, maxTargets: 0 };
        }

        // 2. Identify Candidates
        const candidates = this.getTargetsStrat(context);

        // 3. Determine Max Targets
        let max = this.maxTargets;
        if (typeof max === 'function') {
            max = max(context);
        }

        return {
            validTargets: candidates,
            isActive: candidates.length > 0,
            maxTargets: max || 1
        };
    }

    /**
     * STEP 2: TARGETING
     * Handles Manual or Random selection based on maxTargets.
     * @param {Character} user
     * @param {Object} context
     * @param {Character[]} validTargets
     * @param {number} maxTargets
     * @returns {Promise<Character[]>}
     */
    async targeting(user, context, validTargets, maxTargets) {
        // 1. Manual Strategy (Human Player)
        const isPlayerManual = this.targetingMode === 'MANUAL'
            && user.faction?.type === 'PLAYER'
            && context.requestPlayerTarget;

        if (isPlayerManual) {
            try {
                // If maxTargets > 1, we might need a multi-select UI, 
                // but for now requestPlayerTarget returns single.
                // Assuming manual is usually single target for this UI.
                const target = await context.requestPlayerTarget(validTargets);
                return target ? [target] : [];
            } catch (e) {
                return []; // Cancelled
            }
        }

        // 2. Random/Auto Strategy (Default/AI)
        // "The target number always equal to the maximum number."

        // If we have fewer candidates than max, take them all.
        if (validTargets.length <= maxTargets) {
            return validTargets;
        }

        // Otherwise, use Selection Strategy (Random by default) to pick `maxTargets`
        return this.selectTargetsStrat(validTargets, maxTargets, context);
    }

    /**
     * STEP 3: EXECUTION
     * @param {Character} user
     * @param {Object} context
     * @param {Character[]} targets
     */
    execute(user, context, targets) {
        if (!targets || targets.length === 0) {
            return { log: `${this.name} fizzled.` };
        }
        return this.executeStrat(targets, context);
    }

    // --- STATIC EXECUTION METHODS (Logic Transfer) ---

    /**
     * Applies damage to a list of targets.
     * @param {Character[]} targets 
     * @param {number} amount 
     * @param {Object} context 
     * @returns {number[]} Array of actual damage taken per target.
     */
    static ApplyDamage(targets, amount, context) {
        if (!Array.isArray(targets)) targets = [targets];

        // We allow modification of 'amount' via the event payload.
        const payload = { targets, amount, context, type: 'DAMAGE' };
        bus.emit('Skill:CausingDamage', payload);

        const finalAmount = payload.amount;

        return targets.map(target => {
            if (target.hp <= 0) return 0;

            let actualDamage = finalAmount;

            // Mitigation: Defense blocks damage.
            if (target.defense >= actualDamage) {
                bus.emit('Skill:Immute', { target, damage: actualDamage, defense: target.defense });
                bus.emit('Skill:CausingDefense', { target, amount: target.defense });
                actualDamage = 0;
            }
            target.defense = 0; // Reset defense

            if (actualDamage > 0) {
                bus.emit('Skill:TakeDamage', { target, amount: actualDamage });
            }

            target.hp = Math.max(0, target.hp - actualDamage);

            if (target.hp <= 0) {
                bus.emit('Character:Die', { character: target });
            }

            return actualDamage;
        });
    }

    /**
     * Heals a list of targets.
     * @param {Character[]} targets 
     * @param {number} amount 
     * @returns {number[]} Array of actual healed amounts.
     */
    static Heal(targets, amount) {
        if (!Array.isArray(targets)) targets = [targets];

        bus.emit('Skill:CausingHeal', { targets, amount });

        return targets.map(target => {
            if (target.hp <= 0) return 0;
            const oldHp = target.hp;
            const healed = Math.min(target.maxHp, target.hp + amount) - oldHp;

            target.hp += healed;

            if (healed > 0) {
                bus.emit('Skill:GetHealed', { target, amount: healed });
            }

            return healed;
        });
    }

    /**
     * Modifies a stat for a list of targets.
     * @param {Character[]} targets 
     * @param {string} stat - 'speed', 'defense', etc.
     * @param {number} amount 
     */
    static ModifyStat(targets, stat, amount) {
        if (!Array.isArray(targets)) targets = [targets];

        targets.forEach(target => {
            if (stat === 'speed') {
                target.tempSpeed += amount;
            } else if (stat === 'defense') {
                target.defense += amount;
                bus.emit('Skill:GetDefense', { target, amount });
            }
        });
    }
    // --- FACTORY (Phase 2) ---

    /**
     * Generates a Skill instance from a configuration object.
     * @param {Object} config
     * @returns {Skill}
     */
    static generate(config) {
        // config = { id, name, type, logic: { ... }, execution: { ... }, targeting: { ... } }

        const { id, name, type, description, trigger, limitPerTurn, logic = {}, execution = {}, targeting = {} } = config;

        // 1. Build checkConditions strategy
        const checkConditions = (context) => {
            const { dice, history, memory } = context;

            // Logic: Dice Checks
            if (logic.dice) {
                if (logic.dice.exact && dice !== logic.dice.exact) return false;
                if (logic.dice.min && dice < logic.dice.min) return false;
                if (logic.dice.max && dice > logic.dice.max) return false;
                if (logic.dice.parity) {
                    const isEven = dice % 2 === 0;
                    if (logic.dice.parity === 'even' && !isEven) return false;
                    if (logic.dice.parity === 'odd' && isEven) return false;
                }
            }

            // Logic: History/Memory
            if (logic.historyMatch && history) {
                const occurrences = history.filter(r => r === dice).length;
                if (occurrences === 0) return false;
            }

            // Logic: Custom Requirement (e.g., 'once')
            if (logic.once && memory && memory[`${id}_used`]) return false;

            // Logic: Limit Per Turn
            if (memory && memory[`${id}_turn_count`] >= (limitPerTurn !== undefined ? limitPerTurn : 1)) return false;


            // Logic: Rank/First Check
            if (logic.onlyFirst && !context.isFirst) return false;
            // if (logic.rank && context.turnRank !== logic.rank) return false;

            return true;
        };

        // 2. Build getTargets strategy
        const getTargets = (context) => {
            // Use generalized scope resolution
            if (targeting.scope) {
                return Skill.ResolveScope(targeting.scope, context);
            }

            // Fallback defaults
            if (type === 'OFFENSIVE') return Skill.ResolveScope('ENEMIES', context);
            if (type === 'DEFENSIVE') return Skill.ResolveScope('ALLIES', context);
            return [];
        };

        // 3. Build maxTargets
        const maxTargets = targeting.max || 1;

        // 4. Build execute strategy
        const execute = (targets, context) => {
            const { dice, memory } = context;
            const logParts = [];

            // Effect: Damage
            if (execution.damage) {
                let amt = execution.damage.amount || 0;
                if (execution.damage.scaleWithDice) amt = dice;

                // We allow modification of 'amount' via the event payload.
                const payload = { targets, amount: amt, context, type: 'DAMAGE' };
                console.log(`[Skill] Emitting Skill:CausingDamage with amount: ${amt}`);
                bus.emit('Skill:CausingDamage', payload);
                console.log(`[Skill] After Emit, amount is: ${payload.amount}`);

                const finalAmount = payload.amount;

                // execution.damage can also imply a "target" override if we wanted, but sticking to simple for now
                const dmgs = Skill.ApplyDamage(targets, amt, context);
                // Simple logging for first target or aggregate
                logParts.push(`Dealt ${amt} DMG.`);
            }

            // Effect: Heal
            if (execution.heal) {
                const amt = execution.heal.amount || 0;
                Skill.Heal(targets, amt);
                logParts.push(`Healed ${amt}.`);
            }

            // Effect: Stat Mod
            if (execution.buff) {
                const { stat, amount } = execution.buff;
                Skill.ModifyStat(targets, stat, amount);
                logParts.push(`${stat} ${amount > 0 ? '+' : ''}${amount}.`);
            }

            // Effect: Revive
            if (execution.revive) {
                Skill.Revive(targets);
                logParts.push(`Revived!`);
            }

            // Effect: Reroll (Signal)
            if (execution.reroll) {
                logParts.push(`Rewinds time! (Reroll Requested)`);
                return { log: `${name}: ${logParts.join(' ')}`, action: 'REROLL' };
            }

            // Side Effects
            if (logic.once) {
                memory[`${id}_used`] = true;
            }

            // Increment turn count
            memory[`${id}_turn_count`] = (memory[`${id}_turn_count`] || 0) + 1;


            // Speed debuff special case (Archer)
            if (execution.meta && execution.meta.speedDebuffIfFirst && context.isFirst) {
                Skill.ModifyStat([context.user], 'speed', -1);
                logParts.push("(Speed -1)");
            }

            // If no specific log defined, return generic.
            return { log: `${name}: ${logParts.join(' ')}` };
        };



        // Apply new props after creation (since we just passed them to constructor via 'new Skill' but the object construction in 'generate' was manual before? 
        // No, 'new Skill' takes 'data'. We need to make sure we pass 'trigger' and 'limitPerTurn' to it.
        // The return below constructs 'new Skill' with the object. Let's add them there.
        return new Skill({
            id,
            name,
            type,
            description,
            trigger,
            limitPerTurn,
            targetingMode: targeting.mode || 'AUTO',
            maxTargets,
            checkConditions,
            getTargets,
            execute
        });
    }

    // --- UTILITIES ---

    /**
     * Resolves a scope string to a list of targets from the context.
     * @param {string} scope - 'SELF', 'ALLIES', 'ENEMIES', 'DEAD_ALLIES'
     * @param {Object} context 
     * @returns {Character[]}
     */
    static ResolveScope(scope, context) {
        switch (scope) {
            case 'SELF': return [context.user];
            case 'ALLIES': return context.allies.filter(c => c.isAlive());
            case 'ENEMIES': return context.enemies.filter(c => c.isAlive());
            case 'DEAD_ALLIES': return context.allies.filter(c => !c.isAlive());
            case 'ALL': return [...context.allies, ...context.enemies].filter(c => c.isAlive());
            default: return [];
        }
    }

    /**
     * Revives a list of targets (Resets HP to MaxHP).
     * @param {Character[]} targets
     */
    static Revive(targets) {
        if (!Array.isArray(targets)) targets = [targets];
        targets.forEach(target => {
            // Only revive if dead? Or full heal? 
            // "Fully heal (reset the health attribute)" usually implies setting to max.
            if (target.hp <= 0) {
                target.hp = target.maxHp;
                bus.emit('Skill:Revived', { target });
            } else {
                // If already alive, maybe just full heal?
                target.hp = target.maxHp;
            }
        });
    }
}
