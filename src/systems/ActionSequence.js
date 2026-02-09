export class ActionSequence {
    static resolveTurn(activeFaction, passiveFaction, diceValue) {
        // 1. Identify Participants
        // Active Faction members act OFFENSIVELY
        // Passive Faction members act DEFENSIVELY

        let actions = [];
        let logs = [];

        // Collect all potential actors
        const activeActors = activeFaction.livingMembers.map(c => ({
            actor: c,
            mode: 'OFFENSIVE',
            faction: activeFaction
        }));

        const passiveActors = passiveFaction.livingMembers.map(c => ({
            actor: c,
            mode: 'DEFENSIVE',
            faction: passiveFaction
        }));

        let allActors = [...activeActors, ...passiveActors];

        // 2. Sort by Speed (Descending)
        // Resolves ties randomly or by some other logic? strict sort for now.
        allActors.sort((a, b) => b.actor.tempSpeed - a.actor.tempSpeed);

        // 3. Execute Actions in Order
        for (let entry of allActors) {
            const { actor, mode, faction } = entry;

            // Re-check vitality (in case they died during this sequence?)
            // Usually valid in simultaneous turns, but let's check.
            if (actor.hp <= 0) continue;

            // Context construction
            const context = {
                dice: diceValue,
                allies: faction.livingMembers,
                enemies: (faction === activeFaction ? passiveFaction : activeFaction).livingMembers,
                isFirst: allActors[0].actor.id === actor.id
            };

            const result = actor.executeSkill(mode, context.enemies, context);

            if (result) {
                if (result.log) logs.push(result.log);
                if (result.actions) actions.push(...result.actions);
            }
        }

        return { logs, actions };
    }
}
