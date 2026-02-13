# Dragon Slayer - Project Overview

Welcome to **Dragon Slayer**, a turn-based tactical RPG featuring meaningful skill interactions and a robust event-driven architecture.

## Current State: Event & Skill Systems
We have successfully implemented the core systems that drive gameplay:
1.  **Event System**: A global `EventBus` now allows characters, skills, and equipment to communicate seamlessly without tight coupling.
2.  **Skill System**: A refined `Determine -> Target -> Execute` pipeline supports complex abilities, including Rerolls, Revives, and Speed-based mechanics.
3.  **Battle Workflow**: A faction-based turn system orchestrated by `ActionSequence` and `Combat`.

## Term Dictionary

### Game Time Units
*   **Round**: A complete cycle where **every** Faction has finished one **Turn**.
*   **Turn**: A phase assigned to a specific **Faction**. Crucially, **ALL** characters (Friend and Foe) act during a Turn.
    *   **Active Faction Members**: Execute **Offensive** actions.
    *   **Opposing Faction Members**: Execute **Defensive** actions.
*   **Action Sequence**: The sorted order (by Speed) in which all characters act within a single Turn.

### Entities
*   **Faction**: A group of characters allied together (e.g., 'PLAYER', 'ENEMY'). Factions share a Turn and victory conditions.
*   **Character**: The primary actor. Has Stats (`HP`, `Speed`, `Defense`), holds **Skills**, and can equip Items.
*   **Skill**: A discrete ability (Offensive, Defensive, or Both). Follows a strict 3-step execution flow:
    1.  **Determine**: Check if valid (Dice roll, History).
    2.  **Target**: Select recipients (Auto/Manual).
    3.  **Execute**: Apply effects (Damage, Heal, Buff).
*   **Equipment**: Items attached to a Character. They passively modify stats or actively listen to **Events** to intervene in combat (e.g., "Add +1 Damage on Hit").

### Mechanics
*   **Event**: A signal broadcast by the `EventBus` (e.g., `Skill:CausingDamage`, `Character:Die`). Listeners (like Equipment) can react to or modify these signals.
*   **Context**: A snapshot of the battle state (`Dice Value`, `Active Faction`, `History`) passed to every Skill and Event to ensure consistent logic resolution.

## Architecture Highlights
*   **Models**: Located in `src/models/`, these classes (`Character`, `Skill`, `Equipment`) encapsulate data and behavior.
*   **Systems**: Located in `src/systems/`, these managers (`Combat`, `EventBus`, `ActionSequence`) handle the game flow and rules.
*   **Data**: Static definitions (`skills.js`, `equipment.js`) drive the content, allowing for easy balancing and expansion.

## Next Steps
*   **Enemy AI**: Refine the decision-making for non-player factions.
*   **Level Progression**: Implement multiple battle types (Normal/Elite/Boss) strung together in a roguelike run.
*   **UI Polish**: Enhance visual feedback for complex events like "Reroll" or "Revive".
