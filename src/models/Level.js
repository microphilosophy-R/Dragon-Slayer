export class Level {
    constructor(id, name, enemyFactionData, rewards = {}, rules = {}) {
        this.id = id;
        this.name = name;
        this.enemyFactionData = enemyFactionData; // Configuration to spawn enemy faction
        this.rewards = rewards;
        this.rules = rules;
    }
}
