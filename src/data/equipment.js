import { Equipment } from '../models/Equipment';
import { bus } from '../systems/EventBus';

export class SharpDagger extends Equipment {
    constructor() {
        super({
            id: 'sharp_dagger',
            name: 'Sharp Dagger',
            description: 'Deals +1 damage when targeting a single enemy.',
            type: 'WEAPON'
        });

        // Bind handler so we can reference 'this' and unsubscribe properly
        this.handleDamage = this.handleDamage.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:CausingDamage', this.handleDamage);
        console.log(`${this.name} equipped to ${character.name}`);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:CausingDamage', this.handleDamage);
        console.log(`${this.name} unequipped from ${character.name}`);
    }

    handleDamage(payload) {
        // payload = { targets, amount, context, type }

        // 1. Check if the skills user is my owner
        // context.user is the one using the skill
        if (!payload.context || !payload.context.user) return;
        if (payload.context.user.id !== this.equippedBy.id) return;

        // 2. Check condition: Targeting only 1 enemy
        // "Deal an addtional 1 damge to the target enemy when targeting only 1 enemy"
        if (payload.targets.length === 1) {
            // Are we targeting an enemy?
            // Usually safe to assume if it's OFFENSIVE skill.
            // Or check if target is in context.enemies

            // payload.amount is mutable
            payload.amount += 1;
        }
    }
}
