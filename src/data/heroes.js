import { Character } from '../models/Character';

const HERO_DATA = [
    {
        id: 'merlin',
        name: 'Merlin',
        role: 'Wizard',
        hp: 4,
        maxHp: 4,
        speed: 6,
        skills: ['merlin_offensive', 'merlin_defensive'],
        description: 'A powerful wizard who controls fire.'
    },
    {
        id: 'arthur',
        name: 'Arthur',
        role: 'Knight',
        hp: 7,
        maxHp: 7,
        speed: 4,
        skills: ['arthur_offensive', 'arthur_defensive'],
        description: 'The righteous king with a holy aura.'
    },
    {
        id: 'archer',
        name: 'Archer Chapanion',
        role: 'Ranger',
        hp: 5,
        maxHp: 5,
        speed: 8,
        skills: ['archer_offensive', 'archer_trap'], // Corrected ID from previous file glimpse
        description: 'A master marksman.'
    },
    {
        id: 'architect',
        name: 'Royal Architect',
        role: 'Support',
        hp: 4,
        maxHp: 4,
        speed: 1,
        skills: ['architect_fortify', 'architect_collapse'], // Corrected IDs
        description: 'Builds and destroys fortifications.'
    }
];

export const getHeroes = () => HERO_DATA.map(h => new Character(h));
