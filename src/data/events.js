import { Event } from '../models/Event';
import { SKILL_CABINET } from './skills';

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const EVENTS = [
    // --- MIGRATED EVENTS ---
    new Event({
        id: 'blessings',
        name: 'Divine Blessings',
        description: 'A warm light bathes the hall. The gods offer their aid.',
        options: [
            {
                label: '2 Random Heroes +1 HP',
                action: (context) => {
                    const roster = [...context.roster];
                    const indices = [];
                    while (indices.length < 2 && indices.length < roster.length) {
                        const r = Math.floor(Math.random() * roster.length);
                        if (!indices.includes(r)) indices.push(r);
                    }
                    const names = [];
                    indices.forEach(idx => {
                        // Create a shallow copy of the character to mutate safely if needed, 
                        // event handler in MainHall will likely handle state update
                        // But here we rely on the context.updateRoster to separate concerns? 
                        // Actually, let's return a modified roster or let the caller handle it.
                        // The plan said "returns message, updates?". 
                        // Let's modify the roster clones here and return the new roster.

                        // NOTE: MainHall needs to pass a CLONE of roster to context to avoid direct mutation of state
                        roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                        roster[idx].hp = Math.min(roster[idx].hp + 1, roster[idx].maxHp); // Cap at maxHp? limit was 99 in original
                        roster[idx].maxHp = Math.min(roster[idx].maxHp + 1, 99);
                        // Re-cap HP if max increased? Original logic: hp+1, maxHp+1.
                        names.push(roster[idx].name);
                    });
                    return {
                        message: `The gods smile. ${names.join(' and ')} gained +1 Health.`,
                        roster: roster
                    };
                }
            },
            {
                label: '1 Random Hero +1 Speed',
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                    roster[idx].speed = Math.min(roster[idx].speed + 1, 9);
                    return {
                        message: `${roster[idx].name} feels lighter. Gained +1 Speed.`,
                        roster: roster
                    };
                }
            },
            {
                label: '1 Random Hero +3 HP, -1 Speed',
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                    roster[idx].hp = Math.min(roster[idx].hp + 3, 99);
                    roster[idx].maxHp = Math.min(roster[idx].maxHp + 3, 99);
                    roster[idx].speed = Math.max(roster[idx].speed - 1, 1);
                    return {
                        message: `${roster[idx].name} is imbued with heavy power. +3 HP, -1 Speed.`,
                        roster: roster
                    };
                }
            }
        ]
    }),
    new Event({
        id: 'faith',
        name: 'Fever of Faith',
        description: 'A frantic zealot demands a test of faith.',
        options: [
            {
                label: 'Roll the Dice (4+ for Mass Heal)',
                action: (context) => {
                    const roll = rollDice(6);
                    const roster = [...context.roster]; // Shallow copy array
                    let message = '';

                    if (roll >= 4) {
                        roster.forEach((c, i) => {
                            roster[i] = Object.assign(Object.create(Object.getPrototypeOf(c)), c);
                            roster[i].hp = Math.min(roster[i].hp + 1, 99);
                            roster[i].maxHp = Math.min(roster[i].maxHp + 1, 99);
                        });
                        message = `Faith rewarded! Dice: ${roll}. All heroes gained +1 Health.`;
                    } else {
                        const idx = Math.floor(Math.random() * roster.length);
                        roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                        roster[idx].speed = Math.max(roster[idx].speed - 2, 1);
                        message = `Faith tested. Dice: ${roll}. ${roster[idx].name} lost 2 Speed.`;
                    }
                    return { message, roster };
                }
            },
            {
                label: 'Walk Away',
                action: () => ({ message: "You chose not to tempt fate. Nothing happens." })
            }
        ]
    }),
    new Event({
        id: 'fortune',
        name: 'Wheel of Fortune',
        description: 'A mysterious traveler offers to rewrite destiny.',
        options: [
            {
                label: "Change One Hero's Defensive Skill",
                type: 'target',
                action: (context, targetId) => {
                    const roster = [...context.roster];
                    const targetIdx = roster.findIndex(c => c.id === targetId);
                    if (targetIdx === -1) return { message: "Error: Hero not found." };

                    roster[targetIdx] = Object.assign(Object.create(Object.getPrototypeOf(roster[targetIdx])), roster[targetIdx]);

                    const others = roster.filter(c => c.id !== targetId);
                    if (others.length === 0) return { message: "Not enough heroes to swap skill." };

                    const sourceChar = others[Math.floor(Math.random() * others.length)];

                    // Transfer Defensive Skill
                    roster[targetIdx].defensiveSkillId = sourceChar.defensiveSkillId;
                    roster[targetIdx].defensiveDesc = sourceChar.defensiveDesc || SKILL_CABINET[sourceChar.defensiveSkillId]?.description;

                    return {
                        message: `${roster[targetIdx].name} lost their old ways and learned ${sourceChar.name}'s defensive skill.`,
                        roster: roster
                    };
                }
            },
            {
                label: "Steal Knowledge at a Cost",
                type: 'target',
                action: (context, targetId) => {
                    const roster = [...context.roster];
                    const targetIdx = roster.findIndex(c => c.id === targetId);
                    if (targetIdx === -1) return { message: "Error: Hero not found." };

                    roster[targetIdx] = Object.assign(Object.create(Object.getPrototypeOf(roster[targetIdx])), roster[targetIdx]);

                    const others = roster.filter(c => c.id !== targetId);
                    if (others.length === 0) return { message: "Not enough heroes to steal from." };

                    const sourceChar = others[Math.floor(Math.random() * others.length)];
                    const sourceIdx = roster.findIndex(c => c.id === sourceChar.id);
                    roster[sourceIdx] = Object.assign(Object.create(Object.getPrototypeOf(roster[sourceIdx])), roster[sourceIdx]); // Clone victim too

                    roster[targetIdx].defensiveSkillId = sourceChar.defensiveSkillId;
                    roster[targetIdx].defensiveDesc = sourceChar.defensiveDesc;

                    roster[sourceIdx].defensiveSkillId = null;
                    roster[sourceIdx].defensiveDesc = "None (Lost to Fortune)";

                    return {
                        message: `${roster[targetIdx].name} learned from ${sourceChar.name}. But ${sourceChar.name} forgot their skill in the chaos.`,
                        roster: roster
                    };
                }
            }
        ]
    }),

    // --- NEW RANDOM EVENTS ---
    new Event({
        id: 'minstrel',
        name: 'Wandering Minstrel',
        description: 'A bard plays a soothing melody, lifting spirits.',
        options: [
            {
                label: 'Listen (Heal Party)',
                action: (context) => {
                    const roster = context.roster.map(c => {
                        const clone = Object.assign(Object.create(Object.getPrototypeOf(c)), c);
                        clone.hp = Math.min(clone.hp + 2, clone.maxHp);
                        return clone;
                    });
                    return { message: "The music soothes the soul. Party healed +2 HP.", roster };
                }
            },
            {
                label: 'Ignore',
                action: () => ({ message: "You walk past the minstrel, focused on your goal." })
            }
        ]
    }),
    new Event({
        id: 'lost_purse',
        name: 'Lost Purse',
        description: 'You find a heavy purse dropped on the floor.',
        options: [
            {
                label: 'Take it (Gain Gold)', // Assuming gold exists or generic luck? 
                // Wait, we don't have gold in context yet. Let's give a small buff or item.
                // Or just flavor for now? Let's give HP to a random hero (bought food).
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                    roster[idx].maxHp += 2;
                    roster[idx].hp += 2;
                    return { message: `Found gold! ${roster[idx].name} bought a hearty meal. +2 Max HP.`, roster };
                }
            },
            {
                label: 'Leave it',
                action: () => ({ message: "You leave the purse for its owner." })
            }
        ]
    }),
    new Event({
        id: 'arm_wrestling',
        name: 'Arm Wrestling Challenge',
        description: 'A burly warrior challenges your strongest to verify their might.',
        options: [
            {
                label: 'Accept Challenge',
                action: (context) => {
                    const roster = [...context.roster];
                    // Find highest HP char? Or random?
                    // Let's pick random.
                    const idx = Math.floor(Math.random() * roster.length);
                    const hero = roster[idx];
                    const win = Math.random() > 0.4; // 60% win rate

                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(hero)), hero);

                    if (win) {
                        roster[idx].maxHp += 2;
                        return { message: `${hero.name} won the match! Gained +2 Max HP.`, roster };
                    } else {
                        roster[idx].hp = Math.max(1, roster[idx].hp - 2);
                        return { message: `${hero.name} lost and strained a muscle. -2 HP.`, roster };
                    }
                }
            }
        ]
    }),
    new Event({
        id: 'old_beggar',
        name: 'Old Beggar',
        description: 'An old man asks for a coin.',
        options: [
            {
                label: 'Give Coin (Lose HP, Gain Speed)',
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                    roster[idx].hp = Math.max(1, roster[idx].hp - 1);
                    roster[idx].speed = Math.min(roster[idx].speed + 1, 9);
                    return { message: `${roster[idx].name} gave food. Good karma lightens the step. -1 HP, +1 Speed.`, roster };
                }
            },
            {
                label: 'Shoo him away',
                action: () => ({ message: "The beggar leaves, muttering." })
            }
        ]
    }),
    new Event({
        id: 'strange_potion',
        name: 'Strange Potion',
        description: 'A vial of glowing purple liquid sits on a table.',
        options: [
            {
                label: 'Drink it',
                type: 'target',
                action: (context, targetId) => {
                    const roster = [...context.roster];
                    const targetIdx = roster.findIndex(c => c.id === targetId);
                    if (targetIdx === -1) return { message: "Hero not found." };

                    roster[targetIdx] = Object.assign(Object.create(Object.getPrototypeOf(roster[targetIdx])), roster[targetIdx]);

                    const roll = Math.random();
                    if (roll < 0.33) {
                        roster[targetIdx].maxHp += 5;
                        roster[targetIdx].hp += 5;
                        return { message: "It was a Potion of Vitality! +5 Max HP.", roster };
                    } else if (roll < 0.66) {
                        roster[targetIdx].hp = Math.max(1, roster[targetIdx].hp - 5);
                        return { message: "It was poison! -5 HP.", roster };
                    } else {
                        roster[targetIdx].speed = Math.min(roster[targetIdx].speed + 2, 9);
                        return { message: "It tasted like coffee. +2 Speed.", roster };
                    }
                }
            },
            {
                label: 'Discard it',
                action: () => ({ message: "Better safe than sorry." })
            }
        ]
    }),
    new Event({
        id: 'training_dummy',
        name: 'Training Dummy',
        description: 'An unused training dummy stands in the corner.',
        options: [
            {
                label: 'Practice (Gain XP/HP)',
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                    roster[idx].maxHp += 1;
                    return { message: `${roster[idx].name} practiced some moves. +1 Max HP.`, roster };
                }
            }
        ]
    }),
    new Event({
        id: 'map_merchant',
        name: 'Map Merchant',
        description: 'A shady figure tries to sell you a "treasure map".',
        options: [
            {
                label: 'Buy it (Lose Speed, Gain Fortune?)',
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);

                    // Trade speed (time/money abstract) for unknown benefit?
                    // Let's just make it a gamble
                    roster[idx].speed = Math.max(1, roster[idx].speed - 1);

                    if (Math.random() > 0.5) {
                        roster[idx].maxHp += 4;
                        return { message: "The map led to a hidden cache! +4 Max HP, -1 Speed (Travel time).", roster };
                    } else {
                        return { message: "The map was a fake. You wasted time. -1 Speed.", roster };
                    }
                }
            },
            {
                label: 'Ignore',
                action: () => ({ message: "Not interested in scams today." })
            }
        ]
    }),
    new Event({
        id: 'local_brawl',
        name: 'Local Brawl',
        description: 'A fight breaks out in the tavern!',
        options: [
            {
                label: 'Join In',
                action: (context) => {
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);
                    roster[idx].hp = Math.max(1, roster[idx].hp - 2);
                    roster[idx].maxHp += 1; // Toughness
                    return { message: `${roster[idx].name} got a black eye but feels tougher. -2 HP, +1 Max HP.`, roster };
                }
            },
            {
                label: 'Watch',
                action: () => ({ message: "You watch the chaos unfold comfortably." })
            }
        ]
    }),
    new Event({
        id: 'quiet_prayer',
        name: 'Quiet Prayer',
        description: 'You find a small shrine in the hallway.',
        options: [
            {
                label: 'Pray',
                action: (context) => {
                    const roster = context.roster.map(c => {
                        const clone = Object.assign(Object.create(Object.getPrototypeOf(c)), c);
                        // Small heal for everyone
                        clone.hp = Math.min(clone.hp + 1, clone.maxHp);
                        return clone;
                    });
                    return { message: "A moment of peace. Everyone heals +1 HP.", roster };
                }
            }
        ]
    }),
    new Event({
        id: 'rat_problem',
        name: 'Rat Problem',
        description: 'Giant rats are chewing the supplies!',
        options: [
            {
                label: 'Exterminate',
                action: (context) => {
                    // Risk disease?
                    const roster = [...context.roster];
                    const idx = Math.floor(Math.random() * roster.length);
                    roster[idx] = Object.assign(Object.create(Object.getPrototypeOf(roster[idx])), roster[idx]);

                    if (Math.random() > 0.3) {
                        return { message: `${roster[idx].name} chased them off safely.` };
                    } else {
                        roster[idx].hp = Math.max(1, roster[idx].hp - 1);
                        return { message: `${roster[idx].name} got bitten! -1 HP.`, roster };
                    }
                }
            }
        ]
    }),
];
