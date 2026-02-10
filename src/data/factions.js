import { CHARACTERS } from './characters';

export const FACTIONS = {
    PLAYER: {
        id: 'player_default',
        name: 'Expedition Team',
        roster: ['merlin', 'arthur', 'archer', 'architect'], // IDs from CHARACTERS
        initialTeam: ['merlin', 'arthur', 'archer', 'architect']
    },
    ENEMIES: {
        REBELS_OUTSKIRTS: {
            id: 'rebels_outskirts',
            name: 'Rebel Scum',
            members: [
                { ...CHARACTERS.rebel_grunt, id: 'rebel_1' },
                { ...CHARACTERS.rebel_grunt, id: 'rebel_2' }
            ]
        },
        DRAGON_LAIR: {
            id: 'dragon_lair',
            name: 'The Dragon\'s Guard',
            members: [
                { ...CHARACTERS.dragon, id: 'dragon_boss' }
            ]
        }
    }
};
