/**
 * Represents a random event in the Main Hall or other locations.
 */
export class Event {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.options = data.options || []; // Array of { label, action, type, ... }
        /*
         Option structure:
         {
             label: "Button Text",
             type: "action" | "target", // Default "action"
             action: (context, target?) => { 
                 // returns { message: string, updates: object? } 
             }
         }
         */
    }
}
