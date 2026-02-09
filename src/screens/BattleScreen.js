
import React, { useState, useEffect, useRef } from 'react';
import { Dices, Skull, Zap, Heart, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CharacterCard } from '../components/ui/CharacterCard';
import { getEnemy } from '../data/enemies';

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const BattleScreen = ({ gameState, onWin, onLose }) => {
    // Battle State
    const [turnPhase, setTurnPhase] = useState('PLAYER_ROLL_WAIT'); // PLAYER_ROLL_WAIT, RESOLVING, ENEMY_ROLL_WAIT
    const [battleRound, setBattleRound] = useState(1);
    const [battleLog, setBattleLog] = useState(["Battle Started! Player Turn."]);
    const [diceValue, setDiceValue] = useState(0);
    const [battleHeroes, setBattleHeroes] = useState([]);
    const [enemy, setEnemy] = useState(null);

    // Context for skills (history, memory, etc.)
    const [diceHistory, setDiceHistory] = useState([]);
    const [memory, setMemory] = useState({}); // Shared memory for "once per battle" limits

    const logRef = useRef(null);

    // Initialize Battle
    useEffect(() => {
        // Clone heroes for battle (to track battle-specific HP/Status without mutating global state immediately if we want retry)
        // For roguelike, usually damage triggers immediately. Let's use the object instances.
        // However, to trigger React updates, we need state.
        // We will initialize state from the passed instances.
        // We need to re-instantiate them or deep clone to avoid modifying the "roster" directly until end? 
        // Or just modify them?
        // Let's modify a copy to allow "Reset" if needed, or simple flow: Damage is permanent.
        // "Roguelike" -> Damage is permanent.
        // But for React state to work on specific battle fields (defense, temp speed), we need wrapper.
        const heroes = gameState.activeTeam.map(id => {
            const char = gameState.roster.find(c => c.id === id);
            // We assume char is a Character instance or object.
            // We add battle-specific properties here.
            return Object.assign(Object.create(Object.getPrototypeOf(char)), char, { defense: 0, tempSpeed: char.speed });
        });
        setBattleHeroes(heroes);

        // Load Enemy
        const enemyInstance = getEnemy(gameState.level);
        enemyInstance.defense = 0;
        setEnemy(enemyInstance);

        addLog(`Encountered: ${enemyInstance.name}!`);
    }, []);

    // Auto scroll log
    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [battleLog]);

    const addLog = (msg) => setBattleLog(prev => [...prev, `[Rd ${battleRound}] ${msg}`]);

    // --- CORE BATTLE LOGIC ---

    const checkWinCondition = (currentHeroes, currentEnemy) => {
        if (currentEnemy.hp <= 0) {
            setTimeout(() => onWin(), 1500);
            return true;
        }
        const aliveHeroes = currentHeroes.filter(h => h.hp > 0);
        if (aliveHeroes.length === 0 || battleRound > 30) {
            setTimeout(() => onLose(), 1500);
            return true;
        }
        return false;
    };

    const executeTurn = async (roll, isFriendlyTurn) => {
        let currentHeroes = [...battleHeroes];
        let currentEnemy = { ...enemy }; // Shallow copy to trigger renders
        // We also need to write back changes to these objects.

        // 1. Determine Order
        const participants = [
            ...currentHeroes.filter(h => h.hp > 0).map(h => ({ ...h, type: 'HERO', isFriendly: true })),
            { ...currentEnemy, type: 'ENEMY', isFriendly: false }
        ];

        // Shuffle & Sort
        for (let i = participants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [participants[i], participants[j]] = [participants[j], participants[i]];
        }
        participants.sort((a, b) => (a.tempSpeed || a.speed) - (b.tempSpeed || b.speed));

        addLog(`Dice: ${roll}. Order: ${participants.map(p => p.name).join(' > ')}`);

        // 2. Iterate Actions using SKILL CABINET
        for (let actor of participants) {
            if (checkWinCondition(currentHeroes, currentEnemy)) return;

            // Re-fetch latest actor state from local lists (HP might have changed)
            let realActor;
            if (actor.type === 'HERO') realActor = currentHeroes.find(h => h.id === actor.id);
            else realActor = currentEnemy;

            if (!realActor || realActor.hp <= 0) continue;

            await new Promise(r => setTimeout(r, 800));

            const ctx = {
                dice: roll,
                history: diceHistory,
                memory,
                allies: actor.type === 'HERO' ? currentHeroes.filter(h => h.hp > 0) : [currentEnemy], // "Allies" from actor perspective
                enemies: actor.type === 'HERO' ? [currentEnemy] : currentHeroes.filter(h => h.hp > 0),
                isFirst: participants[participants.length - 1].id === actor.id // "Fastest" acts last in sort? 
                // Wait, sort(a.speed - b.speed) -> Ascending. Smallest (1) first, Largest (speed 9) last. 
                // Usually high speed acts first?
                // Let's assume High Speed = Acts First?
                // If sort ascending, then index 0 is slowest. Index N is fastest.
                // If we iterate array, we go 0..N (Slowest -> Fastest).
                // Wait, "Act First" usually means "Earlier in the turn".
                // Let's reverse the sort for descending speed.
            };
            // Correction: Sort Descending for Speed
            // participants.sort((a, b) => (b.tempSpeed || b.speed) - (a.tempSpeed || a.speed));
            // RE-SORTING inside loop is messy. Let's fix the initial sort.
        }

        // Correct Sort: Descending Speed
        participants.sort((a, b) => (b.tempSpeed || b.speed) - (a.tempSpeed || a.speed));

        for (let actor of participants) {
            if (checkWinCondition(currentHeroes, currentEnemy)) return;

            let realActor = actor.type === 'HERO' ? currentHeroes.find(h => h.id === actor.id) : currentEnemy;
            if (!realActor || realActor.hp <= 0) continue;

            await new Promise(r => setTimeout(r, 800));

            // Context
            const allies = actor.type === 'HERO' ? currentHeroes.filter(h => h.hp > 0) : [currentEnemy];
            const enemies = actor.type === 'HERO' ? [currentEnemy] : currentHeroes.filter(h => h.hp > 0);

            const ctx = {
                dice: roll,
                history: diceHistory,
                memory,
                allies,
                enemies,
                isFirst: participants[0].id === actor.id
            };

            // ACTION DELEGATION
            let result = { log: null, actions: [] };

            // RULE: 
            // If Friendly Turn: Heroes do OFFENSIVE, Enemies do DEFENSIVE
            // If Enemy Turn: Enemies do OFFENSIVE, Heroes do DEFENSIVE

            const isActorTurnOwner = (isFriendlyTurn && actor.type === 'HERO') || (!isFriendlyTurn && actor.type === 'ENEMY');

            if (isActorTurnOwner) {
                // ACTOR OFFENSIVE
                // Targets: Enemies
                result = realActor.performOffensive(enemies, ctx);
            } else {
                // ACTOR DEFENSIVE (Reaction)
                // Targets: The ACTIVE turn owner? Or the enemies?
                // "Defensive skill triggers on opponent turn".
                // Defensive might just be self-buff or reaction.
                // Pass 'Enemies' (the current active side) as potential targets?
                // e.g. Archer traps the acting enemy.
                // So targets = The side that is currently active (Original Enemies context)
                result = realActor.performDefensive(enemies, ctx);
            }

            if (result && result.log) {
                addLog(result.log);
            }

            // Apply Actions
            if (result && result.actions) {
                result.actions.forEach(action => {
                    if (action.type === 'DAMAGE') {
                        applyDamage(action.targetId, action.amount, currentHeroes, currentEnemy);
                    } else if (action.type === 'HEAL') {
                        applyHeal(action.targetId, action.amount, currentHeroes, currentEnemy);
                    } else if (action.type === 'BUFF') {
                        applyBuff(action.targetId, action.stat, action.amount, currentHeroes, currentEnemy);
                    } else if (action.type === 'MODIFY_STAT') { // Perm or Temp stat change
                        applyBuff(action.targetId, action.stat, action.amount, currentHeroes, currentEnemy);
                    } else if (action.type === 'MEMORY') {
                        setMemory(prev => ({ ...prev, [action.key]: action.value }));
                    }
                });
            }

            // Sync State
            setBattleHeroes([...currentHeroes]);
            setEnemy({ ...currentEnemy });
        }

        // End Turn
        if (checkWinCondition(currentHeroes, currentEnemy)) return;

        if (isFriendlyTurn) {
            setTurnPhase('ENEMY_ROLL_WAIT');
            addLog(`--- Enemy Turn Pending ---`);
        } else {
            setBattleRound(r => r + 1);
            setTurnPhase('PLAYER_ROLL_WAIT');
            addLog(`=== Round ${battleRound + 1} Start ===`);
        }
    };

    const applyDamage = (targetId, amount, heroes, enemyObj) => {
        // Find target
        let target = null;
        if (enemyObj.id === targetId) target = enemyObj;
        else target = heroes.find(h => h.id === targetId);

        if (!target) return;

        let actualDmg = amount;
        if (target.defense > 0) {
            if (amount <= target.defense) actualDmg = 0;
            else actualDmg = Math.max(0, amount - target.defense);
            target.defense = 0; // Reset defense after being hit
        }

        target.hp -= actualDmg;
    };

    const applyHeal = (targetId, amount, heroes, enemyObj) => {
        let target = enemyObj.id === targetId ? enemyObj : heroes.find(h => h.id === targetId);
        if (target) {
            target.hp = Math.min(target.hp + amount, target.maxHp);
        }
    };

    const applyBuff = (targetId, stat, amount, heroes, enemyObj) => {
        let target = enemyObj.id === targetId ? enemyObj : heroes.find(h => h.id === targetId);
        if (target) {
            if (stat === 'defense') target.defense = (target.defense || 0) + amount;
            if (stat === 'speed') target.tempSpeed = (target.tempSpeed || target.speed) + amount;
            // Note: Permanent speed change vs temp? Original code implies perm changes mostly.
            // We'll stick to tempSpeed for battle.
        }
    };


    const handlePlayerRoll = () => {
        const roll = rollDice();
        setDiceValue(roll);
        setDiceHistory(prev => [...prev, roll]);
        setTurnPhase('RESOLVING');
        executeTurn(roll, true);
    };

    const handleEnemyRoll = () => {
        const roll = rollDice();
        setDiceValue(roll);
        setTurnPhase('RESOLVING');
        setTimeout(() => executeTurn(roll, false), 1000);
    };

    if (!enemy) return <div>Loading Battle...</div>;

    return (
        <div className="flex flex-col h-screen bg-stone-950 p-2 md:p-6 animate-fade-in-up">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4 text-amber-100">
                <h2 className="text-xl font-serif">Round {battleRound} / 30</h2>
                <div className="flex items-center gap-2">
                    <Dices size={20} /> Result: <span className="text-2xl font-bold text-amber-500">{diceValue}</span>
                </div>
            </div>

            {/* BATTLEFIELD */}
            <div className="flex-1 flex flex-col md:flex-row gap-4 mb-4">
                {/* HEROES */}
                <div className="flex-1 grid grid-cols-2 gap-2 content-center">
                    {battleHeroes.map(h => (
                        <CharacterCard key={h.id} char={h} compact defense={h.defense} />
                    ))}
                </div>

                <div className="flex items-center justify-center text-stone-600 font-serif text-2xl">VS</div>

                {/* ENEMY */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full max-w-sm border-4 border-red-900/50 bg-stone-900 p-6 flex flex-col items-center gap-4">
                        <Skull size={64} className="text-red-800" />
                        <div className="text-center">
                            <h3 className="text-2xl font-serif text-red-200">{enemy.name}</h3>
                            <div className="flex justify-center gap-4 mt-2 text-stone-400">
                                <span className="flex items-center gap-1"><Heart size={16} /> {enemy.hp}/{enemy.maxHp}</span>
                                <span className="flex items-center gap-1"><Zap size={16} /> {enemy.speed}</span>
                                {enemy.defense > 0 && <span className="flex items-center gap-1 text-blue-400"><Shield size={16} /> +{enemy.defense}</span>}
                            </div>
                        </div>
                        <div className="text-xs text-stone-500 mt-2">
                            <div>Off: {enemy.offensiveDesc}</div>
                            <div>Def: {enemy.defensiveDesc}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="h-48 flex gap-4">
                <div className="w-1/3 flex flex-col gap-2 justify-center">
                    {turnPhase === 'PLAYER_ROLL_WAIT' && (
                        <Button primary icon={Dices} onClick={handlePlayerRoll}>Roll for Heroes</Button>
                    )}
                    {turnPhase === 'ENEMY_ROLL_WAIT' && (
                        <Button icon={Skull} onClick={handleEnemyRoll} className="border-red-800 hover:bg-red-900/20">Enemy Turn</Button>
                    )}
                    {turnPhase === 'RESOLVING' && (
                        <div className="text-center text-stone-500 animate-pulse">Resolving Actions...</div>
                    )}
                </div>

                <div className="w-2/3 bg-black/40 border border-stone-800 p-2 overflow-y-auto font-mono text-sm text-stone-300" ref={logRef}>
                    {battleLog.map((l, i) => (
                        <div key={i} className="mb-1">{l}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};
