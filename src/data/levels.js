import { Level } from '../models/Level';
import { FACTIONS } from './factions';

export const LEVELS = {
    1: new Level(1, "The Outskirts", {
        factionName: FACTIONS.ENEMIES.REBELS_OUTSKIRTS.name,
        members: FACTIONS.ENEMIES.REBELS_OUTSKIRTS.members
    })
};
