
import { Character } from '../models/Character';

const HERO_DATA = [
    {
        id: 'merlin',
        name: 'Merlin',
        role: 'Wizard',
        hp: 4,
        maxHp: 4,
        speed: 6,
        offensiveSkillId: 'merlin_offensive',
        defensiveSkillId: 'merlin_defensive'
    },
    {
        id: 'arthur',
        name: 'Arthur',
        role: 'Knight',
        hp: 7,
        maxHp: 7,
        speed: 4,
        offensiveSkillId: 'arthur_offensive',
        defensiveSkillId: 'arthur_defensive'
    },
    {
        id: 'archer',
        name: 'Archer Chapanion',
        role: 'Ranger',
        hp: 5,
        maxHp: 5,
        speed: 8,
        offensiveSkillId: 'archer_offensive',
        defensiveSkillId: 'archer_defensive'
    },
    {
        id: 'architect',
        name: 'Royal Architect',
        role: 'Support',
        hp: 4,
        maxHp: 4,
        speed: 1,
        offensiveSkillId: 'architect_offensive',
        defensiveSkillId: 'architect_defensive'
    }
];

export const getHeroes = () => HERO_DATA.map(h => new Character(h));
