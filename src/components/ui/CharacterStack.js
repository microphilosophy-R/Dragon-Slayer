import React, { useState, useRef } from 'react';
import { CharacterCard } from './CharacterCard';

export const CharacterStack = ({ characters, selectedId, onSelect, activeId, targetingState }) => {
    const [hoveredId, setHoveredId] = useState(null);
    const containerRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!containerRef.current || characters.length === 0) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Calculate which index the mouse is over (0 to length-1)
        // We use the full width of the container for the "scrollbar" effect
        const totalWidth = rect.width;
        const sectionWidth = totalWidth / characters.length;
        const index = Math.floor(x / sectionWidth);
        const clampedIndex = Math.max(0, Math.min(characters.length - 1, index));

        setHoveredId(characters[clampedIndex].id);
    };

    const handleMouseLeave = () => {
        setHoveredId(null);
    };

    const handleCardClick = (char) => {
        // If targeting is active, we don't want to deselect by clicking the same card
        if (targetingState?.active) {
            onSelect(char);
            return;
        }

        if (selectedId === char.id) {
            onSelect(null); // Deselect if already selected
        } else {
            onSelect(char);
        }
    };

    // Calculate approximate width to ensure container grows
    // Card Width ~16rem, Overlap ~6rem (when compact), ~5rem (when hover)
    // Formula: FirstCard + (N-1) * (CardWidth - Overlap)
    // 16rem + (N-1) * 2rem (Very compact overlap -ml-24 is -6rem)
    // Let's ensure at least enough space:
    const minContainerWidth = `${characters.length * 10}rem`;

    return (
        <div
            className="flex items-center justify-center h-full w-full px-4 overflow-x-auto" // Enable scroll on parent if estimates fail
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
        >
            <div
                className="flex flex-row items-center relative h-full isolate transition-all duration-300"
                style={{ minWidth: minContainerWidth }}
            >
                {characters.map((char, index) => {
                    const isSelected = selectedId === char.id;
                    const isHovered = hoveredId === char.id;
                    const isActive = activeId === char.id;
                    const isTargetable = targetingState?.active && targetingState.candidates.find(c => c.id === char.id);

                    // Determine z-index: Selected/Hovered on top
                    // Base z-index increases with index to stack properly
                    let zIndex = index * 10;
                    if (isHovered) zIndex += 1000; // Hovered always on top
                    if (isSelected && !hoveredId) zIndex += 100; // Selected on top if not hovering others

                    // Determine scale/transform
                    let transformClass = 'scale-95 opacity-90'; // Default slightly smaller/faded
                    let marginClass = index !== 0 ? '-ml-24' : ''; // Default heavy overlap (-ml-24 is ~6rem)

                    if (hoveredId) {
                        // Spread out slightly when interacting
                        marginClass = index !== 0 ? '-ml-20' : '';

                        if (isHovered) {
                            // Focused card pops out but DOES NOT move up (translate-y-0)
                            // This prevents blocking the name above
                            transformClass = 'scale-110 opacity-100 z-50 shadow-2xl';
                        } else {
                            // Non-focused cards fade back
                            transformClass = 'scale-90 opacity-60 blur-[1px]';
                        }
                    } else if (isSelected) {
                        // If selected but not hovering, highlight it
                        transformClass = 'scale-105 opacity-100';
                    } else if (isActive) {
                        transformClass = 'scale-105 opacity-100';
                    }

                    return (
                        <div
                            key={char.id}
                            className={`
                                relative transition-all duration-300 ease-out origin-bottom
                                ${marginClass} 
                                ${transformClass}
                            `}
                            style={{ zIndex }}
                        // No individual mouse listeners needed
                        >
                            <CharacterCard
                                char={char}
                                isSelected={isSelected}
                                isActive={isActive}
                                isTargetable={isTargetable}
                                onClick={() => handleCardClick(char)}
                                compact={false}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
