import { Skill } from '../models/Skill';

export const SKILL_CABINET = {
    // --- MERLIN ---
    "merlin_offensive": new Skill({
        id: "merlin_offensive",
        name: "Fireball",
        type: "OFFENSIVE",
        description: "4 DMG if dice is 6.",
        targetingMode: 'MANUAL',
        maxTargets: 1,
        checkConditions: (context) => true,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const { dice } = context;
            const target = targets[0];
            if (!target) return { log: "No target found." };

            if (dice === 6) {
                target.takeDamage(4);
                return { log: `Merlin casts Fireball! 4 DMG to ${target.name}.` };
            }
            return { log: `Merlin charges magic... (Dice ${dice})` };
        }
    }),
    "merlin_defensive": new Skill({
        id: "merlin_defensive",
        name: "Clairvoyance",
        type: "DEFENSIVE",
        description: "If dice is 6, mitigate all damage.",
        checkConditions: (context) => context.dice === 6,
        getTargets: (context) => [context.user],
        execute: (targets, context) => {
            // Adds massive defense to trigger the Character.takeDamage mitigation (defense >= damage => 0 damage)
            const target = targets[0];
            target.defense += 999;
            return { log: "Merlin foresees the attack! (Mitigation active)" };
        }
    }),

    // --- ARTHUR ---
    "arthur_offensive": new Skill({
        id: "arthur_offensive",
        name: "Righteous Strike",
        type: "OFFENSIVE",
        description: "1 DMG if dice >= 4.",
        checkConditions: (context) => true,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const { dice } = context;
            const target = targets[0];
            if (dice >= 4) {
                target.takeDamage(1);
                return { log: `Arthur strikes with honor! 1 DMG to ${target.name}.` };
            }
            return { log: `Arthur misses.` };
        }
    }),
    "arthur_defensive": new Skill({
        id: "arthur_defensive",
        name: "Holy Aura",
        type: "DEFENSIVE",
        description: "Heal a random ally if dice matches history.",
        maxTargets: 1,
        checkConditions: (context) => {
            const { dice, history } = context;
            const occurrences = (history || []).filter(r => r === dice).length;
            return occurrences > 0;
        },
        getTargets: (context) => context.allies.filter(a => a.isAlive()),
        // Uses default random selection strategy
        execute: (targets, context) => {
            const target = targets[0];
            const healed = target.heal(999);
            return { log: `Arthur's aura shines! Healed ${target.name} for ${healed}.` };
        }
    }),

    // --- ARCHER ---
    "archer_offensive": new Skill({
        id: "archer_offensive",
        name: "Quick Shot",
        type: "OFFENSIVE",
        description: "1 DMG. If first to act, -1 Speed.",
        maxTargets: 1,
        checkConditions: (context) => true,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const { isFirst, user } = context;
            const target = targets[0];
            target.takeDamage(1);
            let log = `Archer fires! 1 DMG to ${target.name}.`;

            if (isFirst) {
                user.modifyStat('speed', -1);
                log += ` (Speed -1)`;
            }
            return { log };
        }
    }),
    "archer_defensive": new Skill({
        id: "archer_defensive",
        name: "Trap Setting",
        type: "DEFENSIVE",
        description: "Deal 1 DMG to enemy if dice is Even.",
        checkConditions: (context) => context.dice % 2 === 0,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const target = targets[0];
            target.takeDamage(1);
            return { log: `Archer's trap snaps! 1 DMG to ${target.name}.` };
        }
    }),

    // --- ARCHITECT ---
    "architect_offensive": new Skill({
        id: "architect_offensive",
        name: "Fortify",
        type: "OFFENSIVE",
        description: "Give an ally +2 Defense.",
        maxTargets: 1,
        checkConditions: (context) => true,
        getTargets: (context) => context.allies.filter(a => a.isAlive()),
        execute: (targets, context) => {
            const target = targets[0];
            target.modifyStat('defense', 2);
            return { log: `Architect fortifies ${target.name}. +2 Defense.` };
        }
    }),
    "architect_defensive": new Skill({
        id: "architect_defensive",
        name: "Collapse",
        type: "DEFENSIVE",
        description: "Deal DMG equal to Dice (Once per battle).",
        checkConditions: (context) => {
            const { dice, memory } = context;
            return !memory.architectUsed && dice >= 4;
        },
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const { dice, memory } = context;
            const target = targets[0];
            target.takeDamage(dice);
            memory.architectUsed = true;
            return { log: `Architect collapses the ceiling! ${dice} DMG to ${target.name}.` };
        }
    }),

    // --- ENEMIES ---

    // REBEL
    "rebel_offensive": new Skill({
        id: "rebel_offensive",
        name: "Multi-Attack",
        type: "OFFENSIVE",
        description: "1 DMG. If dice <= 3, 2 DMG to another.",
        // Dynamic max targets: 2 if dice <= 3, else 1
        maxTargets: (context) => context.dice <= 3 ? 2 : 1,
        checkConditions: (context) => true,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            // Targets have already been selected by Targeting phase (maxTargets applied)
            const t1 = targets[0];
            t1.takeDamage(1);
            let log = `Rebel attacks ${t1.name} (1 DMG).`;

            if (targets.length > 1) {
                const t2 = targets[1];
                t2.takeDamage(2);
                log += ` And frenzies on ${t2.name} (2 DMG)!`;
            }
            return { log };
        }
    }),
    "rebel_defensive": new Skill({
        id: "rebel_defensive",
        name: "Desperation",
        type: "DEFENSIVE",
        description: "Take 1 DMG to deal 1 DMG, unless dice is 1.",
        checkConditions: (context) => context.dice !== 1,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const target = targets[0];
            const user = context.user;
            target.takeDamage(1);
            user.takeDamage(1);
            return { log: `Rebel attacks recklessly! 1 DMG to ${target.name}, 1 DMG to self.` };
        }
    }),

    // DRAGON
    "dragon_offensive": new Skill({
        id: "dragon_offensive",
        name: "Dragon Breath",
        type: "OFFENSIVE",
        description: "2 DMG. If dice 6, 2 DMG to ALL.",
        // Dynamic max targets: All (99) if dice 6, else 1
        maxTargets: (context) => context.dice === 6 ? 99 : 1,
        checkConditions: (context) => true,
        getTargets: (context) => context.enemies.filter(e => e.isAlive()),
        execute: (targets, context) => {
            const { dice } = context;

            targets.forEach(t => t.takeDamage(2));

            if (dice === 6) {
                return { log: `Dragon breathes fire! 2 DMG to ALL (${targets.length})!` };
            }
            return { log: `Dragon bites ${targets[0].name}. 2 DMG.` };
        }
    }),
    "dragon_defensive": new Skill({
        id: "dragon_defensive",
        name: "Hard scales",
        type: "DEFENSIVE",
        description: "+1 Defense if dice <= 3.",
        checkConditions: (context) => context.dice <= 3,
        getTargets: (context) => [context.user],
        execute: (targets, context) => {
            const user = context.user;
            user.modifyStat('defense', 1);
            return { log: `Dragon's scales harden. +1 Defense.` };
        }
    })
};
