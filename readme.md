# Dragon Slayer - Project Overview

Welcome to **Dragon Slayer**, a high-fidelity turn-based tactical RPG featuring deep character customization, a castle-building meta-layer, and a robust event-driven combat architecture.

## 🐉 Game Lore & Objectives

"Dragon Slayer" transcends typical turn-based RPGs by exploring the pursuit of power within a feudal system where vassals vie for control, ultimately culminating in a quest to "Overthrow the Lord".

*   **The "Dragon"**: Symbolizes the ruling Lord. Defeating the dragon ends the game with a special legacy reward (a family crest), signifying the player's ascension as the new "Dragon".
*   **The Enemies**: Represent rival vassals, rebels, and foreign invaders.
*   **The Endless Cycle**: The continuous, turn-based nature of the game mirrors the player's unending ambition to seize and maintain power. These themes dictate the game's story arcs and level generation.

## 🌾 Manor Economy System

The game features an abstracted manor economy where **Population** and **Land** are the lifeblood of your campaign.

*   **Land & Population**: Developed land generates income, while the population consumes resources and develops new land. Each manor has varying natural capacities.
*   **Happiness & Difficulty**: If the population is upset or starving, the ensuing level becomes significantly more difficult. A contented populace eases your path.
*   **The Keep**: The administrative heart. Handles taxation, mitigation, and overall manor management. Players may acquire additional manors as they progress.
*   **Barracks**: Recruits ordinary soldiers. These characters are inexpensive, easy to replace, and are often treated as expendable troops carrying basic equipment.
*   **Temple**: Recruits magic and epic heroes. They are extremely expensive. Elite characters may only join through specific economic events or by defeating formidable foes.
*   **Workshop**: Hires workers to craft weapons using your income. Worker availability is directly tied to population happiness; dissatisfied workers will abandon their posts.
*   **Stables (Logistics)**: Simulates the vital supply chain. You must invest in front-line logistics, where consumption scales with your army size and increases each level. Supplies take one full level to arrive and are vulnerable to random interception events. Insufficient supply causes severe HP debuffs or even death.
*   **Main Hall**: The site for story events, economic milestones, and the arrival of special characters.

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
*   **Game Lore & Economy Overview**: Added comprehensive documentation on the Manor Economy System and the "Overthrow the Lord" meta-narrative.
*   **Castle Expansion**: Implemented the interactive Castle Map and individual building screens (Workshops, Stables, Keep, etc.).
*   **Combat Refinement**: Fixed context mismatches in `Skill.ApplyDamage`, allowing passive counters and equipment to correctly attribute damage.

## 🚀 Next Steps
*   **Economy System Implementation**: Build the core logics for Population, Land Capacity, and Happiness index.
*   **Logistics Check**: Introduce Stables functionality where supply lines are calculated per level.
*   **Building Functionality**: Implement specific gameplay mechanics for each castle building (e.g., item crafting in Workshops).
*   **Progression Loop**: Connect the Castle management directly to Battle rewards and level scaling.
