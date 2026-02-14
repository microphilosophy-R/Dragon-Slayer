
import { Combat } from '../systems/Combat';
import { Character } from '../models/Character';
import { Skill } from '../models/Skill';
import { bus } from '../systems/EventBus';
import { Faction } from '../models/Faction';

// Mock dependencies
jest.mock('../models/Skill');

describe('Passive Skill System', () => {
    let mockFactions;
    let char1, char2;
    let cleanup;

    beforeEach(() => {
        // Reset Bus
        bus.clear();

        // Setup Characters
        char1 = new Character({ id: 'c1', name: 'Fast Char', speed: 10, hp: 10 });
        char2 = new Character({ id: 'c2', name: 'Slow Char', speed: 5, hp: 10 });

        char1.faction = { id: 'f1' };
        char2.faction = { id: 'f1' };

        mockFactions = [new Faction('f1', 'PLAYER', 'Test', [char1, char2])];

        // Mock getSkills to return passive skills (Plain Objects to avoid Class Mock issues)
        char1.getSkills = jest.fn().mockReturnValue([
            {
                id: 'p1',
                name: 'Fast Passive',
                trigger: 'TEST_EVENT',
                limitPerTurn: 1,
                perform: jest.fn().mockResolvedValue({ log: 'Fast Triggered' })
            }
        ]);
        char1.getPassiveSkills = (t) => char1.getSkills().filter(s => s.trigger === t);

        // Char2: Respond to TEST_EVENT
        char2.getSkills = jest.fn().mockReturnValue([
            {
                id: 'p2',
                name: 'Slow Passive',
                trigger: 'TEST_EVENT',
                limitPerTurn: 1,
                perform: jest.fn().mockResolvedValue({ log: 'Slow Triggered' })
            }
        ]);
        char2.getPassiveSkills = (t) => char2.getSkills().filter(s => s.trigger === t);

        // Spy logic is now direct on the objects since we aren't using the class
    });

    afterEach(() => {
        if (cleanup) cleanup();
    });

    test('should trigger passive skills on event', async () => {
        cleanup = Combat.setupPassiveListeners(mockFactions);

        // Emit event
        await bus.emit('TEST_EVENT', { data: 'test' });

        // Wait for async handlers
        await new Promise(r => setTimeout(r, 10));

        expect(char1.getSkills()[0].perform).toHaveBeenCalled();
        expect(char2.getSkills()[0].perform).toHaveBeenCalled();
    });

    test('should resolve in speed order (Fastest First)', async () => {
        cleanup = Combat.setupPassiveListeners(mockFactions);

        const executionOrder = [];
        char1.getSkills()[0].perform.mockImplementation(async () => {
            executionOrder.push('Fast');
        });
        char2.getSkills()[0].perform.mockImplementation(async () => {
            executionOrder.push('Slow');
        });

        // Emit event
        await bus.emit('TEST_EVENT', {});
        await new Promise(r => setTimeout(r, 10));

        expect(executionOrder[0]).toBe('Fast');
        expect(executionOrder[1]).toBe('Slow');
    });

    test('Integration: Counter Attack triggers on Taking Damage', async () => {


        // Give Char1 the Counter Attack skill (Real Logic)
        // Give Char1 the Counter Attack skill (Real Logic simulation)
        // Since Skill is mocked, we must use a plain object to ensure props are set.
        const counterSkill = {
            id: "std_counter",
            name: "Counter Attack",
            type: "BOTH",
            trigger: "Skill:TakeDamage",
            limitPerTurn: 1,
            // Logic must be manually implemented for the test or we mock perform directly.
            // But we want to test that 'perform' is CALLED.
            // The system (Combat.js) calls perform.
            perform: jest.fn()
        };

        // Mock getSkills for this test only
        // We use a plain object that looks like the skill mostly, but perform is the real one?
        // Wait, we want to test that perform CALLS logic.
        // Actually, we want to test that handlePassiveTrigger calls perform, and perform runs logic.
        // But perform is complicated (imports bus, etc). 
        // Let's just spy on perform, but allow it to run? 
        // Or simply verify perform IS called with correct context containing source.

        const mockPerform = counterSkill.perform;

        char1.getSkills = jest.fn().mockReturnValue([counterSkill]);
        // Simple filter mock
        char1.getPassiveSkills = (trigger) => trigger === 'Skill:TakeDamage' ? [counterSkill] : [];

        cleanup = Combat.setupPassiveListeners(mockFactions);

        // Emit Damage Event: Char2 attacks Char1
        await bus.emit('Skill:TakeDamage', {
            target: char1,
            amount: 5,
            source: char2
        });

        await new Promise(r => setTimeout(r, 10));

        expect(mockPerform).toHaveBeenCalled();
        const callContext = mockPerform.mock.calls[0][1];
        expect(callContext.source.id).toBe('c2'); // Attacker was C2
    });
    test('Integration: Merlin Spatial Shift cancels attack on Dice 6', async () => {
        // Mock Merlin's Passive Skill
        const cancelSkill = {
            id: "merlin_passive_cancel",
            name: "Spatial Shift",
            trigger: "Skill:Targeting",
            limitPerTurn: 1,
            // Logic: Checks if target is 'c1' (Merlin mock) and dice is 6
            perform: jest.fn().mockImplementation(async (user, context) => {
                // Check conditions
                const isTargeted = context.targets.some(t => t.id === 'c1');
                const dice = context.context.dice;
                if (isTargeted && dice >= 6) {
                    context.targets.length = 0; // Cancel
                    return { log: 'Cancelled' };
                }
                return null;
            })
        };

        char1.getSkills = jest.fn().mockReturnValue([cancelSkill]);
        char1.getPassiveSkills = (trigger) => trigger === 'Skill:Targeting' ? [cancelSkill] : [];

        cleanup = Combat.setupPassiveListeners(mockFactions);

        // Simulation: Char2 attacks Char1 with Dice 6
        const targets = [char1];
        const combatContext = { dice: 6 };

        // Emit Skill:Targeting
        // Payload must match what Skill.js emits
        const payload = {
            skill: { id: 'attack' },
            user: char2,
            type: 'SINGLE',
            targets: targets,
            context: combatContext
        };

        await bus.emit('Skill:Targeting', payload);
        await new Promise(r => setTimeout(r, 10));

        // Verify Cancellation
        expect(cancelSkill.perform).toHaveBeenCalled();
        expect(targets.length).toBe(0); // Targets should be empty
    });
});
