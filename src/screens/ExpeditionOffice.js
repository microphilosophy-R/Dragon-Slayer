
import React from 'react';
import { Tent, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

import { CharacterCard } from '../components/ui/CharacterCard';

export const ExpeditionOffice = ({ gameState, setGameState, onEmbark, onBack }) => {
    const toggleSelection = (charId) => {
        const currentSelected = gameState.activeTeam;
        const isSelected = currentSelected.includes(charId);
        if (isSelected) setGameState(prev => ({ ...prev, activeTeam: currentSelected.filter(id => id !== charId) }));
        else if (currentSelected.length < 4) setGameState(prev => ({ ...prev, activeTeam: [...currentSelected, charId] }));
    };

    return (
        <div className="flex-1 p-6 flex flex-col gap-6 animate-fade-in-up">
            <div className="flex justify-between items-center bg-stone-900/80 p-4 border-b-2 border-stone-800">
                <div>
                    <h2 className="text-2xl font-serif text-amber-100 flex items-center gap-2"><Tent className="text-amber-600" /> Expedition Office</h2>
                    <p className="text-stone-500 text-sm">Select up to 4 heroes ({gameState.activeTeam.length}/4)</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={onBack} className="w-auto px-4 py-2 text-sm">Cancel</Button>
                    <Button onClick={onEmbark} disabled={gameState.activeTeam.length === 0} primary className="w-auto px-6 py-2 text-sm">Embark <ArrowRight size={16} /></Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 overflow-y-auto pb-20 justify-items-center">
                {gameState.roster.map(char => (
                    <CharacterCard
                        key={char.id}
                        char={char}
                        isSelected={gameState.activeTeam.includes(char.id)}
                        onClick={() => toggleSelection(char.id)}
                        isTargetable={false}
                    />
                ))}
            </div>
        </div>
    );
};
