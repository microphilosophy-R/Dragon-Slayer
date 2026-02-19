import { bus } from '../systems/EventBus';

/**
 * Base class for all Equipment.
 * Equipment attaches to a Character and subscribes to EventBus events.
 */
export class Equipment {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.type = data.type || 'WEAPON'; // WEAPON, ARMOR, ACCESSORY, LEGENDARY
        this.rarity = data.rarity || 'COMMON'; // COMMON, RARE, LEGENDARY

        // Runtime ref
        this.equippedBy = null;
    }

    /**
     * Called when equipped to a character.
     * @param {Character} character 
     */
    onEquip(character) {
        this.equippedBy = character;
        // Subclasses should override and call super.onEquip(character)
        // OR manually subscribe here.
    }

    /**
     * Called when unequipped.
     * @param {Character} character 
     */
    onUnequip(character) {
        this.equippedBy = null;
        // Subclasses should override to unsubscribe.
    }

    // Helper to verify if the event relates to the owner
    isOwner(character) {
        return this.equippedBy && this.equippedBy.id === character.id;
    }
}
