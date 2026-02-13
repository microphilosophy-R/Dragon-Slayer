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
        execution: { damage: { amount: 4 } }
    }),

    // Merlin Defensive: Complex mitigation logic (defense += 999).
    // Factory implementation doesn't support "buff amount" easily yet alongside "mitigate all".
    // Keeping manual but using standard methods.
    // reworked with simpler one: if the dice is 3 or less, 
    // Merlin Defensive: Reroll/Rewind Logic
    "merlin_defensive": Skill.generate({
        id: "merlin_defensive",
        name: "Clairvoyance",
        type: "DEFENSIVE",
        description: "Return to the previous turn (Reroll). Once per battle.",
        targeting: { scope: 'SELF' },
        logic: { once: true },
        execution: { reroll: true }
    }),

    // --- ARTHUR ---
    "arthur_offensive": Skill.generate({
        id: "arthur_offensive",
        name: "Righteous Strike",
        type: "OFFENSIVE",
        description: "1 DMG if dice >= 4.",
        targeting: { scope: 'ENEMIES' },
        logic: { dice: { min: 4 } },
        execution: { damage: { amount: 1 } }
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
        }
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
        execution: { buff: { stat: 'defense', amount: 2 } }
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
        execution: { heal: { amount: 1 } }
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
    })
};
