import React, { useState } from 'react';
import { StartScreen } from './screens/StartScreen';
import { CastleScreen } from './screens/CastleScreen';
import { BattleScreen } from './screens/BattleScreen';
import { Player } from './systems/Player';
import mouseIcon from './images/mouse.png';

export default function App() {
    const [scenario, setScenario] = useState(0);
    const [gameState, setGameState] = useState(null);

    const handleNewGame = () => {
        const newGameData = Player.createInitialState();
        setGameState(newGameData);
        setScenario(1);
    };

    const handleEmbark = () => {
        setScenario(2);
    };

    const handleWinBattle = () => {
        alert("Victory! Returning to Castle...");
        // Use Player system to calculate new state (rewards, level up)
        setGameState(prev => Player.processVictory(prev));
        setScenario(1);
    };

    const handleLoseBattle = () => {
        alert("Defeat... The expedition is lost.");
        // Use Player system to handle defeat (e.g. cleanup or just return state)
        // For now, Player.processDefeat just returns state, but good to have the hook.
        setGameState(prev => Player.processDefeat(prev));
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

          /* Custom Cursor Logic */
          /* Apply to the container and all children to override specific element defaults */
          .cursor-medieval, .cursor-medieval * {
            cursor: url('${mouseIcon}'), auto !important;
          }

          /* Ensure the cursor persists when clicking (active state) */
          .cursor-medieval:active, .cursor-medieval *:active {
            cursor: url('${mouseIcon}'), auto !important;
          }
          
          /* Specifically target buttons to prevent the browser 'hand' cursor from overriding our custom one */
          button, [role="button"] {
             cursor: url('${mouseIcon}'), pointer !important;
          }
        `}
            </style>
            <div className="cursor-medieval font-sans antialiased bg-stone-950 min-h-screen selection:bg-amber-900 selection:text-amber-100 text-stone-200">
                {scenario === 0 && <StartScreen onStartGame={handleNewGame} onLoadGame={() => { }} onLegacy={() => { }} />}
                {scenario === 1 && <CastleScreen gameState={gameState} setGameState={setGameState} onEmbark={handleEmbark} />}
                {scenario === 2 && <BattleScreen gameState={gameState} onWin={handleWinBattle} onLose={handleLoseBattle} />}
            </div>
        </>
    );
}