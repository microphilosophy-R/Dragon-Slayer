
import React, { useState } from 'react';
import { MainHall } from './MainHall';
import { ExpeditionOffice } from './ExpeditionOffice';
import { CastleKeep } from './castle/CastleKeep';
import { CastleTemple } from './castle/CastleTemple';
import { CastleBarracks } from './castle/CastleBarracks';
import { CastleStables } from './castle/CastleStables';
import { CastleWorkshops } from './castle/CastleWorkshops';
import { CastlePopup } from '../components/ui/CastlePopup';
import castleMap from '../images/The castle.png';

export const CastleScreen = ({ gameState, setGameState, onEmbark }) => {
    // Current main view: 'hub' or 'gate'
    const [view, setView] = useState('hub');

    // Active popup window for the hub map
    const [activePopup, setActivePopup] = useState(null);

    // Track which area is being hovered
    const [hoveredArea, setHoveredArea] = useState('');

    const hasHallEvent = gameState?.lastEventLevel !== gameState?.level;
    const isEverythingDone = !hasHallEvent;

    if (view === 'gate') return <ExpeditionOffice gameState={gameState} setGameState={setGameState} onEmbark={onEmbark} onBack={() => setView('hub')} />;

    // Original image dimensions from the map coordinates (max X ~2749, Y ~1527. exact dimension 2752x1536).
    const viewBox = "0 0 2752 1536";

    return (
        <div className="h-screen w-full bg-stone-950 flex flex-col relative overflow-hidden text-amber-100 select-none animate-fade-in-up">

            {/* Header / UI Layer */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none drop-shadow-md">
                <h1 className="text-5xl font-serif text-amber-500 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: '"MedievalSharp", cursive' }}>The Stronghold</h1>
                <p className="text-stone-300 font-serif mt-2 tracking-widest uppercase text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">Level {gameState.level}</p>
            </div>

            {/* Hover Tooltip display at the bottom center */}
            <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-300 ${hoveredArea ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-stone-900/90 border border-amber-500/50 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm">
                    <span className="font-serif tracking-widest text-lg text-amber-400 capitalize">{hoveredArea || '...'}</span>
                </div>
            </div>

            {/* Interactive Image Map Layer */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                <div className="relative max-w-full max-h-full aspect-video shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-stone-800 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                        src={castleMap}
                        alt="The Castle"
                        className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* SVG Overlay for exact polygonal clicking */}
                    <svg
                        viewBox={viewBox}
                        className="absolute inset-0 w-full h-full z-10"
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <defs>
                            <style>
                                {`
                                    .hotspot {
                                        fill: transparent;
                                        stroke: transparent;
                                        cursor: pointer;
                                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    }
                                    .hotspot:hover {
                                        stroke: rgba(245, 158, 11, 0.8);
                                        stroke-width: 8px;
                                        fill: rgba(245, 158, 11, 0.2);
                                    }
                                    .hotspot-available {
                                        stroke: rgba(245, 158, 11, 0.4);
                                        stroke-width: 4px;
                                        animation: border-glow 2.5s infinite ease-in-out;
                                    }
                                    .hotspot-gate-highlight {
                                        stroke: rgba(251, 191, 36, 0.6);
                                        stroke-width: 6px;
                                        animation: gate-glow 2s infinite ease-in-out;
                                    }
                                    @keyframes border-glow {
                                        0% { stroke-opacity: 0.3; stroke-width: 3px; }
                                        50% { stroke-opacity: 0.8; stroke-width: 6px; }
                                        100% { stroke-opacity: 0.3; stroke-width: 3px; }
                                    }
                                    @keyframes gate-glow {
                                        0% { stroke-opacity: 0.4; stroke-width: 4px; fill: rgba(251, 191, 36, 0.05); }
                                        50% { stroke-opacity: 0.9; stroke-width: 10px; fill: rgba(251, 191, 36, 0.15); }
                                        100% { stroke-opacity: 0.4; stroke-width: 4px; fill: rgba(251, 191, 36, 0.05); }
                                    }
                                    .hint-marker {
                                        fill: #fbbf24;
                                        animation: ripple 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
                                    }
                                    @keyframes ripple {
                                        0% { transform: scale(0.8); opacity: 0.8; }
                                        50% { transform: scale(1.4); opacity: 0.4; }
                                        100% { transform: scale(0.8); opacity: 0.8; }
                                    }
                                `}
                            </style>
                        </defs>

                        {/* Keep */}
                        <polygon
                            className="hotspot"
                            points="980,385 1014,431 1007,603 1298,798 1607,629 1605,399 1563,292 1483,448 1483,188 1441,82 1398,191 1324,160 1324,87 1281,26 1247,117 1243,169 1173,195 1126,65 1091,161 1095,373 1041,280"
                            onClick={() => setActivePopup('keep')}
                            onMouseEnter={() => setHoveredArea('The Keep')}
                            onMouseLeave={() => setHoveredArea('')}
                        />

                        {/* Gothic Temple */}
                        <polygon
                            className="hotspot"
                            points="706,393 637,519 646,770 837,878 922,890 1014,849 1000,543 973,409 961,521 954,591 917,538"
                            onClick={() => setActivePopup('temple')}
                            onMouseEnter={() => setHoveredArea('Gothic Temple')}
                            onMouseLeave={() => setHoveredArea('')}
                        />

                        {/* Great Hall (Availability hint added) */}
                        <g>
                            <polygon
                                className={`hotspot ${hasHallEvent ? 'hotspot-available' : ''}`}
                                points="1537,727 1571,652 1644,696 1811,613 1883,693 1905,909 1591,1068 1444,1002 1452,747 1481,805"
                                onClick={() => setActivePopup('hall')}
                                onMouseEnter={() => setHoveredArea('Great Hall')}
                                onMouseLeave={() => setHoveredArea('')}
                            />
                            {hasHallEvent && (
                                <circle cx="1670" cy="850" r="15" className="hint-marker pointer-events-none" />
                            )}
                        </g>

                        {/* Barracks */}
                        <polygon
                            className="hotspot"
                            points="1680,389 1629,423 1621,532 1799,615 1896,561 1896,503 1867,474 1821,447 1738,408"
                            onClick={() => setActivePopup('barracks')}
                            onMouseEnter={() => setHoveredArea('Barracks')}
                            onMouseLeave={() => setHoveredArea('')}
                        />

                        {/* Workshops */}
                        <polygon
                            className="hotspot"
                            points="1180,934 1359,1031 1413,1116 1328,1177 1221,1153 1223,1082 1154,1055 1110,1128 969,1091 855,1064 875,1001 789,953 832,885 881,905 949,953 990,936 1014,961 1131,902 1160,958"
                            onClick={() => setActivePopup('workshops')}
                            onMouseEnter={() => setHoveredArea('Workshops')}
                            onMouseLeave={() => setHoveredArea('')}
                        />

                        {/* Stables */}
                        <polygon
                            className="hotspot"
                            points="1959,510 1894,571 1894,666 2054,857 2193,913 2228,827 2202,644"
                            onClick={() => setActivePopup('stables')}
                            onMouseEnter={() => setHoveredArea('Stables')}
                            onMouseLeave={() => setHoveredArea('')}
                        />

                        {/* Gatehouse / The Gate (Highlighted if everything is done) */}
                        <polygon
                            className={`hotspot ${isEverythingDone ? 'hotspot-gate-highlight' : ''}`}
                            points="1799,980 1730,1021 1737,1145 1798,1167 1817,1351 1873,1383 1951,1354 1958,1295 1997,1274 2055,1295 2124,1257 2121,979 2073,892 2048,921 1980,890 1922,931 1953,955 1889,987 1862,980 1845,1009"
                            onClick={() => setView('gate')}
                            onMouseEnter={() => setHoveredArea('The Gate')}
                            onMouseLeave={() => setHoveredArea('')}
                        />

                    </svg>
                </div>
            </div>

            {/* Popups Layer (Modals) */}
            {activePopup === 'keep' && <CastleKeep onClose={() => setActivePopup(null)} gameState={gameState} setGameState={setGameState} />}
            {activePopup === 'temple' && <CastleTemple onClose={() => setActivePopup(null)} gameState={gameState} setGameState={setGameState} />}
            {activePopup === 'barracks' && <CastleBarracks onClose={() => setActivePopup(null)} gameState={gameState} setGameState={setGameState} />}
            {activePopup === 'stables' && <CastleStables onClose={() => setActivePopup(null)} gameState={gameState} setGameState={setGameState} />}
            {activePopup === 'workshops' && <CastleWorkshops onClose={() => setActivePopup(null)} gameState={gameState} setGameState={setGameState} />}
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
