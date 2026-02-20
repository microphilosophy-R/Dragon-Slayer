
import React, { useState } from 'react';
import { Castle, Tent, Sparkles, Coins, Cross, Swords, Package, Hammer } from 'lucide-react';
import { MainHall } from './MainHall';
import { ExpeditionOffice } from './ExpeditionOffice';
import { CastleKeep } from './castle/CastleKeep';
import { CastleTemple } from './castle/CastleTemple';
import { CastleBarracks } from './castle/CastleBarracks';
import { CastleStables } from './castle/CastleStables';
import { CastleWorkshops } from './castle/CastleWorkshops';
import { CastlePopup } from '../components/ui/CastlePopup';

export const CastleScreen = ({ gameState, setGameState, onEmbark }) => {
    // Current main view: 'hub' or 'gate'
    const [view, setView] = useState('hub');

    // Active popup window for the hub map
    const [activePopup, setActivePopup] = useState(null);

    const hasEvent = gameState.lastEventLevel !== gameState.level;

    if (view === 'gate') return <ExpeditionOffice gameState={gameState} setGameState={setGameState} onEmbark={onEmbark} onBack={() => setView('hub')} />;

    return (
        <div className="h-screen w-full bg-stone-950 flex relative overflow-hidden text-amber-100 select-none animate-fade-in-up">

            {/* Background Map Layer */}
            <div className="absolute inset-0 z-0">
                {/* Fallback pattern until image is generated */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/80" />
            </div>

            {/* Header / UI Layer */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
                <h1 className="text-5xl font-serif text-amber-500 tracking-tighter drop-shadow-lg" style={{ fontFamily: '"MedievalSharp", cursive' }}>The Stronghold</h1>
                <p className="text-stone-400 font-serif mt-2 tracking-widest uppercase text-sm">Level {gameState.level}</p>
            </div>

            {/* Interactive Hotspots Layer */}
            <div className="relative w-full max-w-6xl mx-auto h-full z-10">

                {/* 1. The Keep (Center-Top) */}
                <button
                    onClick={() => setActivePopup('keep')}
                    className="absolute top-[20%] left-[50%] -translate-x-1/2 group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300"
                >
                    <div className="p-4 bg-stone-900/80 border-2 border-stone-700 group-hover:border-amber-500 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        <Coins size={32} className="text-stone-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <span className="font-serif text-sm tracking-widest text-stone-400 group-hover:text-amber-400 bg-stone-950/80 px-2 py-1 rounded">The Keep</span>
                </button>

                {/* 2. Great Hall (Center) */}
                <button
                    onClick={() => setActivePopup('hall')}
                    className={`absolute top-[45%] left-[50%] -translate-x-1/2 group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300 ${hasEvent ? 'animate-pulse' : ''}`}
                >
                    <div className={`p-5 bg-stone-900/90 border-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.9)] relative ${hasEvent ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : 'border-stone-700 group-hover:border-amber-500'}`}>
                        {hasEvent && <Sparkles size={20} className="absolute -top-2 -right-2 text-amber-400 animate-pulse" />}
                        <Castle size={40} className={`transition-colors ${hasEvent ? 'text-amber-500' : 'text-stone-400 group-hover:text-amber-500'}`} />
                    </div>
                    <span className={`font-serif text-md tracking-widest bg-stone-950/80 px-3 py-1 rounded border border-stone-800 ${hasEvent ? 'text-amber-400' : 'text-stone-300 group-hover:text-amber-400'}`}>
                        Great Hall
                    </span>
                </button>

                {/* 3. Temple (Right-Top) */}
                <button
                    onClick={() => setActivePopup('temple')}
                    className="absolute top-[30%] left-[75%] group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300"
                >
                    <div className="p-3 bg-stone-900/80 border-2 border-stone-700 group-hover:border-blue-500 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        <Cross size={28} className="text-stone-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="font-serif text-sm tracking-widest text-stone-400 group-hover:text-blue-300 bg-stone-950/80 px-2 py-1 rounded">Temple</span>
                </button>

                {/* 4. Barracks (Left-Middle) */}
                <button
                    onClick={() => setActivePopup('barracks')}
                    className="absolute top-[55%] left-[25%] group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300"
                >
                    <div className="p-3 bg-stone-900/80 border-2 border-stone-700 group-hover:border-red-600 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        <Swords size={28} className="text-stone-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="font-serif text-sm tracking-widest text-stone-400 group-hover:text-red-400 bg-stone-950/80 px-2 py-1 rounded">Barracks</span>
                </button>

                {/* 5. Workshops (Right-Middle) */}
                <button
                    onClick={() => setActivePopup('workshops')}
                    className="absolute top-[55%] left-[70%] group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300"
                >
                    <div className="p-3 bg-stone-900/80 border-2 border-stone-700 group-hover:border-orange-500 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        <Hammer size={28} className="text-stone-400 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <span className="font-serif text-sm tracking-widest text-stone-400 group-hover:text-orange-300 bg-stone-950/80 px-2 py-1 rounded">Workshops</span>
                </button>

                {/* 6. Stables (Left-Bottomish) */}
                <button
                    onClick={() => setActivePopup('stables')}
                    className="absolute top-[75%] left-[30%] group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300"
                >
                    <div className="p-3 bg-stone-900/80 border-2 border-stone-700 group-hover:border-yellow-700 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.8)]">
                        <Package size={28} className="text-stone-400 group-hover:text-yellow-600 transition-colors" />
                    </div>
                    <span className="font-serif text-sm tracking-widest text-stone-400 group-hover:text-yellow-500 bg-stone-950/80 px-2 py-1 rounded">Stables</span>
                </button>

                {/* 7. The Gate (Center-Bottom) */}
                <button
                    onClick={() => setView('gate')}
                    className="absolute top-[80%] left-[50%] -translate-x-1/2 group flex flex-col items-center gap-2 hover:scale-110 transition-transform duration-300"
                >
                    <div className="p-6 bg-stone-900/90 border-2 border-stone-700 group-hover:border-stone-400 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.9)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-stone-800 group-hover:bg-stone-700 transition-colors opacity-50" />
                        <Tent size={48} className="text-stone-500 group-hover:text-stone-300 transition-colors relative z-10" />
                    </div>
                    <span className="font-serif text-lg tracking-widest text-stone-300 group-hover:text-white bg-stone-950/90 px-4 py-1 rounded border-b-2 border-stone-700 group-hover:border-stone-400 transition-colors">
                        The Gate
                    </span>
                </button>
            </div>

            {/* Popups Layer (Modals) */}
            {activePopup === 'keep' && <CastleKeep onClose={() => setActivePopup(null)} />}
            {activePopup === 'temple' && <CastleTemple onClose={() => setActivePopup(null)} />}
            {activePopup === 'barracks' && <CastleBarracks onClose={() => setActivePopup(null)} />}
            {activePopup === 'stables' && <CastleStables onClose={() => setActivePopup(null)} />}
            {activePopup === 'workshops' && <CastleWorkshops onClose={() => setActivePopup(null)} />}
            {activePopup === 'hall' && (
                <CastlePopup title="The Great Hall" onClose={() => setActivePopup(null)}>
                    {/* The MainHall.js naturally handles events. We just wrap it in a modal. */}
                    <div className="w-full flex justify-center pb-4">
                        <MainHall
                            gameState={gameState}
                            setGameState={setGameState}
                            onBack={() => setActivePopup(null)}
                        />
                    </div>
                </CastlePopup>
            )}

        </div>
    );
};
