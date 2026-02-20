---
description: A Boss Portrait Workflow
---

# Agent: Boss Portrait Retrofit Workflow

**Role:** Dark Fantasy Asset Manager & AI Illustrator

**Objective:** Navigate the existing character database, extract details for formidable Boss characters (e.g., Dragons, Demons, Behemoths), and generate a highly detailed visual prompt for a massive portrait image. 

## Global Constraints

1. **Strict Aspect Ratio:** Include this in the prompt: All visual prompts must include the phrase: "Vertical portrait, 3:4 aspect ratio (w-48 h-64), centered framing."
2. **Portrait Style:** Include this in the prompt: An epic dark fantasy oil painting focusing on a massive, terrifying boss creature. Rendered in the style of 19th-century Mythological Realism meets Dark Souls aesthetics. Intense chiaroscuro lighting with brilliant, violent highlights (e.g., hellfire, void energy, glacial frost) and deep, abyssal shadows. The creature's anatomy (scales, horns, void-flesh, spiked armor) must be rendered with extreme, terrifying detail. The background and surroundings should provide thematic context of destruction or a lair (e.g., swirling embers in a ruined keep, massive cracking glaciers, cosmic void storms). The creature's expression must project absolute malice or ancient indifference. Rich, heavy impasto brushwork for environmental effects and smooth, blended sfumato for the creature's core forms. 8k resolution, visible canvas grain. Fullfill the canvas, do not leave blank spacing or add frames.

## Workflow Execution Steps

### Step 1: Navigate Database & Extract Data

**Trigger:** User command to run a portrait audit or portrait request for a specific Boss character.

**Action:**

- **Navigate:** Open and read the `src/data/characters.js` file.
- **Identify:** Scan the file to find the Boss character object requested (e.g., Red Dragon, Frost Dragon, Demon Lord).
- **Extract:** Read the character's Name, Description, Class/Role, and any listed **Skills** to infer visual cues for elemental affinities, weapons, and sheer scale.

### Step 2: Prompt Generation

**Trigger:** Boss details are extracted.

**Action:**

- **Construct Prompt:** Construct a highly detailed visual prompt. **Crucially, incorporate the boss's elemental nature, massive scale, and specific weaponry/anatomy into the description.** Design a thematic **surrounding/lair background** that matches their role (e.g., a frozen wasteland, a burning kingdom, the abyss).
- **Apply Constraints:** Explicitly incorporate the **Strict Aspect Ratio** and **Portrait Style** text into the final visual prompt.
- **Output:** Output ONLY the final visual prompt text clearly to the user. Do ALL of this in a plain text response. Do NOT attempt to use any image generation tool, save any files, or modify `characters.js`. Wait for the user to manually generate the image.
