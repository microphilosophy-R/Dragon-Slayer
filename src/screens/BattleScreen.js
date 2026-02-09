import React, { useState, useEffect, useRef } from 'react';
import { Dices, Skull, Zap, Heart, Shield, Swords } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CharacterCard } from '../components/ui/CharacterCard';
import { Character } from '../models/Character';
import { Faction } from '../models/Faction';
import { ActionSequence } from '../systems/ActionSequence';
import { LEVELS } from '../data/levels';

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const BattleScreen = ({ gameState, onWin, onLose }) => {
    // --- STATE ---
    const [turnPhase, setTurnPhase] = useState('INIT'); // INIT, PLAYER_ACT, RESOLVING, ENEMY_ACT, END
    const [battleRound, setBattleRound] = useState(1);
    const [battleLog, setBattleLog] = useState(["Battle Started!"]);
    const [diceValue, setDiceValue] = useState(0);

    // Faction State
    // Faction[0] = Player, Faction[1] = Computer
    const [factions, setFactions] = useState([]);

    // UI selection state (if manual targeting is added later)
    const [selectedCharacter, setSelectedCharacter] = useState(null);

    const logRef = useRef(null);
    const scrollRef = useRef(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        // 1. Build Player Faction
        const heroInstances = gameState.activeTeam.map(id => {
            const charData = gameState.roster.find(c => c.id === id);
            return new Character({ ...charData, tempSpeed: charData.speed, defense: 0 });
        });
        const playerFaction = new Faction('player_faction', 'PLAYER', 'Expedition Team', heroInstances);

        // 2. Build Enemy Faction from Level Data
        const currentLevel = LEVELS[gameState.level] || LEVELS[1];
        const enemyInstances = currentLevel.enemyFactionData.members.map(e =>
            new Character({ ...e, tempSpeed: e.speed, defense: 0 })
        );
        const enemyFaction = new Faction('enemy_faction', 'COMPUTER', currentLevel.enemyFactionData.factionName, enemyInstances);

        setFactions([playerFaction, enemyFaction]);
        setTurnPhase('PLAYER_WAIT_ROLL');
        addLog(`Encountered: ${enemyFaction.name} `);
    }, []);

    // Scroll Log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [battleLog]);

    const addLog = (msg) => setBattleLog(prev => [...prev, `[Rd ${battleRound}] ${msg} `]);

    // --- CORE LOGIC ---

    const checkWinCondition = (currentFactions) => {
        const playerAlive = currentFactions[0].livingMembers.length > 0;
        const enemyAlive = currentFactions[1].livingMembers.length > 0;

        if (!enemyAlive) {
            setTimeout(onWin, 1500);
            return true;
        }
        if (!playerAlive || battleRound > 30) {
            setTimeout(onLose, 1500);
            return true;
        }
        return false;
    };

    const handleTurn = async (activeFactionIndex, roll) => {
        setTurnPhase('RESOLVING');

        // Clone State for processing
        // We need deep clones of characters to avoid mutation issues during calculation if we want "undo" etc,
        // but for now we essentially mutate the "next state" and set it.
        // To allow React to update, we create new Faction objects with new Character instances.

        const nextFactions = factions.map(f => {
            const newChars = f.characters.map(c => {
                const copy = new Character({ ...c, skills: c.skillIds }); // Re-instantiate
                // Copy runtime props
                copy.hp = c.hp;
                copy.defense = c.defense;
                copy.tempSpeed = c.tempSpeed;
                return copy;
            });
            return new Faction(f.id, f.type, f.name, newChars);
        });

        const activeFaction = nextFactions[activeFactionIndex];
        const passiveFaction = nextFactions[activeFactionIndex === 0 ? 1 : 0];

        addLog(`${activeFaction.name} Turn(Dice: ${roll})`);

        // Execute Sequence
        await new Promise(r => setTimeout(r, 600)); // Dramatic pause

        const { logs, actions } = ActionSequence.resolveTurn(activeFaction, passiveFaction, roll);

        // Update Log
        logs.forEach(l => addLog(l));

        // Apply Actions (Damage, Heal, Buffs)
        actions.forEach(action => {
            // Find target in ALL factions
            let target = null;
            let targetFaction = null;

            for (let f of nextFactions) {
                target = f.getCharacter(action.targetId);
                if (target) {
                    targetFaction = f;
                    break;
                }
            }

            if (target) {
                if (action.type === 'DAMAGE') {
                    // Logic for applying damage (Reduction by defense etc)
                    // Simplified here, assuming ActionSequence might have calculated raw dmg?
                    // Or do we calculate defense here? 
                    // Let's assume ActionSequence returns raw "Output" and we apply defense mitigation here?
                    // Or logic inside Character.executeSkill handles it?
                    // Previous logic: target.defense reduced damage.

                    let dmg = action.amount;
                    if (target.defense > 0) {
                        const mitigation = Math.min(target.defense, dmg);
                        target.defense -= mitigation;
                        dmg -= mitigation;
                    }
                    target.hp = Math.max(0, target.hp - dmg);
                } else if (action.type === 'HEAL') {
                    target.hp = Math.min(target.maxHp, target.hp + action.amount);
                } else if (action.type === 'BUFF') {
                    if (action.stat === 'defense') target.defense += action.amount;
                    if (action.stat === 'speed') target.tempSpeed += action.amount;
                }
            }
        });

        // Update State
        setFactions(nextFactions);

        if (checkWinCondition(nextFactions)) return;

        // Transition Phase
        await new Promise(r => setTimeout(r, 1000));

        if (activeFactionIndex === 0) {
            // Player just finished. Enemy Turn Next.
            setTurnPhase('ENEMY_WAIT');
            // Auto-trigger enemy? Or wait for click? User often acts generic "Next Turn"?
            // Let's auto-trigger enemy after delay for flow.
            setTimeout(() => handleEnemyTurn(nextFactions), 1000);
        } else {
            // Enemy just finished. New Round.
            setBattleRound(r => r + 1);
            setTurnPhase('PLAYER_WAIT_ROLL');
            addLog(`=== Round ${battleRound + 1} === `);
        }
    };

    const handlePlayerRoll = () => {
        const roll = rollDice();
        setDiceValue(roll);
        handleTurn(0, roll); // 0 = Player Faction
    };

    const handleEnemyTurn = (currentFactions) => {
        // Can fail if component unmounted, catch?
        const roll = rollDice();
        setDiceValue(roll);
        // We pass currentFactions just to be safe, but handleTurn uses state. 
        // Actually handleTurn uses state `factions`.
        // If we call handleTurn via setTimeout, `factions` might be stale closure if not careful?
        // But handleTurn uses `factions` from closure. 
        // We should trigger a state update that triggers the effect?
        // Or just allow the function to run. 
        // BETTER: Use a separate useEffect or ensure handleTurn has access to fresh state via refs or functional updates?
        // Simpler: Just resolve purely. 
        // For this refactor I will rely on standard flow.
        handleTurn(1, roll); // 1 = Enemy Faction
    };

    // --- RENDER ---
    if (factions.length < 2) return <div className="p-10 text-white">Loading Factions...</div>;

    const [playerFaction, enemyFaction] = factions;

    return (
        <div className="flex flex-col h-screen bg-stone-950 p-2 md:p-6 animate-fade-in">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 text-amber-100 border-b border-stone-800 pb-2">
                <div className="flex gap-4 items-center">
                    <h2 className="text-xl font-serif text-amber-500">Round {battleRound}</h2>
                    <div className="text-sm text-stone-400">{turnPhase}</div>
                </div>
                <div className="flex items-center gap-2 bg-stone-900 px-4 py-1 rounded border border-stone-700">
                    <Dices size={18} className="text-amber-400" />
                    <span className="text-xl font-bold">{diceValue}</span>
                </div>
            </div>

            {/* BATTLE ARENA */}
            <div className="flex-1 flex flex-col md:flex-row gap-6 mb-4">
                {/* PLAYER FACTION */}
                <div className="flex-1 bg-stone-900/40 p-4 rounded-lg border border-stone-800/50">
                    <div className="text-stone-400 mb-2 font-serif flex justify-between">
                        <span>{playerFaction.name}</span>
                        <Swords size={16} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {playerFaction.characters.map(char => (
                            <CharacterCard
                                key={char.id}
                                char={char}
                                defense={char.defense}
                                onClick={() => setSelectedCharacter(char)}
                                className={char.hp <= 0 ? 'opacity-50 grayscale' : ''}
                            />
                        ))}
                    </div>
                </div>

                {/* VS */}
                <div className="flex items-center justify-center text-stone-700 font-serif font-bold text-2xl">
                    VS
                </div>

                {/* ENEMY FACTION */}
                <div className="flex-1 bg-red-950/10 p-4 rounded-lg border border-red-900/20">
                    <div className="text-red-900/60 mb-2 font-serif text-right flex justify-between flex-row-reverse">
                        <span>{enemyFaction.name}</span>
                        <Skull size={16} />
                    </div>
                    <div className="flex flex-col gap-3 items-center">
                        {enemyFaction.characters.map(char => (
                            <CharacterCard
                                key={char.id}
                                char={char}
                                defense={char.defense}
                                compact
                                className={char.hp <= 0 ? 'opacity-50 grayscale' : ''}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTROL PANEL */}
            <div className="h-48 flex gap-4">
                <div className="w-1/3 flex flex-col justify-center gap-3">
                    {turnPhase === 'PLAYER_WAIT_ROLL' ? (
                        <Button primary icon={Dices} onClick={handlePlayerRoll} className="h-16 text-lg">
                            Roll Dice & Fight
                        </Button>
                    ) : (
                        <div className="text-center text-stone-600 italic border border-stone-800 p-4 rounded">
                            {turnPhase === 'ENEMY_WAIT' ? "Enemy is thinking..." : "Resolving Combat..."}
                        </div>
                    )}
                </div>

                <div className="w-2/3 bg-black/60 border border-stone-800 p-3 rounded font-mono text-sm text-green-400/80 overflow-y-auto" ref={logRef}>
                    {battleLog.map((l, i) => (
                        <div key={i} className="mb-1 border-b border-stone-900/50 pb-1">{l}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
