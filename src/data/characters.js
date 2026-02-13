import { Character } from '../models/Character';

export const CHARACTERS = {
    // --- HEROES ---
    merlin: {
        id: 'merlin',
        name: 'Merlin',
        role: 'Wizard',
        hp: 4,
        maxHp: 4,
        speed: 6,
        skills: ['merlin_offensive', 'merlin_defensive'],
        description: 'A powerful wizard who controls fire.'
    },
    arthur: {
        id: 'arthur',
        name: 'Arthur',
        role: 'Knight',
        hp: 7,
        maxHp: 7,
        speed: 4,
        skills: ['arthur_offensive', 'arthur_defensive'],
        description: 'The righteous king with a holy aura.'
    },
    archer: {
        id: 'archer',
        name: 'Archer Chapanion',
        role: 'Ranger',
        hp: 5,
        maxHp: 5,
        speed: 8,
        skills: ['archer_offensive', 'archer_defensive'], // Fixed ID from 'archer_trap' to standard naming if exists, or alias
        description: 'A master marksman.'
    },
    architect: {
        id: 'architect',
        name: 'Royal Architect',
        role: 'Support',
        hp: 4,
        maxHp: 4,
        speed: 1,
        skills: ['architect_offensive', 'architect_defensive'], // Fixed IDs
        description: 'Builds and destroys fortifications.'
    },

    // --- STANDARD HEROES (Generated) ---
    valerius: {
        id: 'valerius',
        name: 'Sir Valerius',
        role: 'Knight',
        hp: 8,
        maxHp: 8,
        speed: 3,
        skills: ['std_heavy_strike', 'std_shield_bash'],
        description: 'A deeply armored shock trooper.'
    },
    lyra: {
        id: 'lyra',
        name: 'Lyra',
        role: 'Rogue',
        hp: 5,
        maxHp: 5,
        speed: 7,
        skills: ['std_quick_jab', 'std_wide_sweep'],
        description: 'A swift blade in the shadows.'
    },
    sylas: {
        id: 'sylas',
        name: 'Sylas',
        role: 'Cleric',
        hp: 5,
        maxHp: 5,
        speed: 2,
        skills: ['std_group_heal', 'std_inner_focus'],
        description: 'Heals wounds and braces for impact.'
    },
    grom: {
        id: 'grom',
        name: 'Grom',
        role: 'Berserker',
        hp: 10,
        maxHp: 10,
        speed: 5,
        skills: ['std_heavy_strike', 'std_berserk'],
        description: 'A warrior who trades defense for power.'
    },

    // --- ENEMIES ---
    rebel: {
        id: 'rebel',
        name: 'The Rebel Army',
        hp: 16,
        maxHp: 16,
        speed: 8,
        skills: ['rebel_offensive', 'rebel_defensive']
    },
    dragon: {
        id: 'dragon',
        name: 'The Red Dragon',
        hp: 28,
        maxHp: 28,
        speed: 5,
        skills: ['dragon_offensive', 'dragon_defensive']
    },

    // --- STANDARD ENEMIES (Generated) ---
    goblin_skirmisher: {
        id: 'goblin_skirmisher',
        name: 'Goblin Skirmisher',
        hp: 6,
        maxHp: 6,
        speed: 7,
        skills: ['std_quick_jab']
    },
    orc_warrior: {
        id: 'orc_warrior',
        name: 'Orc Warrior',
        hp: 12,
        maxHp: 12,
        speed: 3,
        skills: ['std_heavy_strike', 'std_shield_bash']
    },
    dark_cultist: {
        id: 'dark_cultist',
        name: 'Dark Cultist',
        hp: 8,
        maxHp: 8,
        speed: 4,
        skills: ['std_inner_focus', 'std_quick_jab']
    },
    bandit_leader: {
        id: 'bandit_leader',
        name: 'Bandit Leader',
        hp: 14,
        maxHp: 14,
        speed: 6,
        skills: ['std_berserk', 'std_wide_sweep']
    },

    rebel_grunt: {
        id: 'rebel_grunt',
        name: 'Rebel Grunt',
        hp: 10,
        maxHp: 10,
        speed: 4,
        skills: ['rebel_offensive', 'rebel_defensive'] // Reusing basic rebel skills for now
    }
};

export const getCharacter = (id) => {
    const data = CHARACTERS[id];
    if (!data) {
        console.warn(`Character data for ${id} not found.`);
        return null;
    }
    return new Character(data);
};

// getAllHeroes removed as requested. Use FACTIONS.PLAYER.roster to look up heroes.
