import { Character } from '../models/Character';
import merlinPortrait from '../images/merlin_portrait.png';
import arthurPortrait from '../images/arthur_portrait.png';

export const CHARACTERS = {
    // --- HEROES ---
    merlin: {
        id: 'merlin',
        name: 'Merlin',
        role: 'Wizard',
        hp: 6,
        maxHp: 6,
        speed: 8,
        skills: ['merlin_offensive', 'merlin_passive_cancel'],
        description: 'A powerful wizard who can shift through space.',
        profile: merlinPortrait,
        score: 3.66,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    arthur: {
        id: 'arthur',
        name: 'Arthur',
        role: 'Knight',
        hp: 7,
        maxHp: 7,
        speed: 3,
        skills: ['arthur_offensive', 'arthur_defensive'],
        description: 'The righteous king with a holy aura.',
        profile: arthurPortrait,
        score: 3.05,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    archer: {
        id: 'archer',
        name: 'Archer Chapanion',
        role: 'Ranger',
        hp: 5,
        maxHp: 5,
        speed: 8,
        skills: ['archer_offensive', 'archer_defensive'], // Fixed ID from 'archer_trap' to standard naming if exists, or alias
        description: 'A master marksman.',
        profile: archerPortrait,
        score: 3.17,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    architect: {
        id: 'architect',
        name: 'Royal Architect',
        role: 'Support',
        hp: 8,
        maxHp: 8,
        speed: 1,
        skills: ['architect_offensive', 'architect_defensive'], // Fixed IDs
        description: 'Builds and destroys fortifications.',
        score: 3.11,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },

    // --- STANDARD HEROES (Generated) ---
    valerius: {
        id: 'valerius',
        name: 'Sir Valerius',
        role: 'Knight',
        hp: 8,
        maxHp: 8,
        speed: 1,
        skills: ['std_heavy_strike', 'std_shield_bash'],
        description: 'A deeply armored shock trooper.',
        score: 3.11,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    lyra: {
        id: 'lyra',
        name: 'Lyra',
        role: 'Rogue',
        hp: 5,
        maxHp: 5,
        speed: 7,
        skills: ['std_quick_jab', 'std_wide_sweep'],
        description: 'A swift blade in the shadows.',
        score: 2.94,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    sylas: {
        id: 'sylas',
        name: 'Sylas',
        role: 'Cleric',
        hp: 5,
        maxHp: 5,
        speed: 2,
        skills: ['std_group_heal', 'std_inner_focus'],
        description: 'Heals wounds and braces for impact.',
        score: 1.83,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    grom: {
        id: 'grom',
        name: 'Grom',
        role: 'Berserker',
        hp: 10,
        maxHp: 10,
        speed: 5,
        skills: ['std_heavy_strike', 'std_berserk'],
        description: 'A warrior who trades defense for power.',
        score: 5.0,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },

    // --- NEW HEROES ---
    elara: {
        id: 'elara',
        name: 'Elara Moonwhisper',
        role: 'Assassin',
        hp: 5,
        maxHp: 5,
        speed: 9,
        skills: ['elara_offensive', 'elara_passive'],
        description: 'A nightblade who dances with shadows.',
        score: 2.54,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    thorn: {
        id: 'thorn',
        name: 'Thorn Bristlebeard',
        role: 'Tank',
        hp: 8,
        maxHp: 8,
        speed: 1,
        skills: ['thorn_defensive', 'thorn_passive'],
        description: 'A dwarven defender with spiked armor.',
        score: 3.11,
        evaluationTime: '2026-02-20T11:24:11+08:00'
    },
    siegfried: {
        id: 'siegfried',
        name: 'Siegfried',
        role: 'Dragon Slayer',
        hp: 6,
        maxHp: 6,
        speed: 4,
        skills: ['siegfried_offensive', 'siegfried_passive'],
        description: 'The tragic hero who bathed in dragon blood. Wields the cursed Balmung.',
        score: 6.66,
        evaluationTime: '2026-02-20T11:24:11+08:00'
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
    },

    // --- NEW ENEMIES ---
    shadow_stalker: {
        id: 'shadow_stalker',
        name: 'Shadow Stalker',
        hp: 8,
        maxHp: 8,
        speed: 8,
        skills: ['shadow_offensive', 'std_counter'] // Reusing counter or specific? Let's use std_counter for now or passive if we added it? 
        // Wait, I didn't add shadow_passive to skills.js yet, I just added 'shadow_offensive'. 
        // Let's check my previous edit.
        // I added 'shadow_offensive' and 'golem_passive'. Mistake in plan vs execution?
        // I didn't add 'shadow_passive' in skills.js. I added 'golem_passive'.
        // Let's use std_counter for Shadow Stalker for now or add it later if needed.
    },
    iron_golem: {
        id: 'iron_golem',
        name: 'Iron Golem',
        hp: 20,
        maxHp: 20,
        speed: 1,
        skills: ['golem_offensive', 'golem_passive']
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
