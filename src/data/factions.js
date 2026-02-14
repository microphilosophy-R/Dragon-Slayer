import { CHARACTERS } from './characters';

export const FACTIONS = {
    PLAYER: {
        id: 'player_default',
        name: 'Expedition Team',
        roster: ['merlin', 'arthur', 'archer', 'architect', 'elara', 'thorn'], // Extended Roster
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
            id: 'dragon_boss',
            name: 'The Dragon\'s Guard',
            members: [
                { ...CHARACTERS.dragon, id: 'dragon_boss' }
            ]
        },
        // 1. Nature's Wrath (Orcs & Goblins)
        NATURES_WRATH: {
            id: 'natures_wrath',
            name: 'Nature\'s Wrath',
            members: [
                { ...CHARACTERS.orc_warrior, id: 'orc_1' },
                { ...CHARACTERS.goblin_skirmisher, id: 'goblin_1' },
                { ...CHARACTERS.goblin_skirmisher, id: 'goblin_2' }
            ]
        },
        // 2. The Dark Covens (Cultists & Shadows)
        DARK_COVENS: {
            id: 'dark_covens',
            name: 'The Dark Covens',
            members: [
                { ...CHARACTERS.dark_cultist, id: 'cultist_1' },
                { ...CHARACTERS.shadow_stalker, id: 'stalker_1' },
                { ...CHARACTERS.dark_cultist, id: 'cultist_2' }
            ]
        },
        // 3. Ancient Construct (Golems - High Defense)
        ANCIENT_CONSTRUCT: {
            id: 'ancient_construct',
            name: 'Ancient Guardians',
            members: [
                { ...CHARACTERS.iron_golem, id: 'golem_1' },
                { ...CHARACTERS.dark_cultist, id: 'cultist_mechanic' } // Mechanic support
            ]
        },
        // 4. Bandit Ambush (Bandit Leader & Rogues)
        BANDIT_AMBUSH: {
            id: 'bandit_ambush',
            name: 'Bandit Ambush',
            members: [
                { ...CHARACTERS.bandit_leader, id: 'bandit_boss' },
                { ...CHARACTERS.lyra, id: 'rogue_merc_1', name: 'Rogue Mercedes' } // Reusing Lyra as enemy
            ]
        },
        // 5. The Iron Legion (Heavy Armor)
        IRON_LEGION: {
            id: 'iron_legion',
            name: 'The Iron Legion',
            members: [
                { ...CHARACTERS.valerius, id: 'fallen_knight_1', name: 'Fallen Knight' },
                { ...CHARACTERS.valerius, id: 'fallen_knight_2', name: 'Fallen Knight' }
            ]
        },
        // 6. Shadowy Figures (All Shadows)
        SHADOW_REALM: {
            id: 'shadow_realm',
            name: 'Shadow Realm',
            members: [
                { ...CHARACTERS.shadow_stalker, id: 'shade_1' },
                { ...CHARACTERS.shadow_stalker, id: 'shade_2' },
                { ...CHARACTERS.shadow_stalker, id: 'shade_3' }
            ]
        }
    }
};
