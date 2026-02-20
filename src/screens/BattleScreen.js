import React, { useState, useEffect, useRef } from 'react';
import { Dices, Skull, Zap, Heart, Shield, Swords, FastForward, Play, SkipForward } from 'lucide-react';
import { Button } from '../components/ui/Button';

import { CharacterStack } from '../components/ui/CharacterStack';
import { ActionSequence } from '../systems/ActionSequence';
import { ActionOrderBar } from '../components/ui/ActionOrderBar';
import { Combat } from '../systems/Combat';
import { LEVELS } from '../data/levels';
import { CHARACTERS } from '../data/characters';
import { Faction } from '../models/Faction';
import { Character } from '../models/Character';
import { EQUIP_MAP } from '../systems/SaveManager';

// Import Dice Images
import dice1 from '../images/dice1.png';
import dice2 from '../images/dice2.png';
import dice3 from '../images/dice3.png';
import dice4 from '../images/dice4.png';
import dice5 from '../images/dice5.png';
import dice6 from '../images/dice6.png';

const DICE_IMAGES = {
    1: dice1, 2: dice2, 3: dice3,
    4: dice4, 5: dice5, 6: dice6
};

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const BattleScreen = ({ gameState, onWin, onLose }) => {
    // --- STATE ---
    const [turnPhase, setTurnPhase] = useState('INIT'); // INIT, PLAYER_ACT, RESOLVING, ENEMY_ACT, END
    const [battleRound, setBattleRound] = useState(1);
    const [gameSpeed, setGameSpeed] = useState('NORMAL'); // 'NORMAL', 'FULL', 'SKIP'
    const [battleLog, setBattleLog] = useState(["Battle Started!"]);
    const [diceValue, setDiceValue] = useState(0);
    const [diceHistory, setDiceHistory] = useState([]);
    const [memory, setMemory] = useState({});

    // Faction State
    // Faction[0] = Player, Faction[1] = Computer
    const [factions, setFactions] = useState([]);

    // UI selection state
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [activeCharacterId, setActiveCharacterId] = useState(null);
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
            const inst = new Character({ ...charData, tempSpeed: charData.speed, defense: 0 });

            // Re-equip to bind event listeners for the new combat session
            if (charData.equipment && charData.equipment.length > 0) {
                charData.equipment.forEach(item => {
                    const EqClass = EQUIP_MAP[item.id];
                    if (EqClass) inst.equip(new EqClass());
                });
            }
            return inst;
        });
        // Use 'PLAYER' type to distinguish user control
        const playerFaction = new Faction('player_faction', 'PLAYER', 'Expedition Team', heroInstances, 'amber-600');

        // 2. Build Enemy Faction from Level Data
        const currentLevel = LEVELS[gameState.level] || LEVELS[1];
        const enemyInstances = currentLevel.enemyFactionData.members.map(e => {
            const inst = new Character({ ...e, tempSpeed: e.speed, defense: 0 });
            if (e.equipment && e.equipment.length > 0) {
                e.equipment.forEach(item => {
                    const EqClass = EQUIP_MAP[item.id];
                    if (EqClass) inst.equip(new EqClass());
                });
            }
            return inst;
        });
        const enemyFaction = new Faction('enemy_faction', 'COMPUTER', currentLevel.enemyFactionData.factionName, enemyInstances, 'red-600');

        setFactions([playerFaction, enemyFaction]);
        setTurnPhase('PLAYER_WAIT_ROLL');
        addLog(`Encountered: ${enemyFaction.name} `);
    }, []);

    // Scroll Log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [battleLog]);

    // Cleanup EventBus on unmount
    useEffect(() => {
        const { bus } = require('../systems/EventBus');
        return () => {
            console.log("BattleScreen unmounting, clearing EventBus");
            bus.clear();
        };
    }, []);


    const addLog = (msg) => setBattleLog(prev => [...prev, `[Rd ${battleRound}] ${msg} `]);

    // Passive Listener Setup & Action Animation
    useEffect(() => {
        if (factions.length > 0) {
            const cleanupPassives = Combat.setupPassiveListeners(factions);

            // Listen for Active Action
            const { bus } = require('../systems/EventBus');
            const onActionStart = ({ characterId }) => {
                setActiveCharacterId(characterId);

                // Trigger Animation
                setFactions(prevFactions => {
                    const nextFactions = [...prevFactions];
                    for (const f of nextFactions) {
                        const char = f.characters.find(c => c.id === characterId);
                        if (char) {
                            // Set animation class temporarily
                            char.animationClass = 'animate-attack-lunge';
                            setTimeout(() => {
                                char.animationClass = ''; // Clear after animation
                                // Force re-render if needed, or rely on next state update
                                setFactions([...nextFactions]);
                            }, 300);
                            break;
                        }
                    }
                    return nextFactions;
                });
            };

            // Clear on Turn/Round updates to be safe
            const onTurnEnd = () => setActiveCharacterId(null);

            bus.on('Character:ActionStart', onActionStart);
            bus.on('Turn:End', onTurnEnd);
            bus.on('Round:End', onTurnEnd);

            return () => {
                cleanupPassives();
                bus.off('Character:ActionStart', onActionStart);
                bus.off('Turn:End', onTurnEnd);
                bus.off('Round:End', onTurnEnd);
            };
        }
    }, [factions]); // Re-bind if factions change structure


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
        if (!char) {
            // If explicitly deselecting (char is null), just clear selection unless targeting is active
            if (!targetingState?.active) {
                setSelectedCharacter(null);
            }
            return;
        }

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
            setTimeout(onWin, gameSpeed === 'SKIP' ? 100 : 1500);
            return true;
        }
        if (!playerAlive || battleRound > 30) {
            setTimeout(onLose, gameSpeed === 'SKIP' ? 100 : 1500);
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
        await bus.emitAsync('Round:Start', { round: battleRound });

        setTurnPhase('RESOLVING');
        setSelectedCharacter(null); // Clear any selection from reading skills

        // 1. Snapshot State (Clone) to ensure proper mutation tracking
        // We use an internal variable `currentFactions` to track state across the async steps.
        // With Immer refactor, we pass the current state (factions) and get back the new state.
        let currentFactions = factions;

        // --- PLAYER TURN ---
        const playerFactionId = currentFactions[0].id;
        addLog(`${currentFactions[0].name} Turn (Dice: ${roll})`);

        // Wait a bit for effect
        if (gameSpeed !== 'SKIP') await new Promise(r => setTimeout(r, 600));

        const res1 = await Combat.processMainTurn(currentFactions, playerFactionId, roll, {
            history: diceHistory,
            memory,
            requestPlayerTarget,
            gameSpeed
        });

        // Update Logs & State
        res1.logs.forEach(l => addLog(l));
        currentFactions = res1.factions; // Update our local tracking reference
        setFactions(currentFactions); // Render updates

        if (checkWinCondition(currentFactions)) return;

        // --- ENEMY TURN ---
        setTurnPhase('ENEMY_WAIT');
        if (gameSpeed !== 'SKIP') await new Promise(r => setTimeout(r, 1000));

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
            requestPlayerTarget,
            gameSpeed
        });

        res2.logs.forEach(l => addLog(l));
        currentFactions = res2.factions;
        setFactions(currentFactions);

        if (checkWinCondition(currentFactions)) return;

        // --- END ROUND ---
        await bus.emitAsync('Round:End', { round: battleRound });
        setBattleRound(r => r + 1);
        setTurnPhase('PLAYER_WAIT_ROLL');
        setSelectedCharacter(null); // Clear any selection from reading skills
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
        <div className="flex flex-col h-screen bg-stone-800 p-2 md:p-6 animate-fade-in">
            {/* HEADER */}
            {/* HEADER - Action Order */}
            <div className="flex justify-between items-center mb-4 text-amber-100 border-b border-stone-800 pb-2 gap-4">
                <div className="flex gap-4 items-center flex-shrink-0">
                    <h2 className="text-xl font-serif text-amber-500">Round {battleRound}</h2>
                    <div className="text-sm text-stone-400 font-mono">{turnPhase}</div>
                </div>
                {/* Game Speed Control */}
                <div className="flex gap-1 bg-black/40 p-1 rounded border border-stone-800">
                    <button
                        onClick={() => setGameSpeed('NORMAL')}
                        className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${gameSpeed === 'NORMAL' ? 'bg-amber-900/50 text-amber-200' : 'text-stone-500'}`}
                        title="Normal Speed"
                    >
                        <Play size={16} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => setGameSpeed('FULL')}
                        className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${gameSpeed === 'FULL' ? 'bg-amber-900/50 text-amber-200' : 'text-stone-500'}`}
                        title="Full Animation"
                    >
                        <FastForward size={16} fill="currentColor" />
                    </button>
                    <button
                        onClick={() => setGameSpeed('SKIP')}
                        className={`p-1.5 rounded hover:bg-stone-700 transition-colors ${gameSpeed === 'SKIP' ? 'bg-amber-900/50 text-amber-200' : 'text-stone-500'}`}
                        title="Skip Animations"
                    >
                        <SkipForward size={16} fill="currentColor" />
                    </button>
                </div>
            </div>

            {/* BATTLE ARENA */}
            {/* BATTLE ARENA */}
            <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 overflow-hidden px-4`}>
                {factions.map((faction, idx) => {
                    const isPlayer = faction.type === 'PLAYER';
                    return (
                        <div
                            key={faction.id}
                            className={`
                                flex flex-col h-full rounded-lg border-2 p-3 overflow-hidden transition-colors duration-300 relative
                                ${isPlayer ? 'bg-stone-900/60' : 'bg-red-950/20'}
                                border-${faction.color}
                            `}
                        >
                            <div className={`mb-3 font-serif flex justify-between items-center ${isPlayer ? 'text-stone-300' : 'text-red-900/70'} absolute top-2 left-4 right-4 z-0`}>
                                <h3 className="font-bold text-lg opacity-50">{faction.name}</h3>
                                {isPlayer ? <Swords size={20} className="opacity-50" /> : <Skull size={20} className="opacity-50" />}
                            </div>

                            <div className="flex-1 flex items-center justify-center mt-6">
                                <CharacterStack
                                    characters={faction.characters}
                                    activeId={activeCharacterId}
                                    selectedId={selectedCharacter?.id}
                                    onSelect={(char) => handleCardClick(char)}
                                    targetingState={targetingState}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ACTION ORDER BAR (Under Character Strips) */}
            <div className="mb-4 overflow-hidden border-y border-stone-800 py-2 bg-black/20">
                <ActionOrderBar factions={factions} activeCharacterId={activeCharacterId} />
            </div>

            {/* CONTROL PANEL */}

            {/* CONTROL PANEL & DICE AREA */}
            <div className="h-48 flex gap-4 items-stretch">
                {/* 1. STATUS / PROMPT (Left) */}
                <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="text-center text-stone-600 italic border border-stone-800 p-4 rounded bg-black/40">
                        {targetingState?.active ? (
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-amber-400 font-bold animate-pulse">Choose Target...</span>
                                <Button onClick={() => targetingState.resolve(null)} className="bg-stone-700 hover:bg-stone-600 border-stone-600 text-xs px-2 py-1 h-auto text-stone-200">Skip Skill</Button>
                            </div>
                        ) : (
                            turnPhase === 'ENEMY_WAIT' ? "Enemy is thinking..." :
                                turnPhase === 'RESOLVING' ? "Resolving Combat..." :
                                    "Awaiting Command"
                        )}
                    </div>
                </div>

                {/* 2. DICE CONTAINER (Center) */}
                <div className="flex-none w-64 flex flex-col items-center justify-center relative">
                    {(turnPhase === 'PLAYER_WAIT_ROLL' || diceValue > 0) ? (
                        <>
                            {turnPhase === 'PLAYER_WAIT_ROLL' ? (
                                <Button primary icon={Dices} onClick={handlePlayerRoll} className="h-20 w-48 text-xl shadow-xl shadow-amber-900/20 animate-bounce">
                                    ROLL
                                </Button>
                            ) : (
                                <div className="flex flex-col items-center animate-drop-bounce">
                                    <div className={`px-3 py-1 ${turnPhase === 'ENEMY_WAIT' ? 'bg-red-900 text-red-100 border-red-500' : 'bg-amber-900 text-amber-100 border-amber-500'} rounded-full text-xs mb-2 border font-bold tracking-wider shadow-lg`}>
                                        {turnPhase === 'ENEMY_WAIT' ? enemyFaction.name.toUpperCase() : playerFaction.name.toUpperCase()} TURN
                                    </div>
                                    <div className={`w-24 h-24 bg-stone-900 border-4 border-${turnPhase === 'ENEMY_WAIT' ? (enemyFaction.color || 'red-600') : (playerFaction.color || 'amber-600')} rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] overflow-hidden bg-black`}>
                                        <img
                                            src={DICE_IMAGES[diceValue] || DICE_IMAGES[1]}
                                            alt={`Dice ${diceValue}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-stone-700 text-sm">Waiting...</div>
                    )}
                </div>

                {/* 3. BATTLE LOG (Right) */}
                <div className="flex-1 bg-black/40 border border-stone-800 rounded p-2 overflow-y-auto font-mono text-xs text-stone-400" ref={logRef}>
                    {battleLog.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-stone-800/50 pb-1 last:border-0">
                            {log}
                        </div>
                    ))}
                </div>
            </div >
        </div >
    );
};
