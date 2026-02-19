
import React, { useState } from 'react';
import { Castle, Tent, Sparkles } from 'lucide-react';
import { MainHall } from './MainHall';
import { ExpeditionOffice } from './ExpeditionOffice';

export const CastleScreen = ({ gameState, setGameState, onEmbark }) => {
    const [view, setView] = useState('hub');

    const hasEvent = gameState.lastEventLevel !== gameState.level;

    if (view === 'hall') return <MainHall gameState={gameState} setGameState={setGameState} onBack={() => setView('hub')} />;
    if (view === 'office') return <ExpeditionOffice gameState={gameState} setGameState={setGameState} onEmbark={onEmbark} onBack={() => setView('hub')} />;

    return (
        <div className="h-screen flex flex-col items-center justify-center p-6 bg-stone-950 text-amber-100">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />
            <div className="z-10 w-full max-w-4xl space-y-8 text-center animate-fade-in-up">
                <div className="space-y-2">
                    <h1 className="text-5xl font-serif text-amber-500 tracking-tighter" style={{ fontFamily: '"MedievalSharp", cursive' }}>The Keep</h1>
                    <p className="text-stone-500">Level {gameState.level}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setView('hall')}
                        className={`group relative h-64 bg-stone-900 border-2 transition-all flex flex-col items-center justify-center gap-4 overflow-hidden 
                            ${hasEvent ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-stone-700 hover:border-amber-600'}`}
                    >
                        {hasEvent && (
                            <div className="absolute top-4 right-4 animate-pulse text-amber-400">
                                <Sparkles size={24} />
                            </div>
                        )}
                        <Castle size={64} className={`${hasEvent ? 'text-amber-500 animate-pulse' : 'text-stone-600'} group-hover:text-amber-500 transition-colors duration-500`} />
                        <h3 className="text-2xl font-serif tracking-widest relative z-10">Main Hall</h3>
                        {hasEvent && <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500/80 animate-bounce">Event Available</span>}
                    </button>
                    <button onClick={() => setView('office')} className="group relative h-64 bg-stone-900 border-2 border-stone-700 hover:border-amber-600 transition-all flex flex-col items-center justify-center gap-4 overflow-hidden">
                        <Tent size={64} className="text-stone-600 group-hover:text-amber-500 transition-colors duration-500" />
                        <h3 className="text-2xl font-serif tracking-widest relative z-10">Expedition Office</h3>
                    </button>
                </div>
            </div>
        </div>
    );
};
