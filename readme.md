# Dragon Slayer - Project Overview

Welcome to **Dragon Slayer**, a high-fidelity turn-based tactical RPG featuring deep character customization, a castle-building meta-layer, and a robust event-driven combat architecture.

## 🏰 Core Pillars

1.  **Castle Management**: Develop your stronghold, visit the Workshops, Barracks, and Main Hall to manage your army and resources.
2.  **Expedition Planning**: Organize your heroes in the **Expedition Office** using a layered roster system to prepare for the challenges ahead.
3.  **Tactical Combat**: A refined `Determine -> Target -> Execute` pipeline supports complex abilities, including Rerolls, Revives, and Speed-based mechanics.
4.  **Premium Aesthetics**: A consistent "Amber & Gold" design system with custom typography, smooth micro-animations, and hand-crafted UI elements.

## 🏛️ Key Screens

*   **Castle Map**: The central hub for navigation. Interactive buildings lead to specialized management zones.
*   **Expedition Office**: Advanced hero roster management featuring "pagemarks" (tabs) and role filters for large rosters.
*   **Main Hall**: The site for story events and level-based milestones.
*   **Battle Screen**: The tactical arena where the `EventBus` orchestrates character actions and skill interactions.
*   **Character Editor**: Tools for refining hero stats, skills, and visual portraits.

## 🛠️ Systems & Architecture

### Combat Logic
*   **Event System**: A global `EventBus` allows characters, skills, and equipment to communicate seamlessly without tight coupling.
*   **Action Sequence**: A faction-based turn system where characters act in order of **Speed**. 
*   **Skill Execution Flow**:
    1.  **Trigger**: Event signal (`ACTION_PHASE`, `Skill:TakeDamage`).
    2.  **Determinator**: Checks conditions (Dice, History, Limits).
    3.  **Targeting**: Selects recipients (Auto/Manual).
    4.  **Execution**: Applies effects (Damage, Heal, Buff).

### Management Systems
*   **Portrait Engine**: A standardized system for resolving character profile images with robust fallback mechanisms.
*   **Roster Navigation**: Layered UI for managing dozens of heroes without screen clutter.

## ✨ UI/UX Design Philosophy
*   **Theme**: Sleek dark mode with **Amber & Gold** highlights.
*   **Details**: Custom scrollbars, interactive cursors, and glassmorphism effects.
*   **Interactivity**: Significant focus on hover states and tactile feedback (e.g., zooming card stacks).

## 📅 Recent Milestone Updates
*   **Castle Expansion**: Implemented the interactive Castle Map and individual building screens (Workshops, Stables, Keep, etc.).
*   **Expedition Office V2**: Added the "Pagemark" navigation system and character role filters.
*   **Portrait Standardization**: Defined a unified path for character assets, ensuring every hero has a visual identity.
*   **Combat Refinement**: Fixed context mismatches in `Skill.ApplyDamage`, allowing passive counters and equipment to correctly attribute damage.
*   **UI Polish**: Applied the "Dragon Slayer" signature look across the Battle Log, Character Cards, and Rosters.

## 🚀 Next Steps
*   **Building Functionality**: Implement specific gameplay mechanics for each castle building (e.g., item crafting in Workshops).
*   **Progression Loop**: Connect the Castle management directly to Battle rewards and level scaling.
*   **Save/Load Infrastructure**: Implement persistent storage for hero rosters and castle state.
*   **Enemy AI**: Enhance boss patterns and enemy group synergies.

