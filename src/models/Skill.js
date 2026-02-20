/**
 * Represents a discrete ability or action a Character can perform.
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
        this.ev = data.ev || 0; // Mathematical Expected Value
        this.evaluationTime = data.evaluationTime || null; // Date of last EV review


        // --- Logic Strategies (Injected Behavior) ---
        // Defaults to always valid, no targets, no effect if not provided.
        this.checkConditionsStrat = data.checkConditions || (() => true);
        this.getTargetsStrat = data.getTargets || (() => []);
        // Selection Strategy (Step 2 Helper): Default to random if no strategy provided but selection needed.
        this.selectTargetsStrat = data.selectTargets || ((candidates, max) => {
            // Default: Prioritize character with least HP, up to max targets
            const sorted = [...candidates].sort((a, b) => a.hp - b.hp);
            return sorted.slice(0, max);
        });
        this.executeStrat = data.execute || (() => ({ log: 'No effect', actions: [] }));
        this.animation = data.animation; // New property
    }

    /**
     * MAIN ENTRY POINT
     * Orchestrates the full execution flow: Determination, Targeting, then Execution.
     * @param {Character} user - The character using the skill.
     * @param {Object} context - The combat state.
     * @returns {Promise<Object|null>} The result ({ log, actions }) or null if invalid/cancelled.
     */
    async perform(user, context) {
        const { bus } = await import('../systems/EventBus');

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
            const payload = {
                skill: this,
                user,
                type: selectedTargets.length === 1 && selectedTargets[0].id === user.id ? 'SELF' : (selectedTargets.length === 1 ? 'SINGLE' : 'MULTI'),
                targets: selectedTargets,
                context // Pass full context for dice access
            };

            bus.emit('Skill:Targeting', payload);
        }

        if (!selectedTargets || selectedTargets.length === 0) {
            return { log: `${user.name} skipped ${this.name}.`, actions: [] };
        }

        // Step 3: Execution
        // Trigger Animation if defined (Wait for it?)
        if (this.animation) {
            const { AnimationSkill } = await import('../systems/AnimationSkill');
            await AnimationSkill.play(this.animation, user, selectedTargets, context);
        }

        return await this.execute(user, context, selectedTargets);
    }

    /**
     * STEP 1: DETERMINATOR
     * Calculates validity, identifies candidates, and decides max targets.
     * @param {Character} user 
     * @param {Object} context 
     * @returns {Object} { validTargets, isActive, maxTargets }
     */
    determinator(user, context) {
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
                const target = await context.requestPlayerTarget(validTargets);
                return target ? [target] : [];
            } catch (e) {
                return []; // Cancelled
            }
        }

        // 2. Random/Auto Strategy (Default/AI)
        if (validTargets.length <= maxTargets) {
            return validTargets;
        }

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
     * @returns {Promise<number[]>} Array of actual damage taken per target.
     */
    static async ApplyDamage(targets, amount, context, options = {}) {
        if (!Array.isArray(targets)) targets = [targets];

        const source = options.source || context.source || context.user;

        const payload = { targets, amount, context, type: 'DAMAGE', source };
        await bus.emitAsync('Skill:CausingDamage', payload);

        const finalAmount = payload.amount;

        const results = [];
        for (const target of targets) {
            if (target.hp <= 0) {
                results.push(0);
                continue;
            }

            let actualDamage = finalAmount;

            if (target.defense >= actualDamage) {
                await bus.emitAsync('Skill:Immute', { target, damage: actualDamage, defense: target.defense });
                await bus.emitAsync('Skill:CausingDefense', { target, amount: target.defense });
                actualDamage = 0;
            }
            target.defense = 0; // Reset defense

            if (actualDamage > 0) {
                await bus.emitAsync('Skill:TakeDamage', { target, amount: actualDamage, source: source });
            }

            target.hp = Math.max(0, target.hp - actualDamage);

            if (target.hp <= 0) {
                await bus.emitAsync('Character:Die', { character: target });
            }

            results.push(actualDamage);
        }
        return results;
    }

    /**
     * Heals a list of targets.
     * @param {Character[]} targets 
     * @param {number} amount 
     * @returns {Promise<number[]>} Array of actual healed amounts.
     */
    static async Heal(targets, amount) {
        if (!Array.isArray(targets)) targets = [targets];

        await bus.emitAsync('Skill:CausingHeal', { targets, amount });

        const results = [];
        for (const target of targets) {
            if (target.hp <= 0) {
                results.push(0);
                continue;
            }
            const oldHp = target.hp;
            const healed = Math.min(target.maxHp, target.hp + amount) - oldHp;

            target.hp += healed;

            if (healed > 0) {
                await bus.emitAsync('Skill:GetHealed', { target, amount: healed });
            }

            results.push(healed);
        }
        return results;
    }

    /**
     * Modifies a stat for a list of targets.
     * @param {Character[]} targets 
     * @param {string} stat - 'speed', 'defense', etc.
     * @param {number} amount 
     */
    static async ModifyStat(targets, stat, amount) {
        if (!Array.isArray(targets)) targets = [targets];

        for (const target of targets) {
            if (stat === 'speed') {
                target.tempSpeed += amount;
            } else if (stat === 'defense') {
                target.defense += amount;
                await bus.emitAsync('Skill:GetDefense', { target, amount });
            }
        }
    }

    // --- FACTORY (Phase 2) ---

    /**
     * Generates a Skill instance from a configuration object.
     * @param {Object} config
     * @returns {Skill}
     */
    static generate(config) {
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
        const execute = async (targets, context) => {
            const { dice, memory } = context;
            const logParts = [];

            // Effect: Damage
            if (execution.damage) {
                let amt = execution.damage.amount || 0;
                if (execution.damage.scaleWithDice) amt = dice;

                const payload = { targets, amount: amt, context, type: 'DAMAGE' };
                await bus.emitAsync('Skill:CausingDamage', payload);

                // execution.damage can also imply a "target" override if we wanted, but sticking to simple for now
                await Skill.ApplyDamage(targets, amt, context);
                // Simple logging for first target or aggregate
                logParts.push(`Dealt ${amt} DMG.`);
            }

            // Effect: Heal
            if (execution.heal) {
                const amt = execution.heal.amount || 0;
                await Skill.Heal(targets, amt);
                logParts.push(`Healed ${amt}.`);
            }

            // Effect: Stat Mod
            if (execution.buff) {
                const { stat, amount } = execution.buff;
                await Skill.ModifyStat(targets, stat, amount);
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
                await Skill.ModifyStat([context.user], 'speed', -1);
                logParts.push("(Speed -1)");
            }

            // If no specific log defined, return generic.
            return { log: `${name}: ${logParts.join(' ')}` };
        };

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
            execute,
            animation: config.animation // Pass animation key
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
            if (target.hp <= 0) {
                target.hp = target.maxHp;
                bus.emit('Skill:Revived', { target });
            } else {
                target.hp = target.maxHp;
            }
        });
    }
}
