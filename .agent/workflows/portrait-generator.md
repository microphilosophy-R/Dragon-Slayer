---
description: a Portrait Workflow
---

# Agent: Portrait Retrofit Workflow

**Role:** Asset Manager & AI Illustrator

**Objective:** Navigate the existing character database, generate missing portraits at a **4:5 aspect ratio (w-32 h-40)**, save the files, and attach the image paths to the corresponding characters in the codebase.

## Global Constraints

1. **The Single-Call Rule:** You are strictly forbidden from calling the Gemini nano banana tool more than once per character.
2. **Strict Aspect Ratio:**Include these in the prompt: All visual prompts must include the phrase: "Vertical bust portrait, 4:5 aspect ratio (w-32 h-40), centered framing."
3. **Portrait Style:** Include these in the prompt: An epic mythological oil painting focusing on a celestial warrior's bust. Rendered in the style of 19th-century Mythological Realism. Intense chiaroscuro lighting with brilliant highlights and deep, velvety shadows. The character wears highly detailed cerulean silk and engraved silver filigree. The face is expressive and hyper-realistic, framed by windswept hair and a halo of divine light. Rich, impasto brushwork in the clouds and smooth, blended sfumato on the skin. 8k resolution, visible canvas grain. Fullfill the canvas, do not leave blank spacing or add frames.

## Workflow Execution Steps

### Step 1: Navigate Database & Extract Description

**Trigger:** User command to run a portrait audit.

**Action:**

- **Navigate:** Open and read the src/data/characters.js file.

- **Identify:** Scan the file to find a character object that is missing an "image" or "portrait" key, or currently uses a default placeholder.

- **Extract:** Read the specific character's Name, Description, and Class/Role.

- **Targeting:** Temporarily store this character's ID or Name so the agent knows exactly which object to attach the portrait to later.

- **Output:** Construct a highly detailed visual prompt based on the extracted description, explicitly requesting a **4:5 aspect ratio**.

### Step 2: Portrait Generation (Atomic Execution)

**Trigger:** Visual prompt is constructed.

**Action:**

- **Action Call:** Send the visual prompt to the image generation tool. Do this **EXACTLY ONCE**.

- **Instruction:** "Generate a high-quality character portrait image based on the following: [Insert Visual Prompt]. Style: An epic mythological oil painting focusing on a celestial warrior's bust. Rendered in the style of 19th-century Mythological Realism. Intense chiaroscuro lighting with brilliant highlights and deep, velvety shadows. The character wears highly detailed cerulean silk and engraved silver filigree. The face is expressive and hyper-realistic, framed by windswept hair and a halo of divine light. Rich, impasto brushwork in the clouds and smooth, blended sfumato on the skin. 8k resolution, visible canvas grain. Fullfill the canvas, do not leave blank spacing or add frames.

- **Hold on:** Upon successful generation, the agent must wait untill successfuly extract a new image in the the brain cache (C:\Users\96997\.gemini\antigravity\brain\).

- **Output:** Retrieve the generated image output address. Proceed immediately to Step 3 without requesting user confirmation.

### Step 3: Asset Saving & Path Generation

**Trigger:** A valid address is found.

**Action:**

- **Standardize:** Format the file name using the targeted character's name (e.g., [character_name]_portrait.png).

- **Save Action:** Save the generated image directly to the project's image directory: src/images/.

- **Pathing:** Create a path variable {{new_portrait_path}} (e.g., "../images/[character_name]_portrait.png").

- **Output:** Confirm the image is successfully written to the file system. If the image tool returns an error, Hard Stop. Do not retry.

### Step 4: Attach Portrait to Character.js

**Trigger:** Image is saved and path variable is created.

**Action:**

- **Navigate:** Return to src/data/characters.js.

- **Inject/Attach:** Locate the exact character object identified in Step 1. Update the "image" or "profile" key to equal the {{new_portrait_path}}.

- **Verify:** Ensure the JavaScript syntax remains valid (commas, brackets, and quotes) and no other data is altered.

- **Output:** Save the updated src/data/characters.js file.