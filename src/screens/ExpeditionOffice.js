
import React from 'react';
import { Tent, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

import { CharacterCard } from '../components/ui/CharacterCard';
import { CharacterStack } from '../components/ui/CharacterStack';

export const ExpeditionOffice = ({ gameState, setGameState, onEmbark, onBack }) => {
    const [currentLayer, setCurrentLayer] = React.useState(0);
    const LAYER_SIZE = 4;

    // Group roster into layers
    const layers = [];
    for (let i = 0; i < gameState.roster.length; i += LAYER_SIZE) {
        layers.push(gameState.roster.slice(i, i + LAYER_SIZE));
    }

    const toggleSelection = (charId) => {
        const currentSelected = gameState.activeTeam;
        const isSelected = currentSelected.includes(charId);
        if (isSelected) setGameState(prev => ({ ...prev, activeTeam: currentSelected.filter(id => id !== charId) }));
        else if (currentSelected.length < 4) setGameState(prev => ({ ...prev, activeTeam: [...currentSelected, charId] }));
    };

    const currentCharacters = layers[currentLayer] || [];

    return (
        <div className="flex-1 p-0 flex flex-col h-full overflow-hidden animate-fade-in-up bg-stone-950">
            {/* Header */}
            <div className="flex justify-between items-center bg-stone-900 shadow-xl p-4 border-b-2 border-amber-900/30 z-50">
                <div>
                    <h2 className="text-2xl font-serif text-amber-100 flex items-center gap-2"><Tent className="text-amber-600" /> Expedition Office</h2>
                    <p className="text-stone-500 text-sm italic font-serif">Select your strike team ({gameState.activeTeam.length}/4 members)</p>
                </div>
                <div className="flex gap-4">
                    <Button onClick={onBack} className="w-auto px-4 py-2 text-sm border-stone-700 text-stone-400 hover:text-stone-200">Back to Camp</Button>
                    <Button onClick={onEmbark} disabled={gameState.activeTeam.length === 0} primary className="w-auto px-8 py-2 text-sm shadow-[0_0_15px_rgba(180,83,9,0.4)]">Embark <ArrowRight size={16} /></Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Side Navigation (Pagemarks) */}
                <div className="w-16 bg-stone-950 border-r border-amber-900/20 flex flex-col gap-2 p-2 z-40 shadow-2xl relative">
                    {/* Shadow overlay to blend with content */}
                    <div className="absolute inset-y-0 right-0 w-px bg-amber-500/10" />

                    <div className="text-[10px] text-amber-900 font-bold text-center mb-2 uppercase tracking-widest opacity-50">Layers</div>
                    {layers.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentLayer(idx)}
                            className={`
                                w-full py-4 rounded-sm transition-all duration-300 flex flex-col items-center justify-center relative
                                ${currentLayer === idx
                                    ? 'bg-amber-950/30 text-amber-200 shadow-inner'
                                    : 'text-stone-700 hover:bg-stone-900/50 hover:text-stone-500'}
                            `}
                        >
                            <span className="text-lg font-serif">{idx + 1}</span>
                            {currentLayer === idx && (
                                <div className="absolute right-0 top-2 bottom-2 w-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 relative overflow-y-auto flex flex-col items-center pt-24 pb-24 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-900/40 via-transparent to-transparent">
                    {/* Background Decoration */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d97706 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    {currentCharacters.length > 0 ? (
                        <CharacterStack
                            characters={currentCharacters}
                            selectedId={gameState.activeTeam}
                            onSelect={(char) => char && toggleSelection(char.id)}
                            activeId={null}
                        />
                    ) : (
                        <div className="text-stone-600 italic font-serif scale-110">No heroes in this sector...</div>
                    )}

                    {/* Team Summary Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-3 h-3 rounded-full border ${i < gameState.activeTeam.length ? 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-stone-800 border-stone-700'}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
