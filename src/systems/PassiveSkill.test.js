
import { Combat } from './Combat';
import { Character } from '../models/Character';
import { Skill } from '../models/Skill';
import { bus } from './EventBus';
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
});
