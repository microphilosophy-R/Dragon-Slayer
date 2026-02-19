import { CHARACTERS, getCharacter } from '../data/characters';
import { FACTIONS } from '../data/factions';
import { Faction } from '../models/Faction';

export class Player {
    /**
     * Creates the initial state for a new game.
     * @returns {Object} New game state
     */
    static createInitialState() {
        // Instantiate the Player Faction
        // User wants "Use Faction" - we should probably store the Faction object or at least the data to recreate it.
        // App.js usually stores `roster` (array of Characters). 
        // If we want to use Faction properly, maybe `gameState.playerFaction`?
        // But for now, let's keep `roster` as the source of truth for "All unlocked heroes", 
        // and Faction is created for Battle. 
        // OR: gameState SHOULD hold the Faction object?
        // "let us create a faction.js to include... And under system.js, please add a Player.js to handle all the operations..."

        // Let's stick to generating the roster array for now, but sourced from FACTIONS.

        const initialRosterIds = FACTIONS.PLAYER.roster;
        const roster = initialRosterIds.map(id => getCharacter(id));

        return {
            level: 1,
            gold: 100,
            lastEventLevel: 0,
            roster: roster,
            activeTeam: [...FACTIONS.PLAYER.initialTeam],
            castleFacilities: {
                mainHall: { level: 1 },
                expeditionOffice: { level: 1 }
            }
        };
    }

    /**
     * Processes victory conditions and updates state.
     * @param {Object} currentState 
     * @returns {Object} Updated state
     */
    static processVictory(currentState) {
        // Logic for leveling up, adding gold, etc.
        // For now, mirroring previous App.js logic: Level + 1
        return {
            ...currentState,
            level: currentState.level + 1,
            gold: currentState.gold + 50 // Example reward
        };
    }

    /**
     * Processes defeat conditions.
     * @param {Object} currentState 
     * @returns {Object} Updated state (or triggers game over handling in UI)
     */
    static processDefeat(currentState) {
        // Just return state, maybe flag logic
        return currentState;
    }
}
