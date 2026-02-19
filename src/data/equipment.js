import { Equipment } from '../models/Equipment';
import { bus } from '../systems/EventBus';
import { Skill } from '../models/Skill';

export class SharpDagger extends Equipment {
    constructor() {
        super({
            id: 'sharp_dagger',
            name: 'Sharp Dagger',
            description: 'Deals +1 damage when targeting a single enemy.',
            type: 'WEAPON'
        });

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
        if (!payload.context || !payload.context.user) return;
        if (payload.context.user.id !== this.equippedBy.id) return;

        if (payload.targets.length === 1) {
            payload.amount += 1;
        }
    }
}

// --- NEW EQUIPMENT ---

export class GuardianShield extends Equipment {
    constructor() {
        super({
            id: 'guardian_shield',
            name: 'Guardian Shield',
            description: 'Reduces all incoming damage by 1.',
            type: 'ARMOR'
        });
        this.handleDefense = this.handleDefense.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:CausingDamage', this.handleDefense);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:CausingDamage', this.handleDefense);
    }

    handleDefense(payload) {
        // Trigger if owner is a target
        if (!payload.targets || !this.equippedBy) return;
        const isTargeted = payload.targets.some(t => t.id === this.equippedBy.id);

        if (isTargeted) {
            // Reduce damage by 1, minimum 0
            payload.amount = Math.max(0, payload.amount - 1);
        }
    }
}

export class VampireFang extends Equipment {
    constructor() {
        super({
            id: 'vampire_fang',
            name: 'Vampire Fang',
            description: 'Heal 1 HP when dealing damage.',
            type: 'ACCESSORY'
        });
        this.handleAttack = this.handleAttack.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:CausingDamage', this.handleAttack);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:CausingDamage', this.handleAttack);
    }

    handleAttack(payload) {
        // Trigger if owner is the user (attacker)
        if (!payload.context || !payload.context.user) return;
        if (payload.context.user.id !== this.equippedBy.id) return;

        // Prevent infinite loops if heal causes damage (unlikely but safe)
        if (payload.context.isVampiric) return;

        // Heal owner
        Skill.Heal([this.equippedBy], 1);
    }
}

export class CounterRing extends Equipment {
    constructor() {
        super({
            id: 'counter_ring',
            name: 'Counter Ring',
            description: '50% chance to deal 1 DMG to attacker when hit.',
            type: 'ACCESSORY'
        });
        this.handleHit = this.handleHit.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:TakeDamage', this.handleHit);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:TakeDamage', this.handleHit);
    }

    handleHit(payload) {
        // payload = { target, amount, source }
        if (payload.target.id !== this.equippedBy.id) return;
        if (!payload.source || payload.source.id === this.equippedBy.id) return;

        // Check chance
        if (Math.random() > 0.5) {
            // Create a safe context for the counter attack
            const counterContext = { user: this.equippedBy, isCounter: true };

            // Deal damage back
            Skill.ApplyDamage([payload.source], 1, counterContext);
            console.log(`${this.equippedBy.name}'s Counter Ring activates!`);
        }
    }
}

export class SniperScope extends Equipment {
    constructor() {
        super({
            id: 'sniper_scope',
            name: 'Sniper Scope',
            description: 'Deal +2 DMG when targeting a single fully healthy enemy.',
            type: 'ACCESSORY'
        });
        this.handleAim = this.handleAim.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:CausingDamage', this.handleAim);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:CausingDamage', this.handleAim);
    }

    handleAim(payload) {
        if (!payload.context || !payload.context.user) return;
        if (payload.context.user.id !== this.equippedBy.id) return;

        if (payload.targets.length === 1) {
            const target = payload.targets[0];
            // Check if full HP (fuzzy check or exact?)
            // Assuming maxHp is reliable
            if (target.hp >= target.maxHp) {
                payload.amount += 2;
            }
        }
    }
}

export class GamblersCoin extends Equipment {
    constructor() {
        super({
            id: 'gamblers_coin',
            name: 'Gambler\'s Coin',
            description: 'If incoming damage occurs when Dice was 1, negate it (0 DMG).',
            type: 'ACCESSORY'
        });
        this.handleLuck = this.handleLuck.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:CausingDamage', this.handleLuck);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:CausingDamage', this.handleLuck);
    }

    handleLuck(payload) {
        // Defensive trigger
        if (!payload.targets || !this.equippedBy) return;
        const isTargeted = payload.targets.some(t => t.id === this.equippedBy.id);

        if (isTargeted) {
            // Check dice from context
            const dice = payload.context ? payload.context.dice : null;
            if (dice === 1) {
                payload.amount = 0;
                console.log("Gambler's Coin negated damage!");
            }
        }
    }
}

export class FlameSword extends Equipment {
    constructor() {
        super({
            id: 'flame_sword',
            name: 'Flame Sword',
            description: '+1 DMG. If user rolled a 6, deal +2 DMG instead.',
            type: 'WEAPON'
        });
        this.handleStrike = this.handleStrike.bind(this);
    }

    onEquip(character) {
        super.onEquip(character);
        bus.on('Skill:CausingDamage', this.handleStrike);
    }

    onUnequip(character) {
        super.onUnequip(character);
        bus.off('Skill:CausingDamage', this.handleStrike);
    }

    handleStrike(payload) {
        if (!payload.context || !payload.context.user) return;
        if (payload.context.user.id !== this.equippedBy.id) return;

        const dice = payload.context.dice;
        if (dice === 6) {
            payload.amount += 2;
        } else {
            payload.amount += 1;
        }
    }
}
