import { Level } from '../models/Level';
import { Faction } from '../models/Faction';
import { Character } from '../models/Character';
import { SKILL_CABINET } from './skills';

// For now, reconstruct enemies manually or use existing data logic
// We need to match the new Character structure which expects 'skills' array, not off/def IDs.
// But let's reuse the existing enemy templates if possible, or redefine here.

const rebelGrunt = {
    id: 'rebel_grunt',
    name: 'Rebel Grunt',
    hp: 10,
    maxHp: 10,
    speed: 4,
    skills: ['rebel_attack', 'rebel_defend'] // Example
};

// We can import ENEMIES from 'enemies.js' if we update that file first.
// Let's assume we update enemies.js to export factory functions or data.

export const LEVELS = {
    1: new Level(1, "The Outskirts", {
        factionName: "Rebel Scum",
        members: [
            // Definition of enemies in this level
            // We can store raw data here and instantiate in BattleScreen
            { id: 'rebel_1', ...rebelGrunt },
            { id: 'rebel_2', ...rebelGrunt }
        ]
    })
};
