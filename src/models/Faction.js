export class Faction {
    constructor(id, type, name, characters = []) {
        this.id = id;
        this.type = type; // 'PLAYER' or 'COMPUTER'
        this.name = name;
        this.characters = characters; // Array of Character objects
        this.characters.forEach(c => c.faction = this);
    }

    addCharacter(character) {
        character.faction = this;
        this.characters.push(character);
    }

    // Helper to get living members
    get livingMembers() {
        return this.characters.filter(c => c.hp > 0);
    }

    // Helper to find a character by ID within this faction
    getCharacter(id) {
        return this.characters.find(c => c.id === id);
    }
}
