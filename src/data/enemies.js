import { Character } from '../models/Character';

const ENEMY_DATA = {
    1: {
        id: 'rebel',
        name: 'The Rebel Army',
        hp: 16,
        maxHp: 16,
        speed: 8,
        skills: ['rebel_offensive', 'rebel_defensive']
    },
    2: {
        id: 'dragon',
        name: 'The Red Dragon',
        hp: 28,
        maxHp: 28,
        speed: 5,
        skills: ['dragon_offensive', 'dragon_defensive']
    }
};

export const getEnemy = (level) => {
    const data = ENEMY_DATA[level] || ENEMY_DATA[1];
    return new Character(data);
};
