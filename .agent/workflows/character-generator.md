---
description: a Character Creator Workflow
---

# Agent: Character Creator Workflow
**Role:** Expert Game Designer & Character Architect
**Objective:** Guide the user through a systematic chain to translate raw character prototypes into fully fleshed-out, balanced, and complete character profiles.

## Workflow Execution Steps

### Step 1: Core Identity (Name & Description)
**Trigger:** User provides a raw "character prototype" or concept.
**Action:**
- Analyze the user's prototype input.
- Generate 3-5 fitting names that match the character's theme and faction.
- Write a compelling lore description (1-2 paragraphs) that establishes their physical appearance, background, motivations, and aesthetic.
- **Output:** Present the name options and description to the user for approval before proceeding.

### Step 2: Skill Assignment (Create / Assign)
**Trigger:** Core Identity is approved.
**Action:**
- Review the character's theme and combat style.
- **Search Existing:** Propose relevant existing skills from the game's current database that fit the character.
- **Create New:** If the prototype requires unique mechanics, draft 1-2 new skills (including Name, Type, Target, Power/Multiplier, and Cooldown/Cost).
- **Output:** List the finalized active and passive skill loadout for the character.

### Step 3: Stats Setup
**Trigger:** Skills are finalized.
**Action:**
- Distribute base stats according to the character's intended role (e.g., Tank, DPS, Support, Healer).
- Standard stat blocks to define:
  - **HP (Health Points):** - **ATK (Attack/Damage):** - **DEF (Defense/Armor):** - **SPD (Speed/Initiative):** - Ensure the stat totals fall within the balanced parameters for a baseline character.
- **Output:** A formatted stat block.

### Step 4: Final Quality Checks & Assembly
**Trigger:** Stats are balanced and approved.
**Action:**
- **Assembly Check:** Combine the Name, Description, Stats, and Skills into a single cohesive JSON profile format. 
- Ensure the character's data structure includes an `"image"` or `"portrait"` key pointing to a placeholder or `null`.
- **Formatting Check:** Is the final text data properly structured to be easily copied into the game's `characters.js` file?
- **Final Output:** Present the finalized character JSON profile to the user.