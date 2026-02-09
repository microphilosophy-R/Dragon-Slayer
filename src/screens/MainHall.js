
import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CharacterCard } from '../components/ui/CharacterCard';
import { SKILL_CABINET } from '../data/skills';

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const MainHall = ({ gameState, setGameState, onBack }) => {
    const [event, setEvent] = useState(null);
    const [message, setMessage] = useState(null);
    const [step, setStep] = useState('intro');
    const [fortuneChoice, setFortuneChoice] = useState(null);

    useEffect(() => {
        if (!event && step === 'intro') {
            const roll = rollDice(3);
            if (roll === 1) setEvent('blessings');
            else if (roll === 2) setEvent('fortune');
            else setEvent('faith');
        }
    }, []);

    const updateRoster = (newRoster) => {
        setGameState(prev => ({ ...prev, roster: newRoster }));
    };

    const handleBlessings = (option) => {
        // Cloning characters to modify them.
        // NOTE: In a real app we might need deep clone or Immer if objects are complex.
        // Here we assume roster is array of plain objects or we use methods if they are class instances.
        // Since we hydrated them as classes, we should be careful. 
        // State is storing "Serializables" or "Classes"?
        // The App.js will initialize them as classes.
        // For safety, let's assume we are mutating the array of objects (which is React-safe if we create new array).

        // We need to support the Character class methods or just prop updates.
        // Since our Character class just reads props, direct mutation of properties + new array reference works 
        // IF we are careful. Better to treat them as mutable for this prototype or add setter methods.

        // Quick fix: Map to new array, mutate the target.
        const roster = gameState.roster.map(c => Object.assign(Object.create(Object.getPrototypeOf(c)), c));

        if (option === 'A') {
            const indices = [];
            while (indices.length < 2 && indices.length < roster.length) {
                const r = Math.floor(Math.random() * roster.length);
                if (!indices.includes(r)) indices.push(r);
            }
            indices.forEach(idx => {
                roster[idx].hp = Math.min(roster[idx].hp + 1, 99);
                roster[idx].maxHp = Math.min(roster[idx].maxHp + 1, 99);
            });
            setMessage(`The gods smile. ${indices.map(i => roster[i].name).join(' and ')} gained +1 Health.`);
        } else if (option === 'B') {
            const idx = Math.floor(Math.random() * roster.length);
            roster[idx].speed = Math.min(roster[idx].speed + 1, 9);
            setMessage(`${roster[idx].name} feels lighter. Gained +1 Speed.`);
        } else if (option === 'C') {
            const idx = Math.floor(Math.random() * roster.length);
            roster[idx].hp = Math.min(roster[idx].hp + 3, 99);
            roster[idx].maxHp = Math.min(roster[idx].maxHp + 3, 99);
            roster[idx].speed = Math.max(roster[idx].speed - 1, 1);
            setMessage(`${roster[idx].name} is imbued with heavy power. +3 HP, -1 Speed.`);
        }
        updateRoster(roster);
        setStep('result');
    };

    const handleFaith = (option) => {
        if (option === 'A') {
            const roll = rollDice(6);
            const roster = gameState.roster.map(c => Object.assign(Object.create(Object.getPrototypeOf(c)), c));

            if (roll >= 4) {
                roster.forEach(c => {
                    c.hp = Math.min(c.hp + 1, 99);
                    c.maxHp = Math.min(c.maxHp + 1, 99);
                });
                setMessage(`Faith rewarded! Dice: ${roll}. All heroes gained +1 Health.`);
            } else {
                const idx = Math.floor(Math.random() * roster.length);
                roster[idx].speed = Math.max(roster[idx].speed - 2, 1);
                setMessage(`Faith tested. Dice: ${roll}. ${roster[idx].name} lost 2 Speed.`);
            }
            updateRoster(roster);
        } else {
            setMessage("You chose not to tempt fate. Nothing happens.");
        }
        setStep('result');
    };

    const handleFortuneStart = (choice) => {
        setFortuneChoice(choice);
        setStep('target_selection');
    };

    const handleFortuneExecute = (targetId) => {
        const roster = gameState.roster.map(c => Object.assign(Object.create(Object.getPrototypeOf(c)), c));
        const targetIdx = roster.findIndex(c => c.id === targetId);
        const others = roster.filter(c => c.id !== targetId);
        const sourceChar = others[Math.floor(Math.random() * others.length)];

        // SWAP DEFENSIVE SKILL (Legacy: Passive)
        if (fortuneChoice === 'A') {
            // Transfer Defensive Skill
            roster[targetIdx].defensiveSkillId = sourceChar.defensiveSkillId;
            // Update description for UI
            roster[targetIdx].defensiveDesc = SKILL_CABINET[sourceChar.defensiveSkillId]?.description;

            setMessage(`${roster[targetIdx].name} lost their old ways and learned ${sourceChar.name}'s defensive skill.`);
        } else if (fortuneChoice === 'B') {
            roster[targetIdx].defensiveSkillId = sourceChar.defensiveSkillId;
            roster[targetIdx].defensiveDesc = SKILL_CABINET[sourceChar.defensiveSkillId]?.description;

            const victimIdx = roster.findIndex(c => c.id === sourceChar.id);
            roster[victimIdx].defensiveSkillId = null; // Lost
            roster[victimIdx].defensiveDesc = "None (Lost to Fortune)";

            setMessage(`${roster[targetIdx].name} learned from ${sourceChar.name}. But ${sourceChar.name} forgot their skill in the chaos.`);
        }
        updateRoster(roster);
        setStep('result');
    };

    return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center animate-fade-in-up">
            <div className="bg-stone-900 border-2 border-stone-700 p-8 max-w-2xl w-full text-center space-y-6 shadow-2xl">
                <div className="flex justify-center text-amber-600 mb-4"><Dices size={48} /></div>
                {step === 'intro' && (
                    <>
                        <h2 className="text-3xl font-serif text-amber-100">
                            {event === 'blessings' && "Divine Blessings"}
                            {event === 'fortune' && "Wheel of Fortune"}
                            {event === 'faith' && "Fever of Faith"}
                        </h2>
                        <p className="text-stone-400 italic">
                            {event === 'blessings' && "A warm light bathes the hall. The gods offer their aid."}
                            {event === 'fortune' && "A mysterious traveler offers to rewrite destiny."}
                            {event === 'faith' && "A frantic zealot demands a test of faith."}
                        </p>
                        <Button onClick={() => setStep('choice')}>Approach</Button>
                    </>
                )}
                {step === 'choice' && event === 'blessings' && (
                    <div className="space-y-4">
                        <h3 className="text-xl text-stone-200">Choose a Blessing</h3>
                        <Button onClick={() => handleBlessings('A')}>2 Random Heroes +1 HP</Button>
                        <Button onClick={() => handleBlessings('B')}>1 Random Hero +1 Speed</Button>
                        <Button onClick={() => handleBlessings('C')}>1 Random Hero +3 HP, -1 Speed</Button>
                    </div>
                )}
                {step === 'choice' && event === 'faith' && (
                    <div className="space-y-4">
                        <h3 className="text-xl text-stone-200">Test Your Faith?</h3>
                        <p className="text-sm text-stone-500">Roll 4+ for Mass Healing, otherwise someone slows down.</p>
                        <Button onClick={() => handleFaith('A')}>Roll the Dice</Button>
                        <Button onClick={() => handleFaith('B')}>Walk Away</Button>
                    </div>
                )}
                {step === 'choice' && event === 'fortune' && (
                    <div className="space-y-4">
                        <h3 className="text-xl text-stone-200">Alter Fate</h3>
                        <Button onClick={() => handleFortuneStart('A')}>Change One Hero's Defensive Skill</Button>
                        <Button onClick={() => handleFortuneStart('B')}>Steal Knowledge at a Cost</Button>
                    </div>
                )}
                {step === 'target_selection' && (
                    <div className="space-y-4">
                        <h3 className="text-xl text-stone-200">Select Target Hero</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                            {gameState.roster.map(char => (
                                <CharacterCard key={char.id} char={char} onClick={() => handleFortuneExecute(char.id)} />
                            ))}
                        </div>
                    </div>
                )}
                {step === 'result' && (
                    <div className="space-y-6">
                        <h3 className="text-xl text-amber-100">Result</h3>
                        <p className="text-stone-300">{message}</p>
                        <Button onClick={onBack} primary>Return to Castle</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
