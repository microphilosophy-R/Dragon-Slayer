import { Skill } from '../models/Skill';

export const SKILL_CABINET = {
    // --- MERLIN ---
    "merlin_offensive": Skill.generate({
        id: "merlin_offensive",
        name: "Fireball",
        type: "OFFENSIVE",
        description: "4 DMG if dice is 6.",
        targeting: { mode: 'MANUAL', max: 1, scope: 'ENEMIES' },
        logic: { dice: { exact: 6 } },
        execution: { damage: { amount: 4 } },
        animation: 'attacking'
    }),

    // Merlin Passive: Cancel attack if dice >= 6 (Once per turn)
    "merlin_passive_cancel": new Skill({
        id: "merlin_passive_cancel",
        name: "Spatial Shift",
        type: "DEFENSIVE", // Acts as defensive
        description: "Cancel incoming damage if Dice >= 6 (Once per turn).",
        trigger: "Skill:CausingDamage", // Intercept damage calculation
        limitPerTurn: 1,
        checkConditions: (context) => {
            // Context here is the event payload from Skill:CausingDamage
            // payload = { targets, amount, context: combatContext, type, source }

            // We want to trigger if MERLIN is one of the targets
            const isTargeted = context.targets && context.targets.some(t => t.id === context.user.id);
            if (!isTargeted) return false;

            // Check Dice from the *original* combat context (context.context.dice)
            // The event payload wraps the original context in `context` property?
            // Let's look at Skill.js: bus.emit('Skill:CausingDamage', payload);
            // payload = { targets, amount, context, ... }
            // So context.context is the combat context with dice.
            const combatContext = context.context;
            return combatContext && combatContext.dice >= 6;
        },
        getTargets: (context) => [context.user], // Self is the beneficiary
        execute: (targets, context) => {
            // Nullify the damage in the payload
            context.amount = 0;
            return { log: "Merlin shifts through space! Attack cancelled (0 DMG)." };
        }
    }),

    // --- ARTHUR ---
    "arthur_offensive": Skill.generate({
        id: "arthur_offensive",
        name: "Righteous Strike",
        type: "OFFENSIVE",
        description: "1 DMG if dice >= 4.",
        targeting: { scope: 'ENEMIES' },
        logic: { dice: { min: 4 } },
        execution: { damage: { amount: 1 } },
        animation: 'attacking'
    }),

    "arthur_defensive": Skill.generate({
        id: "arthur_defensive",
        name: "Holy Aura",
        type: "DEFENSIVE",
        description: "Revive a fallen ally if dice matches history (Once per battle).",
        targeting: { scope: 'DEAD_ALLIES', max: 1 },
        logic: { historyMatch: true, once: true },
    }),

    // --- ARCHER ---
    "archer_offensive": Skill.generate({
        id: "archer_offensive",
        name: "Quick Shot",
        type: "OFFENSIVE",
        description: "1 DMG. Only hits if first to act. (-1 Speed).",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { onlyFirst: true }, // New Logic Check
        execution: {
            damage: { amount: 1 },
            meta: { speedDebuffIfFirst: true }
        },
        animation: 'attacking'
    }),

    "archer_defensive": Skill.generate({
        id: "archer_defensive",
        name: "Trap Setting",
        type: "DEFENSIVE",
        description: "Deal 1 DMG to enemy if dice is Even.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { dice: { parity: 'even' } },
        execution: { damage: { amount: 1 } }
    }),

    // --- ARCHITECT ---
    "architect_offensive": Skill.generate({
        id: "architect_offensive",
        name: "Fortify",
        type: "OFFENSIVE",
        description: "Give an ally +2 Defense.",
        targeting: { scope: 'ALLIES', max: 1 },
        logic: {},
        execution: { buff: { stat: 'defense', amount: 2 } },
        animation: 'buff'
    }),

    "architect_defensive": Skill.generate({
        id: "architect_defensive",
        name: "Collapse",
        type: "DEFENSIVE",
        description: "Deal DMG equal to Dice (Once per battle).",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { dice: { min: 4 }, once: true },
        execution: { damage: { scaleWithDice: true } }
    }),

    // --- ENEMIES ---

    // REBEL: Multi-Attack (Complex dynamic targeting)
    // [MANUAL IMPLEMENTATION]
    "rebel_offensive": new Skill({
        id: "rebel_offensive",
        name: "Multi-Attack",
        type: "OFFENSIVE",
        description: "1 DMG. If dice <= 3, 2 DMG to another.",
        maxTargets: (context) => context.dice <= 3 ? 2 : 1,
        animation: 'attacking',
        checkConditions: (context) => true,
        getTargets: (context) => Skill.ResolveScope('ENEMIES', context), // Use new standard scope
        execute: (targets, context) => {
            const t1 = targets[0];
            // Fix: t1.takeDamage -> Skill.ApplyDamage
            Skill.ApplyDamage([t1], 1, context);
            let log = `Rebel attacks ${t1.name} (1 DMG).`;

            if (targets.length > 1) {
                const t2 = targets[1];
                Skill.ApplyDamage([t2], 2, context);
                log += ` And frenzies on ${t2.name} (2 DMG)!`;
            }
            return { log };
        }
    }),

    // REBEL: Desperation (Self Damage)
    // [MANUAL IMPLEMENTATION]
    "rebel_defensive": new Skill({
        id: "rebel_defensive",
        name: "Desperation",
        type: "DEFENSIVE",
        description: "Take 1 DMG to deal 1 DMG, unless dice is 1.",
        checkConditions: (context) => context.dice !== 1,
        getTargets: (context) => Skill.ResolveScope('ENEMIES', context),
        execute: (targets, context) => {
            const target = targets[0];
            const user = context.user;
            // Fix: takeDamage -> ApplyDamage
            Skill.ApplyDamage([target], 1, context);
            Skill.ApplyDamage([user], 1, context);
            return { log: `Rebel attacks recklessly! 1 DMG to ${target.name}, 1 DMG to self.` };
        }
    }),

    // DRAGON: Breath (Dynamic targeting All vs 1)
    // [MANUAL IMPLEMENTATION]
    "dragon_offensive": new Skill({
        id: "dragon_offensive",
        name: "Dragon Breath",
        type: "OFFENSIVE",
        description: "2 DMG. If dice 6, 2 DMG to ALL.",
        maxTargets: (context) => context.dice === 6 ? 99 : 1,
        checkConditions: (context) => true,
        getTargets: (context) => Skill.ResolveScope('ENEMIES', context),
        execute: (targets, context) => {
            const { dice } = context;

            // Fix: targets.forEach(takeDamage) -> Skill.ApplyDamage
            Skill.ApplyDamage(targets, 2, context);

            if (dice === 6) {
                return { log: `Dragon breathes fire! 2 DMG to ALL (${targets.length})!` };
            }
            return { log: `Dragon bites ${targets[0].name}. 2 DMG.` };
        }
    }),

    "dragon_defensive": Skill.generate({
        id: "dragon_defensive",
        name: "Hard scales",
        type: "DEFENSIVE",
        description: "+1 Defense if dice <= 3.",
        targeting: { scope: 'SELF' },
        logic: { dice: { max: 3 } },
        execution: { buff: { stat: 'defense', amount: 1 } }
    }),

    // --- STANDARD SKILLS (Generated) ---
    "std_heavy_strike": Skill.generate({
        id: "std_heavy_strike",
        name: "Heavy Strike",
        type: "OFFENSIVE",
        description: "Deal 3 DMG if Dice >= 4.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { dice: { min: 4 } },
        execution: { damage: { amount: 3 } }
    }),
    "std_quick_jab": Skill.generate({
        id: "std_quick_jab",
        name: "Quick Jab",
        type: "OFFENSIVE",
        description: "Deal 1 DMG.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: {},
        execution: { damage: { amount: 1 } }
    }),
    "std_shield_bash": Skill.generate({
        id: "std_shield_bash",
        name: "Shield Bash",
        type: "OFFENSIVE",
        description: "Deal 2 DMG if Dice is Even.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { dice: { parity: 'even' } },
        execution: { damage: { amount: 2 } }
    }),
    "std_group_heal": Skill.generate({
        id: "std_group_heal",
        name: "Group Heal",
        type: "DEFENSIVE",
        description: "Heal 1 HP to all allies if Dice is 6.",
        targeting: { scope: 'ALLIES', max: 4 },
        logic: { dice: { exact: 6 } },
        execution: { heal: { amount: 1 } },
        animation: 'healing'
    }),
    "std_berserk": Skill.generate({
        id: "std_berserk",
        name: "Berserk",
        type: "DEFENSIVE",
        description: "+2 Speed to Self (Once per battle).",
        targeting: { scope: 'SELF' },
        logic: { once: true },
        execution: { buff: { stat: 'speed', amount: 2 } }
    }),
    "std_snipe": Skill.generate({
        id: "std_snipe",
        name: "Snipe",
        type: "OFFENSIVE",
        description: "Deal 5 DMG if Dice is 6.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { dice: { exact: 6 } },
        execution: { damage: { amount: 5 } }
    }),
    "std_wide_sweep": Skill.generate({
        id: "std_wide_sweep",
        name: "Wide Sweep",
        type: "OFFENSIVE",
        description: "Deal 1 DMG to 2 enemies if Dice >= 3.",
        targeting: { scope: 'ENEMIES', max: 2 },
        logic: { dice: { min: 3 } },
        execution: { damage: { amount: 1 } }
    }),
    "std_inner_focus": Skill.generate({
        id: "std_inner_focus",
        name: "Inner Focus",
        type: "DEFENSIVE",
        description: "+1 Defense if Dice is Odd.",
        targeting: { scope: 'SELF' },
        logic: { dice: { parity: 'odd' } },
        execution: { buff: { stat: 'defense', amount: 1 } }
    }),

    // --- NEW HERO SKILLS ---

    // ELARA (Assassin)
    "elara_offensive": Skill.generate({
        id: "elara_offensive",
        name: "Shadow Strike",
        type: "OFFENSIVE",
        description: "Deal 4 DMG if Dice >= 5.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: { dice: { min: 5 } },
        execution: { damage: { amount: 4 } }
    }),
    "elara_passive": new Skill({
        id: "elara_passive",
        name: "Blur",
        type: "DEFENSIVE",
        description: "Dodge attack (0 DMG) if Dice is 1.",
        trigger: "Skill:CausingDamage",
        limitPerTurn: 99, // Passive, can happen multiple times? Or once? Let's say once per turn to be safe.
        checkConditions: (context) => {
            // target is user, dice is 1
            const isTargeted = context.targets?.some(t => t.id === context.user.id);
            const dice = context.context?.dice;
            return isTargeted && dice === 1;
        },
        getTargets: (context) => [context.user],
        execute: (targets, context) => {
            context.amount = 0;
            return { log: "Elara blurs! Attack dodged." };
        }
    }),

    // THORN (Tank)
    "thorn_defensive": Skill.generate({
        id: "thorn_defensive",
        name: "Bunker Down",
        type: "DEFENSIVE",
        description: "+3 Defense.",
        targeting: { scope: 'SELF' },
        logic: {},
        execution: { buff: { stat: 'defense', amount: 3 } }
    }),
    "thorn_passive": new Skill({
        id: "thorn_passive",
        name: "Spiked Armor",
        type: "DEFENSIVE",
        description: "Deal 1 DMG to attacker when hit.",
        trigger: "Skill:TakeDamage",
        limitPerTurn: 99,
        checkConditions: (context) => context.target?.id === context.user.id && context.source,
        getTargets: (context) => [context.source],
        execute: (targets, context) => {
            Skill.ApplyDamage(targets, 1, context.context || {}, { source: context.user }); // Use context.context for combat context?
            // Actually 'context' in execute for passive is the event payload. 
            // ApplyDamage needs a combat context for EventBus? 
            // In `Skill.js` ApplyDamage uses `bus` imported globally. 
            // The `context` arg in ApplyDamage is mostly for passing through to events.
            // We should try to pass the original combat context if available, or just a mock if strictly needed for dice?
            // ApplyDamage doesn't strictly need dice.
            return { log: "Thorn's spikes pierce the attacker! (1 DMG)" };
        }
    }),

    // SIEGFRIED (Dragon Slayer)
    "siegfried_offensive": new Skill({
        id: "siegfried_offensive",
        name: "Balmung",
        type: "OFFENSIVE",
        description: "4 DMG. If Dice is 6, deal 6 DMG.",
        targeting: { scope: 'ENEMIES', max: 1 },
        // logic: { dice: { min: 1 } }, // Always hits? Or standard hit chances? Assuming standard hit for now, or always hit.
        // Let's assume it always hits if manually implemented, unless we verify logic.
        // But since we want custom damage scaling:
        checkConditions: (context) => true, // Always valid to cast? Or maybe min dice?
        // Let's add standard miss chance implicitly? No, 'Balmung' sounds like it hits. 
        // But most heavy attacks have a floor. Let's say it always hits for now to keep it simple, or maybe min 2?
        // Prototype didn't specify hit chance, just "4 DMG".
        getTargets: (context) => Skill.ResolveScope('ENEMIES', context),
        execute: (targets, context) => {
            const dice = context.dice;
            const damage = dice === 6 ? 6 : 4;
            Skill.ApplyDamage(targets, damage, context);
            return { log: `Siegfried swings Balmung! ${damage} DMG.` };
        }
    }),

    "siegfried_passive": new Skill({
        id: "siegfried_passive",
        name: "Dragon Blood",
        type: "DEFENSIVE",
        description: "-1 DMG taken. WEAKNESS: If attacker rolled 1, take +2 DMG instead.",
        trigger: "Skill:CausingDamage",
        limitPerTurn: 99,
        checkConditions: (context) => {
            // Context is the event payload: { targets, amount, context: combatContext, ... }
            // Trigger if We (Siegfried) are a target.
            return context.targets && context.targets.some(t => t.id === context.user.id);
        },
        getTargets: (context) => [context.user],
        execute: (targets, context) => {
            // context.context is the combat context from the Source of the damage
            const attackerDice = context.context ? context.context.dice : 0;

            if (attackerDice === 1) {
                context.amount += 2;
                return { log: "The Leaf Spot is hit! Dragon Blood fails (+2 DMG)." };
            } else {
                const original = context.amount;
                context.amount = Math.max(0, context.amount - 1);
                // Only log if it actually reduced damage
                if (original > context.amount) {
                    return { log: "Dragon Blood hardens (-1 DMG)." };
                }
                return { log: "Dragon Blood active (No reduction)." };
            }
        }
    }),

    // --- NEW ENEMY SKILLS ---

    // SHADOW STALKER
    "shadow_offensive": Skill.generate({
        id: "shadow_offensive",
        name: "Backstab",
        type: "OFFENSIVE",
        description: "3 DMG. If first to act, +2 DMG.",
        targeting: { scope: 'ENEMIES', max: 1 },
        logic: {},
        execution: { damage: { amount: 3 } } // Simplified for now, complex conditional damage needs more factory support or manual
    }),

    // IRON GOLEM
    "golem_offensive": Skill.generate({
        id: "golem_offensive",
        name: "Ground Slam",
        type: "OFFENSIVE",
        description: "2 DMG to 2 Targets.",
        targeting: { scope: 'ENEMIES', max: 2 },
        logic: {},
        execution: { damage: { amount: 2 } }
    }),
    "golem_passive": new Skill({ // Hardened skin
        id: "golem_passive",
        name: "Iron Skin",
        type: "DEFENSIVE",
        description: "Reduce all incoming damage by 1.",
        trigger: "Skill:CausingDamage",
        limitPerTurn: 99,
        checkConditions: (context) => context.targets?.some(t => t.id === context.user.id) && context.amount > 0,
        getTargets: (context) => [context.user],
        execute: (targets, context) => {
            context.amount = Math.max(0, context.amount - 1);
            return { log: "Iron Golem resists the blow (-1 DMG)." };
        }
    }),

    // --- PASSIVE SKILLS ---
    // --- PASSIVE SKILLS ---
    "std_counter": new Skill({
        id: "std_counter",
        name: "Counter Attack",
        type: "BOTH", // Passive doesn't strictly adhere to OFFENSIVE/DEFENSIVE types for triggers
        description: "Deal 1 DMG back to attacker when taking damage.",
        trigger: "Skill:TakeDamage",
        limitPerTurn: 1, // Once per turn/round of triggers
        checkConditions: (context) => {
            // Context contains event payload merged.
            // context.target is the Victim. context.user is the Owner of this skill.
            // We only counter if WE took damage.
            return context.target && context.target.id === context.user.id && context.source;
        },
        getTargets: (context) => [context.source], // Target the attacker
        execute: (targets, context) => {
            // Case A: Standard Counter. I (context.user) am hitting back.
            // Implicit Source: context.user (Me).
            Skill.ApplyDamage(targets, 1, context);
            return { log: `${context.user.name} counters! 1 DMG to ${targets[0].name}.` };
        }
    }),

    // Example 1: Riposte (Explicit Source = User)
    "passive_riposte": new Skill({
        id: "passive_riposte",
        name: "Riposte",
        type: "DEFENSIVE",
        description: "Parry and strike back! (Explicit Source: Self)",
        trigger: "Skill:TakeDamage",
        limitPerTurn: 1,
        checkConditions: (context) => context.target?.id === context.user.id && context.source,
        getTargets: (context) => [context.source],
        execute: (targets, context) => {
            // Explicitly stating 'source: context.user' ensures I am the damage dealer.
            // Even if ApplyDamage defaults to this, being explicit documents intent.
            Skill.ApplyDamage(targets, 2, context, { source: context.user });
            return { log: `${context.user.name} ripostes! 2 DMG.` };
        }
    }),

    // Example 2: Mirror Shield (Source = Original Attacker)
    "passive_mirror_shield": new Skill({
        id: "passive_mirror_shield",
        name: "Mirror Shield",
        type: "DEFENSIVE",
        description: "Reflects the attack. (Source: Attacker)",
        trigger: "Skill:TakeDamage",
        limitPerTurn: 1,
        checkConditions: (context) => context.target?.id === context.user.id && context.source,
        getTargets: (context) => [context.source],
        execute: (targets, context) => {
            // We attribute the damage AS IF it came from the attacker themselves.
            // This might trigger the attacker's own "Protection from Self" or bypass "Protection from Enemies".
            // It prevents the Reflector from triggering "On Hit" effects (like Life Steal) because they didn't technically "hit".
            Skill.ApplyDamage(targets, context.amount, context, { source: context.source });
            return { log: `${context.user.name}'s Mirror Shield reflects ${context.amount} DMG back to ${targets[0].name}!` };
        }
    }),

    // Example 3: Divine Retribution (Source = Environment/Deity)
    "passive_karmic_retribution": new Skill({
        id: "passive_karmic_retribution",
        name: "Karmic Retribution",
        type: "DEFENSIVE",
        description: "The universe punshes aggression. (Source: FATE)",
        trigger: "Skill:TakeDamage",
        limitPerTurn: 1,
        checkConditions: (context) => context.target?.id === context.user.id && context.source,
        getTargets: (context) => [context.source],
        execute: (targets, context) => {
            // Attributes damage to a neutral/external source.
            // Neither the User nor the Attacker is the source.
            // Useful for environmental effects or true damage that shouldn't trigger specific counters.
            const fateEntity = { id: 'fate', name: 'Fate' };
            Skill.ApplyDamage(targets, 3, context, { source: fateEntity });
            return { log: `${targets[0].name} suffers 3 DMG from Karmic Retribution.` };
        }
    })
};
