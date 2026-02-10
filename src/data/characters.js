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

    // --- LEVEL ENEMIES ---
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
