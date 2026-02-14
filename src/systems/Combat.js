import { ActionSequence } from './ActionSequence';
import { createDraft, finishDraft } from 'immer';
import { Character } from '../models/Character';
import { Faction } from '../models/Faction';

export class Combat {
    /**
     * Execute a turn for a specific active faction (e.g. Player Turn).
     * Uses Immer to ensure immutability while allowing imperative logic in ActionSequence.
     * 
     * @param {Faction[]} baseFactions - The current immutable state of factions.
     * @param {string} activeFactionId - ID of the faction taking the turn.
     * @param {number} diceValue - The dice roll for this turn.
     * @param {Object} extraContext - { history, memory, requestPlayerTarget }
     * @returns {Promise<{ factions: Faction[], logs: string[] }>}
     */
    static async processMainTurn(baseFactions, activeFactionId, diceValue, extraContext) {
        let logs = [];

        // Manually handle draft to avoid async producer issues with Immer in this environment
        const draft = createDraft(baseFactions);
        try {
            // 1. Resolve Sequence (Mutates the draft directly)
            const result = await ActionSequence.resolveTurn(draft, activeFactionId, diceValue, extraContext);
            logs = result.logs;
        } catch (e) {
            console.error("Combat Logic Error:", e);
            // In case of error, we might want to return original state or throw? 
            // For now, let's just finish the draft with whatever happened or throw.
            throw e;
        }

        const nextFactions = finishDraft(draft);

        return {
            factions: nextFactions,
            logs
        };
    }


    /**
     * Sets up global event listeners for passive skills.
     * Should be called at the start of battle/context initialization.
     * @param {Faction[]} factions 
     * @returns {Function} cleanup function to remove listeners
     */
    static setupPassiveListeners(factions) {
        const { bus } = require('./EventBus'); // Late require to avoid cycle if any

        // 1. Identify all unique triggers to listen for
        const allChars = factions.flatMap(f => f.characters);
        const triggers = new Set();
        allChars.forEach(c => {
            c.getSkills().forEach(s => {
                if (s.trigger && s.trigger !== 'ACTION_PHASE') {
                    triggers.add(s.trigger);
                }
            });
        });

        const handlers = [];

        // 2. Create a handler for each trigger
        triggers.forEach(trigger => {
            const handler = async (payload) => {
                await Combat.handlePassiveTrigger(trigger, payload, factions);
            };
            bus.on(trigger, handler);
            handlers.push({ trigger, handler });
        });

        // Return cleanup
        return () => {
            handlers.forEach(({ trigger, handler }) => {
                bus.off(trigger, handler);
            });
        };
    }

    /**
     * Handles a triggered event by finding and executing relevant passive skills.
     * @param {string} trigger - Event name
     * @param {Object} payload - Event payload
     * @param {Faction[]} factions - Current game state
     */
    static async handlePassiveTrigger(trigger, payload, factions) {
        // 1. Identify Candidates
        const allChars = factions.flatMap(f => f.characters);

        // 2. Sort by Speed (Descending) - As calculated at start of round/turn
        // Note: For now we use current tempSpeed. Optimally this is cached 'RoundSpeed'.
        allChars.sort((a, b) => b.tempSpeed - a.tempSpeed);

        // 3. Iterate and Execute
        for (const actor of allChars) {
            if (actor.hp <= 0) continue; // Dead don't trigger passives usually

            const passives = actor.getPassiveSkills(trigger);

            for (const skill of passives) {
                // Create context for this specific execution
                // We need to merge the event payload into the context so the skill checks conditions against it
                // e.g. "Triggered by Damage", check "Amount > 5"
                const context = Combat.createContext(
                    factions,
                    actor.faction?.id, // Active faction might be irrelevant for passive, using actor's
                    actor,
                    payload.dice || 0, // Event might not have dice, default 0
                    { ...payload, isPassive: true }
                );

                // 4-Step Process: Trigger (Already done) -> Determinator -> Targeting -> Execution
                // perform() handles valid check & execution
                await skill.perform(actor, context);
            }
        }
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

            memory: extraContext.memory || {},
            history: extraContext.history || [],
            ...extraContext
        };
    }
}
