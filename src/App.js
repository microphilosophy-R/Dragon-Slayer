
import React, { useState } from 'react';
import { StartScreen } from './screens/StartScreen';
import { CastleScreen } from './screens/CastleScreen';
import { BattleScreen } from './screens/BattleScreen';
import { getHeroes } from './data/heroes';

export default function App() {
    const [scenario, setScenario] = useState(0);
    const [gameState, setGameState] = useState(null);

    const handleNewGame = () => {
        const newGameData = {
            level: 1,
            gold: 100,
            roster: getHeroes(), // Initialize with Class Instances
            activeTeam: ['merlin', 'arthur', 'archer', 'architect'],
            castleFacilities: { mainHall: { level: 1 }, expeditionOffice: { level: 1 } }
        };
        setGameState(newGameData);
        setScenario(1);
    };

    const handleEmbark = () => {
        setScenario(2);
    };

    const handleWinBattle = () => {
        alert("Victory! Returning to Castle...");
        setGameState(prev => ({ ...prev, level: prev.level + 1 }));
        setScenario(1);
    };

    const handleLoseBattle = () => {
        alert("Defeat... The expedition is lost.");
        setScenario(0); // Reset to start
    };

    return (
        <>
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=MedievalSharp&display=swap');
          @keyframes float { 0% { transform: translateY(0); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(-40px); opacity: 0; } }
          .animate-float { animation: float linear infinite; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        `}
            </style>
            <div className="font-sans antialiased bg-stone-950 min-h-screen selection:bg-amber-900 selection:text-amber-100 text-stone-200">
                {scenario === 0 && <StartScreen onStartGame={handleNewGame} onLoadGame={() => { }} onLegacy={() => { }} />}
                {scenario === 1 && <CastleScreen gameState={gameState} setGameState={setGameState} onEmbark={handleEmbark} />}
                {scenario === 2 && <BattleScreen gameState={gameState} onWin={handleWinBattle} onLose={handleLoseBattle} />}
            </div>
        </>
    );
}
