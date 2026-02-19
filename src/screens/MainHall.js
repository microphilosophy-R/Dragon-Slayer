import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CharacterCard } from '../components/ui/CharacterCard';
import { EVENTS } from '../data/events';

const rollDice = (sides = 6) => Math.floor(Math.random() * sides) + 1;

export const MainHall = ({ gameState, setGameState, onBack }) => {
    const [event, setEvent] = useState(null);
    const [message, setMessage] = useState(null);
    const [step, setStep] = useState('intro'); // intro, choice, target_selection, result
    const [selectedOption, setSelectedOption] = useState(null);

    // Initialize Event
    useEffect(() => {
        if (!event && step === 'intro') {
            const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
            setEvent(randomEvent);
        }
    }, [step, event]);

    const updateRoster = (newRoster) => {
        setGameState(prev => ({ ...prev, roster: newRoster }));
    };

    const handleOptionClick = (option) => {
        if (option.type === 'target') {
            setSelectedOption(option);
            setStep('target_selection');
        } else {
            executeAction(option);
        }
    };

    const executeAction = (option, targetId = null) => {
        // Prepare context
        const context = {
            gameState,
            roster: gameState.roster, // Pass current roster
            rollDice
        };

        // Execute
        const result = option.action(context, targetId);

        // Handle Result
        if (result.message) {
            setMessage(result.message);
        }

        if (result.roster) {
            updateRoster(result.roster);
        }

        setStep('result');
    };

    const handleTargetSelect = (targetId) => {
        if (selectedOption) {
            executeAction(selectedOption, targetId);
        }
    };

    return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center animate-fade-in-up">
            <div className="bg-stone-900 border-2 border-stone-700 p-8 max-w-2xl w-full text-center space-y-6 shadow-2xl">
                <div className="flex justify-center text-amber-600 mb-4"><Dices size={48} /></div>

                {/* INTRO & CHOICE */}
                {step === 'intro' && event && (
                    <>
                        <h2 className="text-3xl font-serif text-amber-100">{event.name}</h2>
                        <p className="text-stone-400 italic">{event.description}</p>

                        <div className="space-y-4 mt-6">
                            {event.options.map((opt, idx) => (
                                <Button key={idx} onClick={() => handleOptionClick(opt)}>
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </>
                )}

                {/* TARGET SELECTION */}
                {step === 'target_selection' && (
                    <div className="space-y-4">
                        <h3 className="text-xl text-stone-200">Select Target Hero</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left bg-stone-950 p-4 rounded-lg max-h-96 overflow-y-auto">
                            {gameState.roster.map(char => (
                                <CharacterCard
                                    key={char.id}
                                    char={char}
                                    onClick={() => handleTargetSelect(char.id)}
                                />
                            ))}
                        </div>
                        <Button onClick={() => setStep('intro')} variant="secondary">Cancel</Button>
                    </div>
                )}

                {/* RESULT */}
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
