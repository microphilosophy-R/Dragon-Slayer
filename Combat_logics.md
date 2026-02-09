
# Combat Logic Documentation

This document outlines the core logic and architecture of the Combat System in Dragon Slayer.

## 1. Core Structure

The combat system is hierarchical:
`Faction -> Character -> Skill`

-   **Faction**: A group of characters (e.g., "Player Party", "Enemy Encounter"). Controlled by either a human or AI.
-   **Character**: An individual unit with stats (HP, Speed, Defense) and a set of Skills.
-   **Skill**: A discrete ability with a 3-step execution process (Determine -> Target -> Execute).

## 2. The Battle Loop (Round)

A "Round" consists of each Faction taking a turn in sequence.
`Faction[0] Turn -> Faction[1] Turn -> ... -> End of Round`

### 2.1 Faction Turn Sequence
When a Faction takes its turn (managed by `Combat.js`), the following sequence occurs:

1.  **Identify Actors**: All living characters from **ALL** factions are identified.
2.  **Sort by Speed**: All characters are sorted by their `tempSpeed` (descending).
3.  **Execute Actions**: The system iterates through the sorted list of characters.
    -   *Note*: Every character gets a chance to "Act" during every Faction's turn, but their behavior changes based on *whose* turn it is.

## 3. Character Logic (Offensive vs Defensive)

Characters behave differently depending on the **Active Faction** (the faction currently taking its turn).

-   **If Active Faction == Character's Faction**:
    -   The character is in **OFFENSIVE Mode**.
    -   They will attempt to use **Offensive Skills** (e.g., Attacks, Buffs).
-   **If Active Faction != Character's Faction**:
    -   The character is in **DEFENSIVE Mode** (Reaction).
    -   They will attempt to use **Defensive Skills** (e.g., Counter-attacks, Traps, Mitigation).

This logic is handled automatically in `Character.act(context)`.

## 4. Skill Execution Process

Every Skill follows a strict 3-step process:

1.  **Determination (`evaluate`)**
    -   Checks if the skill is valid for the current Mode (Offensive/Defensive).
    -   Checks resource conditions (e.g., Dice Roll requirements, cooldowns).
2.  **Targeting**
    -   Identifies valid targets based on the skill's logic (e.g., "All Enemies", "Random Ally", "Manual Selection").
3.  **Execution (`execute`)**
    -   **Direct State Mutation**: The skill directly modifies the target's state.
    -   *Example*: `target.takeDamage(5)` or `user.heal(10)`.
    -   Returns a log message describing the outcome.

## 5. State Management

To ensure data integrity during the async flow of battle:
-   **Cloning**: The `Combat` system clones the entire state of factions and characters at the start of a turn sequence.
-   **Mutation**: Actions mutate these clones directly.
-   **Persistence**: The mutated state is returned to the UI (React) to update the view.

## 6. Directory Structure

-   `src/systems/Combat.js`: Orchestrates the Turn and Round logic.
-   `src/systems/ActionSequence.js`: Handles the sorting and iteration of actors.
-   `src/models/Character.js`: specific logic for state mutation (`takeDamage`) and action delegation.
-   `src/models/Skill.js`: The abstract definition of the 3-step process.
-   `src/data/skills.js`: The concrete implementation of specific skills.
