
import { SKILL_CABINET } from '../data/skills';

export class Character {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.role = data.role || 'Unknown';
        this.hp = data.hp;
        this.maxHp = data.maxHp;
        this.speed = data.speed;
        this.defense = data.defense || 0;

        // Skill IDs (References to Cabinet)
        this.offensiveSkillId = data.offensiveSkillId;
        this.defensiveSkillId = data.defensiveSkillId;

        // Display strings (optional, can fetch from cabinet)
        this.offensiveDesc = data.offensiveSkill || SKILL_CABINET[this.offensiveSkillId]?.description;
        this.defensiveDesc = data.passiveSkill || SKILL_CABINET[this.defensiveSkillId]?.description; // Legacy naming 'passive' mapped to defensive
    }

    get offensiveSkill() {
        return SKILL_CABINET[this.offensiveSkillId];
    }

    get defensiveSkill() {
        return SKILL_CABINET[this.defensiveSkillId];
    }

    performOffensive(targets, context) {
        if (!this.offensiveSkill) return { log: `${this.name} has no offensive skill!`, actions: [] };
        return this.offensiveSkill.execute(this, targets, context);
    }

    performDefensive(targets, context) {
        if (!this.defensiveSkill) return { log: null, actions: [] };
        return this.defensiveSkill.execute(this, targets, context);
    }
}
