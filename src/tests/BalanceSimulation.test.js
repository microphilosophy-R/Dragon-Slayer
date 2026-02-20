import { Combat } from '../systems/Combat';
import { Faction } from '../models/Faction';
import { Character } from '../models/Character';
import { Skill } from '../models/Skill';
import { bus } from '../systems/EventBus';
import { ActionSequence } from '../systems/ActionSequence';

describe('Balance Simulation', () => {
    afterEach(() => {
        bus.clear();
    });

    it('simulates combat and calculates effective damage', async () => {
        // Define standard Enemy Skill
        const enemySkill = Skill.generate({
            id: "test_enemy_atk",
            name: "Enemy Attack",
            type: "OFFENSIVE",
            targeting: { scope: 'ENEMIES', max: 1 },
            execution: { damage: { amount: 2 } }
        });

        // Function to run a single simulation for a character archetype
        async function runSimForArchetype(charHp, charSpeed, charEv) {
            let totalDamageDealt = 0;
            const NUM_RUNS = 100;

            for (let i = 0; i < NUM_RUNS; i++) {
                bus.clear();

                // Track damage caused by faction 1
                const recordDamage = (payload) => {
                    // Check if damage is from Faction 1
                    if (payload.context && payload.context.user && payload.context.user.faction && payload.context.user.faction.id === 'F1') {
                        if (payload.amount > 0) {
                            totalDamageDealt += payload.amount;
                        }
                    }
                };
                bus.on('Skill:CausingDamage', recordDamage);

                // Create Faction 1 (2 Copies of Character)
                const charSkill = Skill.generate({
                    id: "test_char_atk",
                    name: "Char Attack",
                    type: "OFFENSIVE",
                    targeting: { scope: 'ENEMIES', max: 1 },
                    // Simplified: directly deal EV damage to simulate average output
                    execution: { damage: { amount: charEv } }
                });

                const char1 = new Character({
                    id: 'c1', name: 'TestChar1', hp: charHp, maxHp: charHp, speed: charSpeed,
                    skills: [] // manually assign later to inject instances if needed, but we can assign IDs and mock the skill lookup
                });
                char1.getSkills = () => [charSkill];

                const char2 = new Character({
                    id: 'c2', name: 'TestChar2', hp: charHp, maxHp: charHp, speed: charSpeed,
                    skills: []
                });
                char2.getSkills = () => [charSkill];

                const faction1 = new Faction('F1', 'PLAYER', 'Faction 1');
                faction1.addCharacter(char1);
                faction1.addCharacter(char2);

                // Create Faction 2 (2 Enemies)
                const enemy1 = new Character({
                    id: 'e1', name: 'Enemy1', hp: 9999, maxHp: 9999, speed: 5,
                    skills: []
                });
                enemy1.getSkills = () => [enemySkill];

                const enemy2 = new Character({
                    id: 'e2', name: 'Enemy2', hp: 9999, maxHp: 9999, speed: 5,
                    skills: []
                });
                enemy2.getSkills = () => [enemySkill];

                const faction2 = new Faction('F2', 'COMPUTER', 'Faction 2');
                faction2.addCharacter(enemy1);
                faction2.addCharacter(enemy2);

                let factions = [faction1, faction2];
                Combat.setupPassiveListeners(factions);

                // Combat Loop
                let round = 1;
                while (factions[0].livingMembers.length > 0 && factions[1].livingMembers.length > 0 && round < 50) {
                    // Faction 1 Turn
                    const activeFactionId1 = 'F1';
                    const res1 = await Combat.processMainTurn(factions, activeFactionId1, 4, {});
                    factions = res1.factions;

                    if (factions[0].livingMembers.length === 0 || factions[1].livingMembers.length === 0) break;

                    // Faction 2 Turn
                    const activeFactionId2 = 'F2';
                    const res2 = await Combat.processMainTurn(factions, activeFactionId2, 4, {});
                    factions = res2.factions;

                    round++;
                }
            }

            const avgDamage = totalDamageDealt / NUM_RUNS;
            return avgDamage;
        }

        // Test Archetypes to determine coefficients
        const archetypes = [
            { hp: 4, speed: 5, ev: 1, name: "Baseline (4HP, 5Spd, 1EV)" },
            { hp: 8, speed: 5, ev: 1, name: "Tank (8HP, 5Spd, 1EV)" },
            { hp: 4, speed: 8, ev: 1, name: "Fast (4HP, 8Spd, 1EV)" },
            { hp: 4, speed: 2, ev: 1, name: "Slow (4HP, 2Spd, 1EV)" },
            { hp: 4, speed: 5, ev: 2, name: "Glass Cannon (4HP, 5Spd, 2EV)" },
            { hp: 8, speed: 2, ev: 1.5, name: "Bruiser (8HP, 2Spd, 1.5EV)" },
        ];

        console.log("--- Balance Simulation Results ---");
        for (const arch of archetypes) {
            const avgDmg = await runSimForArchetype(arch.hp, arch.speed, arch.ev);
            // The formula user gave: Score = (hp/4 + (speed-5)/9) * (EVs)
            const formulaScore = (arch.hp / 4 + (arch.speed - 5) / 9) * arch.ev;
            // Since we have 2 copies of the character, the damage output for 1 character is half of the faction's output.
            const singleCharDmg = avgDmg / 2;
            console.log(`${arch.name}: Single Char Avg Damage Caused = ${singleCharDmg.toFixed(2)} | Formula Score = ${formulaScore.toFixed(2)}`);
        }
        console.log("----------------------------------");
    });
});
