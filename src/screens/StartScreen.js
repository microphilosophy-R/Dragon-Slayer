
import React from 'react';
import { Skull, Sword, Save, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const StartScreen = ({ onStartGame, onLoadGame, onLegacy }) => {
    return (
        <div className="relative h-screen w-full bg-stone-950 overflow-hidden flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0c0a09_100%)] pointer-events-none" />

            <div className="relative z-10 text-center space-y-12 max-w-2xl w-full">
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex items-center justify-center gap-4 text-amber-700 opacity-80">
                        <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-amber-700" />
                        <Skull size={24} />
                        <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-amber-700" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-700 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tighter"
                        style={{ fontFamily: '"MedievalSharp", cursive' }}>
                        AETHELGARD
                    </h1>
                    <p className="text-stone-400 font-serif tracking-[0.2em] uppercase text-sm md:text-base">
                        Chronicles of the Fallen Realm
                    </p>
                </div>
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Button onClick={onStartGame} primary icon={Sword}>NEW EXPEDITION</Button>
                    <Button onClick={onLoadGame} disabled icon={Save}>RESUME CHRONICLE</Button>
                    <Button onClick={onLegacy} disabled icon={Crown}>ANCESTRAL LEGACY</Button>
                </div>
                <div className="pt-12 text-stone-600 text-xs font-serif italic animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <p>"The castle gates stand open, yet few return..."</p>
                    <p className="mt-2 text-stone-700">v0.2.0 • Scenario 1</p>
                </div>
            </div>
        </div>
    );
};
