import { ActionSequence } from './ActionSequence';
import { Character } from '../models/Character';
import { Faction } from '../models/Faction';

export class Combat {
    /**
     * Clones the faction state to ensure mutations don't affect previous history or React state directly until ready.
     * However, since we want direct mutation to "stick" for the next step of the chain, 
     * we should clone ONCE at the start of the handler, and then pass the mutable objects through.
     */
    static cloneFactions(factions) {
        return factions.map(f => {
            const newChars = f.characters.map(c => {
                // Determine skillIds to pass
                const skillIds = c.skillIds;

                const copyData = {
                    ...c,
                    skillIds: skillIds,
                    hp: c.hp,
                    maxHp: c.maxHp,
                    speed: c.speed,
                    tempSpeed: c.tempSpeed,
                    defense: c.defense
                };

                const copy = new Character(copyData);
                return copy;
            });
            return new Faction(f.id, f.type, f.name, newChars);
        });
    }

    /**
     * Execute a turn for a specific active faction (e.g. Player Turn).
     * @param {Faction[]} currentFactions - The current state of factions (mutable copies).
     * @param {string} activeFactionId - ID of the faction taking the turn.
     * @param {number} diceValue - The dice roll for this turn.
     * @param {Object} extraContext - { history, memory, requestPlayerTarget }
     * @returns {Object} { factions: Faction[], logs: string[] }
     */
    static async processMainTurn(currentFactions, activeFactionId, diceValue, extraContext) {
        // 1. Resolve Sequence (Mutates characters in currentFactions)
        // Since ActionSequence iterates allActors found in currentFactions, mutations apply directly.

        const { logs } = await ActionSequence.resolveTurn(currentFactions, activeFactionId, diceValue, extraContext);

        return {
            factions: currentFactions, // mutated
            logs
        };
    }
}
