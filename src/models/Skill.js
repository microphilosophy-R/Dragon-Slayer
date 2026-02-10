/**
 * Represents a discrete ability or action a Character can perform.
 * Follows a strict 3-step process: Determine -> Target -> Execute.
 */
export class Skill {
    constructor(data) {
        // --- Identity & Configuration ---
        this.id = data.id;
        this.name = data.name;
        this.type = data.type; // 'OFFENSIVE', 'DEFENSIVE', 'BOTH'
        this.description = data.description;
        this.targetingMode = data.targetingMode || 'AUTO'; // 'AUTO', 'MANUAL'
        this.maxTargets = data.maxTargets || 1; // Default to single target

        // --- Logic Strategies (Injected Behavior) ---
        // Defaults to always valid, no targets, no effect if not provided.
        this.checkConditionsStrat = data.checkConditions || (() => true);
        this.getTargetsStrat = data.getTargets || (() => []);
        // Selection Strategy (Step 2 Helper): Default to random if no strategy provided but selection needed.
        this.selectTargetsStrat = data.selectTargets || ((candidates, max) => {
            // Default: Pick random candidates up to max
            // Shuffle
            const shuffled = [...candidates].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, max);
        });
        this.executeStrat = data.execute || (() => ({ log: 'No effect', actions: [] }));
    }

    /**
     * MAIN ENTRY POINT
     * Orchestrates the full execution flow: Determination, Targeting, then Execution.
     * Orchestrates the strict 3-step process: Determine -> Target -> Execute.
     * @param {Character} user - The character using the skill.
     * @param {Object} context - The combat state.
     * @returns {Promise<Object|null>} The result ({ log, actions }) or null if invalid/cancelled.
     */
    async perform(user, context) {
        // Step 1: Determination
        const { validTargets, isActive, maxTargets } = this.determinator(user, context);

        if (!isActive) {
            return null; // Skill is not active/valid
        }

        // Step 2: Targeting
        const selectedTargets = await this.targeting(user, context, validTargets, maxTargets);

        if (!selectedTargets || selectedTargets.length === 0) {
            return { log: `${user.name} skipped ${this.name}.`, actions: [] };
        }

        // Step 3: Execution
        return this.execute(user, context, selectedTargets);
    }

    /**
     * STEP 1: DETERMINATOR
     * Calculates validity, identifies candidates, and decides max targets.
     * @param {Character} user 
     * @param {Object} context 
     * @returns {Object} { validTargets, isActive, maxTargets }
     */
    determinator(user, context) {
        // 0. Check Mode vs Type
        if (context.activeFaction) {
            const mode = context.mode || (context.activeFaction.id === user.faction?.id ? 'OFFENSIVE' : 'DEFENSIVE');

            if (this.type === 'OFFENSIVE' && mode !== 'OFFENSIVE') return { validTargets: [], isActive: false, maxTargets: 0 };
            if (this.type === 'DEFENSIVE' && mode !== 'DEFENSIVE') return { validTargets: [], isActive: false, maxTargets: 0 };
            if (this.type === 'OFFENSIVE' && mode === 'DEFENSIVE') return { validTargets: [], isActive: false, maxTargets: 0 };
        }

        // 1. Check Pre-conditions
        if (!this.checkConditionsStrat(context)) {
            return { validTargets: [], isActive: false, maxTargets: 0 };
        }

        // 2. Identify Candidates
        const candidates = this.getTargetsStrat(context);

        // 3. Determine Max Targets
        let max = this.maxTargets;
        if (typeof max === 'function') {
            max = max(context);
        }

        return {
            validTargets: candidates,
            isActive: candidates.length > 0,
            maxTargets: max || 1
        };
    }

    /**
     * STEP 2: TARGETING
     * Handles Manual or Random selection based on maxTargets.
     * @param {Character} user
     * @param {Object} context
     * @param {Character[]} validTargets
     * @param {number} maxTargets
     * @returns {Promise<Character[]>}
     */
    async targeting(user, context, validTargets, maxTargets) {
        // 1. Manual Strategy (Human Player)
        const isPlayerManual = this.targetingMode === 'MANUAL'
            && user.faction?.type === 'PLAYER'
            && context.requestPlayerTarget;

        if (isPlayerManual) {
            try {
                // If maxTargets > 1, we might need a multi-select UI, 
                // but for now requestPlayerTarget returns single.
                // Assuming manual is usually single target for this UI.
                const target = await context.requestPlayerTarget(validTargets);
                return target ? [target] : [];
            } catch (e) {
                return []; // Cancelled
            }
        }

        // 2. Random/Auto Strategy (Default/AI)
        // "The target number always equal to the maximum number."

        // If we have fewer candidates than max, take them all.
        if (validTargets.length <= maxTargets) {
            return validTargets;
        }

        // Otherwise, use Selection Strategy (Random by default) to pick `maxTargets`
        return this.selectTargetsStrat(validTargets, maxTargets, context);
    }

    /**
     * STEP 3: EXECUTION
     * @param {Character} user
     * @param {Object} context
     * @param {Character[]} targets
     */
    execute(user, context, targets) {
        if (!targets || targets.length === 0) {
            return { log: `${this.name} fizzled.` };
        }
        return this.executeStrat(targets, context);
    }
}
