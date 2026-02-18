import { ANIMATIONS } from '../data/animationskills';

export class AnimationSkill {
    /**
     * Plays an animation for a set of targets.
     * @param {string} animationKey - Key from ANIMATIONS (e.g., 'healing')
     * @param {Character} user - The source of the skill
     * @param {Character[]} targets - The targets
     * @param {Object} context - Combat context (contains gameSpeed)
     * @returns {Promise<void>}
     */
    static async play(animationKey, user, targets, context) {
        const gameSpeed = context.gameSpeed || 'NORMAL';

        // 1. Check Game Speed
        if (gameSpeed === 'SKIP') {
            return Promise.resolve();
        }

        const animConfig = ANIMATIONS[animationKey];
        if (!animConfig) return Promise.resolve();

        // 2. Identify Elements
        // We need a way to find the DOM elements for these characters.
        // In React, direct DOM manipulation is discouraged, but for transient visual effects 
        // that don't change state (just animations), adding a class temporarily is often 
        // the most performant and easiest way without complex state management for every particle.
        // We will assume CharacterCard components have an ID attribute: `char-card-${id}`.

        const duration = gameSpeed === 'FULL' ? animConfig.duration : animConfig.duration * 0.5; // Speed up in normal mode? 
        // Actually user said: "Full option: do not skip any animation". 
        // "Skip means skipping all... except manual".
        // Let's assume NORMAL is standard speed, FULL is same or maybe slower? 
        // User: "Add new "Full" option: do not skip any animation."
        // This implies "Normal" might skip some? Or "Normal" is "Full"?
        // Usually:
        // SKIP: Instant
        // NORMAL: Fast / abbreviated
        // FULL: All details
        // Let's map: 
        // SKIP: 0ms
        // NORMAL: 50% duration? or 100%? Let's say 100% for now.

        const finalDuration = duration;

        const elements = targets.map(t => document.getElementById(`char-card-${t.id}`)).filter(Boolean);
        if (elements.length === 0) return Promise.resolve();

        // 3. Apply Animation
        elements.forEach(el => {
            el.classList.add(animConfig.className);
        });

        // 4. Wait
        await new Promise(resolve => setTimeout(resolve, finalDuration));

        // 5. Cleanup
        elements.forEach(el => {
            el.classList.remove(animConfig.className);
        });
    }
}
