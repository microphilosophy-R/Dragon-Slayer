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

    /**
     * Centralized Context Creation
     * ensures consistent availability of combat state across all systems (Skills, AI, UI).
     */
    static createContext(allFactions, activeFactionId, currentActor, diceValue, extraContext = {}) {
        /*
         * Context Schema:
         * {
         *   dice: number,
         *   activeFaction: Faction,
         *   user: Character,
         *   allies: Character[],
         *   enemies: Character[],
         *   isFirst: boolean,
         *   allFactions: Faction[],
         *   ...extraContext (history, memory, etc)
         * }
         */

        const activeFaction = allFactions.find(f => f.id === activeFactionId);

        let allActors = [];
        allFactions.forEach(f => {
            allActors.push(...f.livingMembers);
        });

        // Determine First Actor (based on tempSpeed) - Re-calculation or pass it in? 
        // ActionSequence sorts them. If we create context *inside* loop, we know who is first.
        // But here we might just need to know if *currentActor* is first.
        // Let's assume sorting happens outside or we sort here to check. 
        // For efficiency, maybe 'isFirst' should be passed in if known, or calculated.

        // Let's keep it simple: filter allies/enemies based on actor.

        return {
            dice: diceValue,
            activeFaction: activeFaction,
            user: currentActor,
            allies: allActors.filter(c => c.faction.id === currentActor.faction.id),
            enemies: allActors.filter(c => c.faction.id !== currentActor.faction.id),
            allFactions: allFactions,
            ...extraContext
        };
    }
}
