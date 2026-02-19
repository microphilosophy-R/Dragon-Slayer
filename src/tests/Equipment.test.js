import { bus } from '../systems/EventBus';
import { Character } from '../models/Character';
import { Skill } from '../models/Skill';
import { GuardianShield, VampireFang, CounterRing, SniperScope, GamblersCoin, FlameSword } from '../data/equipment';

jest.mock('../models/Skill');

describe('Equipment System', () => {
    let char, enemy;

    beforeEach(() => {
        if (bus.clear) bus.clear();
        // Reset listeners if clear doesn't do it? 
        // EventBus usually has a way to reset.

        char = new Character({ id: 'hero', name: 'Hero', hp: 10, maxHp: 10 });
        enemy = new Character({ id: 'enemy', name: 'Enemy', hp: 10, maxHp: 10 });

        // Mock Skill static methods
        Skill.ApplyDamage = jest.fn();
        Skill.Heal = jest.fn();
    });

    test('GuardianShield reduces damage', () => {
        const shield = new GuardianShield();
        shield.onEquip(char);

        const payload = { targets: [char], amount: 5 };
        bus.emit('Skill:CausingDamage', payload);

        expect(payload.amount).toBe(4);

        shield.onUnequip(char);
    });

    test('VampireFang heals on dealing damage', () => {
        const fang = new VampireFang();
        fang.onEquip(char);

        const payload = {
            targets: [enemy],
            amount: 5,
            context: { user: char }
        };
        bus.emit('Skill:CausingDamage', payload);

        expect(Skill.Heal).toHaveBeenCalledWith([char], 1);

        fang.onUnequip(char);
    });

    test('CounterRing deals damage when hit', () => {
        const ring = new CounterRing();
        ring.onEquip(char);

        // Mock random to hit
        jest.spyOn(Math, 'random').mockReturnValue(0.9); // > 0.5

        bus.emit('Skill:TakeDamage', { target: char, source: enemy, amount: 5 });

        expect(Skill.ApplyDamage).toHaveBeenCalled();
        const args = Skill.ApplyDamage.mock.calls[0];
        expect(args[0][0]).toBe(enemy);
        expect(args[1]).toBe(1);
        expect(args[2]).toMatchObject({ isCounter: true });

        jest.restoreAllMocks();
        ring.onUnequip(char);
    });

    test('SniperScope boosts damage on full HP', () => {
        const scope = new SniperScope();
        scope.onEquip(char);

        const payload = {
            targets: [enemy],
            amount: 2,
            context: { user: char }
        };
        bus.emit('Skill:CausingDamage', payload);

        expect(payload.amount).toBe(4); // 2 + 2

        // Not full HP
        enemy.hp = 9;
        payload.amount = 2;
        bus.emit('Skill:CausingDamage', payload);
        expect(payload.amount).toBe(2);

        scope.onUnequip(char);
    });

    test('GamblersCoin negates damage on Dice 1', () => {
        const coin = new GamblersCoin();
        coin.onEquip(char);

        const payload = {
            targets: [char],
            amount: 5,
            context: { dice: 1 }
        };
        bus.emit('Skill:CausingDamage', payload);

        expect(payload.amount).toBe(0);

        // Dice 2
        payload.amount = 5;
        payload.context.dice = 2;
        bus.emit('Skill:CausingDamage', payload);
        expect(payload.amount).toBe(5);

        coin.onUnequip(char);
    });

    test('FlameSword boosts damage', () => {
        const sword = new FlameSword();
        sword.onEquip(char);

        const payload = {
            targets: [enemy],
            amount: 2,
            context: { user: char, dice: 4 }
        };
        bus.emit('Skill:CausingDamage', payload);
        expect(payload.amount).toBe(3); // 2 + 1

        // Dice 6
        payload.amount = 2;
        payload.context.dice = 6;
        bus.emit('Skill:CausingDamage', payload);
        expect(payload.amount).toBe(4); // 2 + 2

        sword.onUnequip(char);
    });
});
