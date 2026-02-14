
import { Combat } from './Combat';
import { ActionSequence } from './ActionSequence';

// Mock ActionSequence
jest.mock('./ActionSequence');

describe('Combat System with Immer', () => {
    let mockFactions;

    beforeEach(() => {
        // Setup mock factions with minimal required structure
        mockFactions = [
            { id: 'f1', name: 'Faction 1', characters: [{ id: 'c1', hp: 10 }] },
            { id: 'f2', name: 'Faction 2', characters: [{ id: 'c2', hp: 10 }] }
        ];

        // Reset mock
        ActionSequence.resolveTurn.mockClear();
    });

    test('processMainTurn should return a new immutable state with modifications', async () => {
        // Mock implementation to verify mutation on draft works
        ActionSequence.resolveTurn.mockImplementation(async (draft, activeFactionId, diceValue, extraContext) => {
            // Simulate mutation
            const char = draft[0].characters[0];
            char.hp -= 5;
            return { logs: ['Character took damage'] };
        });

        const activeFactionId = 'f1';
        const diceValue = 4;
        const extraContext = {};

        const result = await Combat.processMainTurn(mockFactions, activeFactionId, diceValue, extraContext);

        // Verify result structure
        expect(result).toHaveProperty('factions');
        expect(result).toHaveProperty('logs');
        expect(result.logs).toContain('Character took damage');

        // Verify immutability
        expect(result.factions[0].characters[0].hp).toBe(5); // Mutation applied
        expect(mockFactions[0].characters[0].hp).toBe(10); // Original state untouched
    });
});
