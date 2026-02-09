
// Skill Cabinet - Central Registry of all skills
// Each skill is an object with:
// - id: unique identifier
// - name: display name
// - type: 'OFFENSIVE' (active turn) or 'DEFENSIVE' (opponent turn)
// - description: text description
// - execute: function(user, targets, context) -> { log: string, damage?: number, heal?: number, effects?: object }

export const SKILL_CABINET = {
    // --- MERLIN ---
    "merlin_offensive": {
        id: "merlin_offensive",
        name: "Fireball",
        type: "OFFENSIVE",
        description: "4 DMG if dice is 6.",
        execute: (user, targets, context) => {
            const { dice } = context;
            const target = targets[0]; // Single target by default
            if (dice === 6) {
                return {
                    log: `${user.name} casts Fireball! 4 DMG to ${target.name}.`,
                    actions: [{ type: 'DAMAGE', targetId: target.id, amount: 4 }]
                };
            }
            return { log: `${user.name} charges magic... (Dice ${dice})`, actions: [] };
        }
    },
    "merlin_defensive": {
        id: "merlin_defensive",
        name: "Clairvoyance",
        type: "DEFENSIVE",
        description: "If dice is 6 (Critical Threat), prevent action.",
        execute: (user, targets, context) => {
            const { dice } = context;
            // Merlin's defensive: "If you are the first to take action..." -> Original was initiative based.
            // New requirement: Defensive skill acts on opponent turn.
            // Let's interpret: If opponent rolls a 6 (Crit), Merlin foresees it and mitigates?
            if (dice === 6) {
                return {
                    log: `${user.name} foresees the danger! Mitigates the incoming critical hit.`,
                    actions: [{ type: 'MITIGATE', amount: 100 }] // Mitigate all damage
                };
            }
            return { log: null, actions: [] };
        }
    },

    // --- ARTHUR ---
    "arthur_offensive": {
        id: "arthur_offensive",
        name: "Righteous Strike",
        type: "OFFENSIVE",
        description: "1 DMG if dice >= 4.",
        execute: (user, targets, context) => {
            const { dice } = context;
            const target = targets[0];
            if (dice >= 4) {
                return {
                    log: `${user.name} strikes with honor! 1 DMG to ${target.name}.`,
                    actions: [{ type: 'DAMAGE', targetId: target.id, amount: 1 }]
                };
            }
            return { log: `${user.name} misses.`, actions: [] };
        }
    },
    "arthur_defensive": {
        id: "arthur_defensive",
        name: "Holy Aura",
        type: "DEFENSIVE",
        description: "Heal a random ally if dice matches history.",
        // Original: "Record dice result. Fully heal if repeated."
        execute: (user, targets, context) => {
            const { dice, history, allies } = context;
            // Check for repeat
            const occurrences = history.filter(r => r === dice).length;
            if (occurrences > 1) { // 1 is current, >1 means repeated
                // Heal random ally
                const ally = allies[Math.floor(Math.random() * allies.length)];
                return {
                    log: `${user.name}'s aura shines! Fully heals ${ally.name}.`,
                    actions: [{ type: 'HEAL', targetId: ally.id, amount: 999 }]
                };
            }
            return { log: null, actions: [] };
        }
    },

    // --- ARCHER ---
    "archer_offensive": {
        id: "archer_offensive",
        name: "Quick Shot",
        type: "OFFENSIVE",
        description: "1 DMG. If first to act, -1 Speed.",
        execute: (user, targets, context) => {
            const { isFirst } = context;
            const target = targets[0];
            const actions = [{ type: 'DAMAGE', targetId: target.id, amount: 1 }];
            let log = `${user.name} fires! 1 DMG.`;

            if (isFirst) {
                actions.push({ type: 'MODIFY_STAT', targetId: user.id, stat: 'speed', amount: -1 });
                log += ` (Speed -1)`;
            }
            return { log, actions };
        }
    },
    "archer_defensive": {
        id: "archer_defensive",
        name: "Trap Setting",
        type: "DEFENSIVE",
        description: "Deal 1 DMG to enemy if dice is Even.",
        execute: (user, targets, context) => {
            // Defensive: Used on Enemy Turn. Target is likely the Enemy acting.
            const { dice } = context;
            const target = targets[0]; // The enemy
            if (dice % 2 === 0) {
                return {
                    log: `${user.name}'s trap triggers! 1 DMG to ${target.name}.`,
                    actions: [{ type: 'DAMAGE', targetId: target.id, amount: 1 }]
                };
            }
            return { log: null, actions: [] };
        }
    },

    // --- ARCHITECT ---
    "architect_offensive": {
        id: "architect_offensive",
        name: "Fortify",
        type: "OFFENSIVE",
        description: "Give an ally +2 Defense.",
        execute: (user, targets, context) => {
            // Target: Random Ally or Selected? Let's pick Random Ally for now to keep it simple or pass in target.
            // Context should provide allies to pick from if no explicit target
            const { allies } = context;
            const target = allies[Math.floor(Math.random() * allies.length)];
            return {
                log: `${user.name} fortifies ${target.name}. +2 Defense.`,
                actions: [{ type: 'BUFF', targetId: target.id, stat: 'defense', amount: 2 }]
            };
        }
    },
    "architect_defensive": {
        id: "architect_defensive",
        name: "Collapse",
        type: "DEFENSIVE",
        description: "Deal DMG equal to Dice (Once per battle).",
        execute: (user, targets, context) => {
            const { dice, memory } = context; // Memory to store "used" state
            const target = targets[0];
            if (!memory.architectUsed) {
                if (dice >= 4) { // Only trigger on high rolls to be worth it? Or always? Let's say >= 4 for strategy
                    return {
                        log: `${user.name} collapses the ceiling! ${dice} DMG to ${target.name}.`,
                        actions: [
                            { type: 'DAMAGE', targetId: target.id, amount: dice },
                            { type: 'MEMORY', key: 'architectUsed', value: true }
                        ]
                    };
                }
            }
            return { log: null, actions: [] };
        }
    },

    // --- ENEMIES ---

    // REBEL
    "rebel_offensive": {
        id: "rebel_offensive",
        name: "Multi-Attack",
        type: "OFFENSIVE",
        description: "1 DMG. If dice <= 3, 2 DMG to another.",
        execute: (user, targets, context) => {
            const { dice } = context;
            // Targets: Heroes. 
            // Pick random
            const t1 = targets[Math.floor(Math.random() * targets.length)];
            const actions = [{ type: 'DAMAGE', targetId: t1.id, amount: 1 }];
            let log = `${user.name} attacks ${t1.name} (1 DMG).`;

            if (dice <= 3 && targets.length > 1) {
                const others = targets.filter(t => t.id !== t1.id);
                if (others.length > 0) {
                    const t2 = others[Math.floor(Math.random() * others.length)];
                    actions.push({ type: 'DAMAGE', targetId: t2.id, amount: 2 });
                    log += ` And frenzies on ${t2.name} (2 DMG)!`;
                }
            }
            return { log, actions };
        }
    },
    "rebel_defensive": {
        id: "rebel_defensive",
        name: "Desperation",
        type: "DEFENSIVE",
        description: "Take 1 DMG to deal 1 DMG, unless dice is 1.",
        execute: (user, targets, context) => {
            // Target: The hero acting? Or random hero?
            // Defensive usually reacts to the actor.
            const { dice } = context;
            const target = targets[0]; // The hero acting
            if (dice !== 1) {
                return {
                    log: `${user.name} counter-attacks! 1 DMG to ${target.name}, 1 DMG to self.`,
                    actions: [
                        { type: 'DAMAGE', targetId: target.id, amount: 1 },
                        { type: 'DAMAGE', targetId: user.id, amount: 1 }
                    ]
                };
            }
            return { log: null, actions: [] };
        }
    },

    // DRAGON
    "dragon_offensive": {
        id: "dragon_offensive",
        name: "Dragon Breath",
        type: "OFFENSIVE",
        description: "2 DMG. If dice 6, 2 DMG to ALL.",
        execute: (user, targets, context) => {
            const { dice } = context;
            if (dice === 6) {
                const actions = targets.map(t => ({ type: 'DAMAGE', targetId: t.id, amount: 2 }));
                return {
                    log: `${user.name} breathes fire! 2 DMG to ALL!`,
                    actions
                };
            }
            // Normal attack
            const t1 = targets[Math.floor(Math.random() * targets.length)];
            return {
                log: `${user.name} bites ${t1.name}. 2 DMG.`,
                actions: [{ type: 'DAMAGE', targetId: t1.id, amount: 2 }]
            };
        }
    },
    "dragon_defensive": {
        id: "dragon_defensive",
        name: "Hard scales",
        type: "DEFENSIVE",
        description: "+1 Defense if dice <= 3.",
        execute: (user, targets, context) => {
            const { dice } = context;
            if (dice <= 3) {
                return {
                    log: `${user.name}'s scales harden. +1 Defense.`,
                    actions: [{ type: 'BUFF', targetId: user.id, stat: 'defense', amount: 1 }]
                };
            }
            return { log: null, actions: [] };
        }
    }
};
