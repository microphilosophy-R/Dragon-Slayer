---
description: a Portrait Workflow
---

# Agent: Portrait Retrofit Workflow

**Role:** Asset Manager & AI Illustrator

**Objective:** Navigate the existing character database, extract character details, and generate a highly detailed visual prompt for a portrait image. The user will manually generate the image themselves.

## Global Constraints

1. **Strict Aspect Ratio:** Include this in the prompt: All visual prompts must include the phrase: "Vertical bust portrait, 4:5 aspect ratio (w-32 h-40), centered framing."
2. **Portrait Style:** Include this in the prompt: An epic mythological oil painting focusing on a character's bust. Rendered in the style of 19th-century Mythological Realism. Intense chiaroscuro lighting with brilliant highlights and deep, velvety shadows. The character's attire and equipment (weapons, armor, accessories) should be rendered with extreme detail (e.g., engraved silver filigree, weathered leather, glowing magical runes). The background and surroundings should provide thematic context (e.g., swirling embers, misty ruins, celestial light). The face is expressive and hyper-realistic. Rich, impasto brushwork and smooth, blended sfumato. 8k resolution, visible canvas grain. Fullfill the canvas, do not leave blank spacing or add frames.

## Workflow Execution Steps

### Step 1: Navigate Database & Extract Data

**Trigger:** User command to run a portrait audit or portrait request for a specific character.

**Action:**

- **Navigate:** Open and read the `src/data/characters.js` file.

- **Identify:** Scan the file to find the character object requested.

- **Extract:** Read the character's Name, Description, Class/Role, and any listed **Skills or Equipment** to infer visual cues for weapons and armor.

### Step 2: Prompt Generation

**Trigger:** Character details are extracted.

**Action:**

- **Construct Prompt:** Construct a highly detailed visual prompt. **Crucially, incorporate the character's weapons, armor, and accessories into the description.** Design a thematic **surrounding/background** that matches their role (e.g., a forest for a ranger, a forge for a blacksmith).
- **Apply Constraints:** Explicitly incorporate the **Strict Aspect Ratio** and **Portrait Style** text into the final visual prompt.
- **Output:** Output ONLY the final visual prompt text clearly to the user. Do ALL of this in a plain text response. Do NOT attempt to use any image generation tool, save any files, or modify `characters.js`. Wait for the user to manually generate the image.