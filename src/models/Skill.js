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

        // --- Logic Strategies (Injected Behavior) ---
        // Defaults to always valid, no targets, no effect if not provided.
        this.checkConditionsStrat = data.checkConditions || (() => true);
        this.getTargetsStrat = data.getTargets || (() => []);
        this.executeStrat = data.execute || (() => ({ log: 'No effect', actions: [] }));
    }

    /**
     * MAIN ENTRY POINT
     * Orchestrates the full execution flow: Determination, Targeting, then Execution.
     * @param {Character} user - The character using the skill.
     * @param {Object} context - The combat state (dice, allies, enemies, etc).
     * @returns {Promise<Object|null>} The result ({ log, actions }) or null if invalid/cancelled.
     */
    async perform(user, context) {
        // Step 1: Determination (Can I use this? Who can I target?)
        const determination = this.evaluate(context);
        if (!determination.valid) return null;

        // Step 2: Targeting (Selection from valid candidates)
        let selectedTargets = [];

        // Handle Manual Targeting (Player UI Interaction)
        const isPlayerManual = this.targetingMode === 'MANUAL'
            && user.faction?.type === 'PLAYER'
            && context.requestPlayerTarget;

        if (isPlayerManual) {
            try {
                // Pause and wait for UI selection
                const target = await context.requestPlayerTarget(determination.candidates);
                if (target) {
                    selectedTargets = [target];
                } else {
                    return { log: `${user.name} skipped ${this.name}.`, actions: [] };
                }
            } catch (e) {
                return { log: `Targeting cancelled for ${this.name}.`, actions: [] };
            }
        } else {
            // Auto Targeting (Default / AI)
            // We pass all valid candidates. The Execution strategy often picks one randomly 
            // if it's a single-target skill, or hits all if it's AOE.
            selectedTargets = determination.candidates;
        }

        // Step 3: Execution (Apply Effects)
        return this.execute(selectedTargets, context);
    }

    /**
     * STEP 1: DETERMINATION
     * Checks if the skill conditions are met and identifies valid targets.
     * @param {Object} context 
     * @returns {Object} { valid: boolean, candidates: Character[] }
     */
    evaluate(context) {
        // 0. Check Mode vs Type
        // context.mode is 'OFFENSIVE' (Active Turn) or 'DEFENSIVE' (Reaction)
        if (context.mode) {
            if (this.type === 'OFFENSIVE' && context.mode !== 'OFFENSIVE') return { valid: false, candidates: [] };
            if (this.type === 'DEFENSIVE' && context.mode !== 'DEFENSIVE') return { valid: false, candidates: [] };
        }

        // 1. Check Pre-conditions (resources, dice requirements, cooldowns)
        if (!this.checkConditionsStrat(context)) {
            return { valid: false, candidates: [] };
        }

        // 2. Identify Candidates (filter valid targets from context)
        const candidates = this.getTargetsStrat(context);

        return {
            valid: candidates.length > 0,
            candidates
        };
    }

    /**
     * STEP 3: EXECUTION
     * Applies the skill's effect to the final selected targets.
     * @param {Character[]} targets 
     * @param {Object} context 
     * @returns {Object} { log: string }
     */
    execute(targets, context) {
        if (!targets || targets.length === 0) {
            return { log: `${this.name} fizzled (no targets).` };
        }
        return this.executeStrat(targets, context);
    }
}
