import { SKILL_CABINET } from '../data/skills';

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

        // Skills (Array of IDs or Objects)
        // User requested: Faction -> Characters -> Skills
        // We will store IDs and resolve them, or store usage context
        this.skillIds = data.skills || data.skillIds || [];

        // Legacy support during migration (optional)
        if (data.offensiveSkillId && !this.skillIds.includes(data.offensiveSkillId)) this.skillIds.push(data.offensiveSkillId);
        if (data.defensiveSkillId && !this.skillIds.includes(data.defensiveSkillId)) this.skillIds.push(data.defensiveSkillId);

        // Display info
        this.description = data.description || '';
    }

    getSkills() {
        return this.skillIds.map(id => SKILL_CABINET[id]).filter(Boolean);
    }

    // Consolidated method as requested: "use a parameter to determine"
    executeSkill(mode, targets, context) {
        // Mode: 'OFFENSIVE' or 'DEFENSIVE'
        // For now, we pick the first skill that matches the mode OR just the first skill if generic?
        // Most simple logic: Try to find a skill that explicitly claims to support this mode, 
        // OR if the skill is generic, use it.
        // Current SKILL_CABINET info has 'type'.

        const relevantSkill = this.getSkills().find(s => s.type === mode || s.type === 'BOTH');

        if (!relevantSkill) return { log: `${this.name} has no ${mode} skill!`, actions: [] };

        return relevantSkill.execute(this, targets, context);
    }
}
