import { Level } from '../models/Level';
import { FACTIONS } from './factions';

export const LEVELS = {
    1: new Level(1, "The Outskirts", {
        factionName: FACTIONS.ENEMIES.REBELS_OUTSKIRTS.name,
        members: FACTIONS.ENEMIES.REBELS_OUTSKIRTS.members
    }),
    2: new Level(2, "Dark Woods", {
        factionName: FACTIONS.ENEMIES.NATURES_WRATH.name,
        members: FACTIONS.ENEMIES.NATURES_WRATH.members
    }),
    3: new Level(3, "Bandit Camp", {
        factionName: FACTIONS.ENEMIES.BANDIT_AMBUSH.name,
        members: FACTIONS.ENEMIES.BANDIT_AMBUSH.members
    }),
    4: new Level(4, "Cursed Ruins", {
        factionName: FACTIONS.ENEMIES.DARK_COVENS.name,
        members: FACTIONS.ENEMIES.DARK_COVENS.members
    }),
    5: new Level(5, "Iron Fortress", {
        factionName: FACTIONS.ENEMIES.IRON_LEGION.name,
        members: FACTIONS.ENEMIES.IRON_LEGION.members
    }),
    6: new Level(6, "The Ancient Vault", {
        factionName: FACTIONS.ENEMIES.ANCIENT_CONSTRUCT.name,
        members: FACTIONS.ENEMIES.ANCIENT_CONSTRUCT.members
    }),
    7: new Level(7, "Shadow Dimension", {
        factionName: FACTIONS.ENEMIES.SHADOW_REALM.name,
        members: FACTIONS.ENEMIES.SHADOW_REALM.members
    }),
    8: new Level(8, "Dragon's Lair", {
        factionName: FACTIONS.ENEMIES.DRAGON_LAIR.name,
        members: FACTIONS.ENEMIES.DRAGON_LAIR.members
    })
};
