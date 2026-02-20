import { Combat } from './Combat';

export class ActionSequence {
    /**
     * Executes a single turn where one faction is "Active".
     * All characters act, but behave differently (Offensive vs Defensive) based on who is active.
     */
    static async resolveTurn(allFactions, activeFactionId, diceValue, extraContext = {}) {
        const { bus } = await import('./EventBus');
        await bus.emitAsync('Turn:Start', { activeFactionId, diceValue });
        await bus.emitAsync('Dice:Roll', { value: diceValue }); // Or maybe distinct if roll happened before? 
        // User asked for "the rolling of the dice" and "the result". 
        // Here we just have the result passed in. "Dice:Result" fits better.
        await bus.emitAsync('Dice:Result', { value: diceValue });

        let turnLogs = [];

        // 1. Identify Active Logic
        const activeFaction = allFactions.find(f => f.id === activeFactionId);

        // Clear turn counts from memory for a fresh turn
        if (extraContext.memory) {
            Object.keys(extraContext.memory).forEach(key => {
                if (key.endsWith('_turn_count')) {
                    delete extraContext.memory[key];
                }
            });
        }

        // 2. Gather All Living Actors
        let allActors = [];
        allFactions.forEach(f => {
            allActors.push(...f.livingMembers);
        });

        // 3. Sort by Speed (Descending)
        // Note: Logic suggests "All characters shall be arranged with this method"
        allActors.sort((a, b) => b.tempSpeed - a.tempSpeed);

        // 4. Sequence Execution
        for (const actor of allActors) {
            if (actor.hp <= 0) continue;

            const isFirst = allActors[0].id === actor.id;

            // Context construction
            const context = Combat.createContext(
                allFactions,
                activeFactionId,
                actor,
                diceValue,
                {
                    isFirst,
                    turnRank: allActors.indexOf(actor) + 1, // 1-based rank
                    trigger: 'ACTION_PHASE', // Unified System: Active Skills trigger on this phase
                    ...extraContext
                }
            );

            // Delegate to Actor
            // Actor handles "Mode" determination (Offensive/Defensive) internally
            const results = await actor.act(context);

            if (results && results.length > 0) {
                results.forEach(res => {
                    if (res.log) turnLogs.push(res.log);
                });
            }
        }

        await bus.emitAsync('Turn:End', { activeFactionId });
        return { logs: turnLogs };
    }
}
