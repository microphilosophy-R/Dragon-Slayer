import React, { useState, useRef } from 'react';
import { CharacterCard } from './CharacterCard';

export const CharacterStack = ({ characters, selectedId, onSelect, activeId, targetingState }) => {
    const [hoveredId, setHoveredId] = useState(null);
    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!contentRef.current || characters.length === 0) return;

        const rect = contentRef.current.getBoundingClientRect();

        // Check if mouse is within visual bounds of the stack
        if (e.clientX < rect.left || e.clientX > rect.right) {
            setHoveredId(null);
            return;
        }

        const x = e.clientX - rect.left;

        // Calculate which index the mouse is over
        // Use the actual visual width of the content div
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

        // Check if currently selected (scalar or array)
        const isCurrentlySelected = Array.isArray(selectedId)
            ? selectedId.includes(char.id)
            : selectedId === char.id;

        if (isCurrentlySelected) {
            // If handling array, the parent likely handles toggle via onSelect parameters
            // But if generic onSelect(null) is expected for scalar deselect:
            if (!Array.isArray(selectedId)) {
                onSelect(null);
            } else {
                // For array mode, we still fire onSelect(char) and let parent toggle
                onSelect(char);
            }
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
            className="flex items-center justify-center w-full px-4 overflow-x-auto no-scrollbar min-h-[36rem]" // Increased height for scale clearance
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={containerRef}
        >
            <div
                className="flex flex-row items-center relative isolate transition-all duration-300 py-10"
                style={{ minWidth: minContainerWidth }}
                ref={contentRef}
            >
                {characters.map((char, index) => {
                    const isSelected = Array.isArray(selectedId)
                        ? selectedId.includes(char.id)
                        : selectedId === char.id;
                    const isHovered = hoveredId === char.id;
                    const isActive = activeId === char.id;
                    const isTargetable = targetingState?.active && targetingState.candidates.find(c => c.id === char.id);

                    // Reverse z-index so leftmost cards are in front
                    let zIndex = (characters.length - index) * 10;
                    if (isHovered) zIndex = 1000; // Hovered always on top
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
