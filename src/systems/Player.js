
import { CHARACTERS, getCharacter } from '../data/characters';
import { FACTIONS } from '../data/factions';
import { SharpDagger, GuardianShield, VampireFang } from '../data/equipment';

export class Player {
    /**
     * Creates the initial state for a new game.
     * @returns {Object} New game state
     */
    static createInitialState() {
        const initialRosterIds = FACTIONS.PLAYER.roster;
        const roster = initialRosterIds.map(id => getCharacter(id));

        // Initial Inventory
        const inventory = [
            new SharpDagger(),
            new GuardianShield(),
            new VampireFang(),
            new SharpDagger(), // Extra for testing
            new GuardianShield()
        ];

        return {
            level: 1,
            gold: 100,
            lastEventLevel: 0,
            roster: roster,
            activeTeam: [...FACTIONS.PLAYER.initialTeam],
            inventory: inventory, // New: Inventory
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
        return {
            ...currentState,
            level: currentState.level + 1,
            gold: currentState.gold + 50
        };
    }

    /**
     * Processes defeat conditions.
     * @param {Object} currentState 
     * @returns {Object} Updated state
     */
    static processDefeat(currentState) {
        return currentState;
    }
}
