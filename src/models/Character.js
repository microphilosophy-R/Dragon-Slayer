import { SKILL_CABINET } from '../data/skills';
import defaultProfile from '../images/hero_portrait.png';

export class Character {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.role = data.role || 'Unknown';
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.speed = data.speed;
        this.tempSpeed = data.speed; // Runtime speed
        this.defense = data.defense || 0;
        this.score = data.score || 0; // Calculated Power Score
        this.evaluationTime = data.evaluationTime || null; // Date of last balance evaluation
        this.faction = null; // Reference to Faction object

        // Skills (Array of IDs or Objects)ted: Faction -> Characters -> Skills
        // We will store IDs and resolve them, or store usage context
        this.skillIds = data.skills || data.skillIds || [];

        // Legacy support during migration (optional)
        if (data.offensiveSkillId && !this.skillIds.includes(data.offensiveSkillId)) this.skillIds.push(data.offensiveSkillId);
        if (data.defensiveSkillId && !this.skillIds.includes(data.defensiveSkillId)) this.skillIds.push(data.defensiveSkillId);

        // Display info
        this.description = data.description || '';
        this.profile = data.profile || defaultProfile;

        // Equipment
        this.equipment = [];
        this.hasActed = false; // For Appearance event
    }

    // Helper for easier status checks
    isAlive() {
        return this.hp > 0;
    }

    getSkills() {
        return this.skillIds.map(id => SKILL_CABINET[id]).filter(Boolean);
    }

    // Consolidated method as requested: "use a parameter to determine"
    getSkill(mode) {
        // Mode: 'OFFENSIVE' or 'DEFENSIVE'
        // Legacy support: checks type. 
        // For Active Actions, we usually only want skills triggered by 'ACTION_PHASE' (default)
        return this.getSkills().find(s => (s.type === mode || s.type === 'BOTH') && s.trigger === 'ACTION_PHASE');
    }

    getPassiveSkills(triggerEvent) {
        return this.getSkills().filter(s => s.trigger === triggerEvent);
    }


    async act(context) {
        // --- Event: Appearance ---
        if (!this.hasActed) {
            const { bus } = await import('../systems/EventBus');
            bus.emit('Character:Appearance', { character: this, context });
            this.hasActed = true;
        }

        // Notify start of action for UI animation
        const { bus } = await import('../systems/EventBus');
        bus.emit('Character:ActionStart', { characterId: this.id });

        const results = [];
        // Determine mode based on context.activeFaction
        // If it's MY faction's turn, I use OFFENSIVE.
        // If it's NOT my faction's turn, I might use DEFENSIVE (if targeted/triggered).

        // However, the standard "Act" call usually implies it IS my turn.
        // The user said: "Faction[0]'s turn... Faction[0] characters execute offensive skills"
        // So `act` should primarily run OFFENSIVE skills if it is my turn.

        // We can pass a specific mode if we want to force something, 
        // but default should be determined by context or just 'OFFENSIVE' for the main loop.

        const isMyTurn = context.activeFaction && this.faction && context.activeFaction.id === this.faction.id;
        const mode = isMyTurn ? 'OFFENSIVE' : 'DEFENSIVE';

        // Optimization: Filter skills by mode (Step 1 Trigger)
        // We only want skills that match the current mode and are Active (Trigger: ACTION_PHASE)
        const skills = this.getSkills().filter(s =>
            (s.type === mode || s.type === 'BOTH') &&
            s.trigger === 'ACTION_PHASE'
        );

        for (const skill of skills) {
            // skill.perform will check internal type vs mode and validity
            const result = await skill.perform(this, { ...context, mode });
            if (result) results.push(result);
        }
        return results;
    }

    // --- Equipment Support ---
    equip(item) {
        if (!item) return;
        this.equipment.push(item);
        if (item.onEquip) item.onEquip(this);
    }

    unequip(item) {
        const idx = this.equipment.indexOf(item);
        if (idx > -1) {
            this.equipment.splice(idx, 1);
            if (item.onUnequip) item.onUnequip(this);
        }
    }
}
