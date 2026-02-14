import React, { useState, useEffect, useRef } from 'react';
import { Dices, Skull, Zap, Heart, Shield, Swords } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CharacterCard } from '../components/ui/CharacterCard';
import { ActionSequence } from '../systems/ActionSequence';
import { Combat } from '../systems/Combat';
import { LEVELS } from '../data/levels';
import { CHARACTERS } from '../data/characters';
import { Faction } from '../models/Faction';
import { Character } from '../models/Character';

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const BattleScreen = ({ gameState, onWin, onLose }) => {
    // --- STATE ---
    const [turnPhase, setTurnPhase] = useState('INIT'); // INIT, PLAYER_ACT, RESOLVING, ENEMY_ACT, END
    const [battleRound, setBattleRound] = useState(1);
    const [battleLog, setBattleLog] = useState(["Battle Started!"]);
    const [diceValue, setDiceValue] = useState(0);
    const [diceHistory, setDiceHistory] = useState([]);
    const [memory, setMemory] = useState({});

    // Faction State
    // Faction[0] = Player, Faction[1] = Computer
    const [factions, setFactions] = useState([]);

    // UI selection state
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    // Targeting State: { active: boolean, candidates: [], resolve: fn }
    const [targetingState, setTargetingState] = useState(null);

    const logRef = useRef(null);
    const scrollRef = useRef(null);

    // --- INITIALIZATION ---
    // --- INITIALIZATION ---
    useEffect(() => {
        // 1. Build Player Faction
        const heroInstances = gameState.activeTeam.map(id => {
            const charData = gameState.roster.find(c => c.id === id);
            return new Character({ ...charData, tempSpeed: charData.speed, defense: 0 });
        });
        // Use 'PLAYER' type to distinguish user control
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

    // Passive Listener Setup
    useEffect(() => {
        if (factions.length > 0) {
            const cleanup = Combat.setupPassiveListeners(factions);
            return () => cleanup();
        }
    }, [factions]); // Re-bind if factions change structure (unlikely deep change, but safe)


    // --- CORE LOGIC ---

    const requestPlayerTarget = (candidates) => {
        return new Promise((resolve) => {
            setTargetingState({
                active: true,
                candidates: candidates,
                resolve: (target) => {
                    setTargetingState(null);
                    resolve(target);
                }
            });
            addLog("Choose your target!");
        });
    };

    const handleCardClick = (char) => {
        if (targetingState?.active) {
            // Check if valid candidate
            const isValid = targetingState.candidates.find(c => c.id === char.id);
            if (isValid) {
                targetingState.resolve(char);
            } else {
                addLog("Invalid target.");
            }
        } else {
            setSelectedCharacter(char);
        }
    };

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

    const handleTurn = async (activeFactionIndexProp, roll) => {
        // NOTE: We ignore activeFactionIndexProp and always assume Player Start -> Enemy Follows
        // because the UI flow drives "Roll -> Round Execution".

        // --- ROUND START ---
        // We import dynamically to avoid circular deps if any, or just standard import. 
        // Better to verify if 'bus' is available. 
        const { bus } = await import('../systems/EventBus');
        bus.emit('Round:Start', { round: battleRound });

        setTurnPhase('RESOLVING');

        // 1. Snapshot State (Clone) to ensure proper mutation tracking
        // We use an internal variable `currentFactions` to track state across the async steps.
        // With Immer refactor, we pass the current state (factions) and get back the new state.
        let currentFactions = factions;

        // --- PLAYER TURN ---
        const playerFactionId = currentFactions[0].id;
        addLog(`${currentFactions[0].name} Turn (Dice: ${roll})`);

        // Wait a bit for effect
        await new Promise(r => setTimeout(r, 600));

        const res1 = await Combat.processMainTurn(currentFactions, playerFactionId, roll, {
            history: diceHistory,
            memory,
            requestPlayerTarget
        });

        // Update Logs & State
        res1.logs.forEach(l => addLog(l));
        currentFactions = res1.factions; // Update our local tracking reference
        setFactions(currentFactions); // Render updates

        if (checkWinCondition(currentFactions)) return;

        // --- ENEMY TURN ---
        setTurnPhase('ENEMY_WAIT');
        await new Promise(r => setTimeout(r, 1000));

        const enemyRoll = rollDice();
        // Update dice UI for enemy?
        setDiceValue(enemyRoll);
        const newHistory = [...diceHistory, enemyRoll];
        setDiceHistory(newHistory);
        addLog(`${currentFactions[1].name} Turn (Dice: ${enemyRoll})`);

        const enemyFactionId = currentFactions[1].id;
        const res2 = await Combat.processMainTurn(currentFactions, enemyFactionId, enemyRoll, {
            history: newHistory,
            memory,
            // Enemy doesn't use manual targeting, but pass it just in case of weird skills
            requestPlayerTarget
        });

        res2.logs.forEach(l => addLog(l));
        currentFactions = res2.factions;
        setFactions(currentFactions);

        if (checkWinCondition(currentFactions)) return;

        // --- END ROUND ---
        bus.emit('Round:End', { round: battleRound });
        setBattleRound(r => r + 1);
        setTurnPhase('PLAYER_WAIT_ROLL');
        addLog(`=== Round ${battleRound + 1} === `);
    };

    const handlePlayerRoll = () => {
        const roll = rollDice();
        setDiceValue(roll);
        setDiceHistory(prev => [...prev, roll]);
        handleTurn(0, roll);
    };

    // handleEnemyTurn is removed as it's now integrated directly into handleTurn sequence.

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
                        {playerFaction.characters.map(char => {
                            const isTargetable = targetingState?.active && targetingState.candidates.find(c => c.id === char.id);
                            return (
                                <CharacterCard
                                    key={char.id}
                                    char={char}
                                    defense={char.defense}
                                    onClick={() => handleCardClick(char)}
                                    className={`
                                    ${char.hp <= 0 ? 'opacity-50 grayscale' : ''}
                                    ${isTargetable ? 'ring-2 ring-amber-400 cursor-pointer scale-105' : ''}
                                `}
                                />
                            )
                        })}
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
                        {enemyFaction.characters.map(char => {
                            const isTargetable = targetingState?.active && targetingState.candidates.find(c => c.id === char.id);
                            return (
                                <CharacterCard
                                    key={char.id}
                                    char={char}
                                    defense={char.defense}
                                    compact
                                    onClick={() => handleCardClick(char)}
                                    className={`
                                    ${char.hp <= 0 ? 'opacity-50 grayscale' : ''}
                                    ${isTargetable ? 'ring-2 ring-red-500 cursor-pointer scale-105' : ''}
                                `}
                                />
                            )
                        })}
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
                            {targetingState?.active ? (
                                <span className="text-amber-400 font-bold animate-pulse">Choose Target...</span>
                            ) : (
                                turnPhase === 'ENEMY_WAIT' ? "Enemy is thinking..." : "Resolving Combat..."
                            )}
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
