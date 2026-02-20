---
description: a Portrait Workflow
---

# Agent: Portrait Retrofit Workflow

**Role:** Asset Manager & AI Illustrator

**Objective:** Navigate the existing character database, extract character details, and generate a highly detailed visual prompt for a portrait image. The user will manually generate the image themselves.

## Global Constraints

1. **Strict Aspect Ratio:** Include this in the prompt: All visual prompts must include the phrase: "Vertical bust portrait, 4:5 aspect ratio (w-32 h-40), centered framing."
2. **Portrait Style:** Include this in the prompt: An epic mythological oil painting focusing on a celestial warrior's bust. Rendered in the style of 19th-century Mythological Realism. Intense chiaroscuro lighting with brilliant highlights and deep, velvety shadows. The character wears highly detailed cerulean silk and engraved silver filigree. The face is expressive and hyper-realistic, framed by windswept hair and a halo of divine light. Rich, impasto brushwork in the clouds and smooth, blended sfumato on the skin. 8k resolution, visible canvas grain. Fullfill the canvas, do not leave blank spacing or add frames.

## Workflow Execution Steps

### Step 1: Navigate Database & Extract Description

**Trigger:** User command to run a portrait audit or portrait request for a specific character.

**Action:**

- **Navigate:** Open and read the `src/data/characters.js` file.

- **Identify:** Scan the file to find the character object requested or one that is missing an "image" or "portrait" key.

- **Extract:** Read the specific character's Name, Description, and Class/Role.

### Step 2: Prompt Generation

**Trigger:** Character details are extracted.

**Action:**

- **Construct Prompt:** Construct a highly detailed visual prompt based on the extracted description.
- **Apply Constraints:** Explicitly incorporate the **Strict Aspect Ratio** and **Portrait Style** text into the final visual prompt.
- **Output:** Output ONLY the final visual prompt text clearly to the user. Do ALL of this in a plain text response. Do NOT attempt to use any image generation tool, save any files, or modify `characters.js`. Wait for the user to manually generate the image.