// src/models/Economy.js
export class Economy {
    constructor(data = {}) {
        this.population = data.population !== undefined ? data.population : 1000;
        this.working_population = data.working_population !== undefined ? data.working_population : 800;
        this.non_working_population = data.non_working_population !== undefined ? data.non_working_population : 200;

        // Assigned workers to specific buildings
        this.assigned_workshop = data.assigned_workshop || 0;
        this.assigned_barracks = data.assigned_barracks || 0;

        this.land_developed = data.land_developed !== undefined ? data.land_developed : 500;
        this.land_capacity = data.land_capacity !== undefined ? data.land_capacity : 2000;
        this.happiness = data.happiness !== undefined ? data.happiness : 80; // 0 to 100
        this.tax_rate = data.tax_rate !== undefined ? data.tax_rate : 10; // percentage 0-100
        this.gold = data.gold !== undefined ? data.gold : 500;

        // Logistics
        this.supplies_sent = data.supplies_sent || 0;
        this.current_supplies = data.current_supplies || 10; // Initial supply buffer
    }

    get working_population_at_manors() {
        return Math.max(0, this.working_population - this.assigned_workshop - this.assigned_barracks);
    }

    get projected_income() {
        // Income is limited by either working population at manors or developed land
        return Math.floor(Math.min(this.working_population_at_manors, this.land_developed) * (this.tax_rate / 100));
    }

    get projected_consumption() {
        // Consumption based on total population linearly
        const CONSUMPTION_PER_POP = 0.05; // 5 gold per 100 people? Or food? 
        // We will just reduce happiness if gold can't cover it, or maybe population drops directly
        // Let's say consumption is purely a food abstraction managed internally, affecting happiness
        // For simplicity, without a "food" resource, we'll represent consumption as a baseline drag on happiness
        // based on population size relative to land.
        return Math.floor(this.population * 0.01);
    }

    processEndOfTurn() {
        // 1. Calculate Income
        const income = this.projected_income;
        this.gold += income;

        // 2. Adjust Happiness
        // Tax penalty: High tax reduces happiness
        if (this.tax_rate > 20) {
            this.happiness -= (this.tax_rate - 20) * 0.5;
        } else if (this.tax_rate < 10) {
            this.happiness += (10 - this.tax_rate) * 0.5;
        }

        // Overpopulation penalty: Population exceeding land capacity causes starvation
        if (this.population > this.land_capacity) {
            this.happiness -= 15;
        }

        this.happiness = Math.max(0, Math.min(100, this.happiness));

        // 3. Population Dynamics based on Happiness
        let pop_change_rate = 0;
        if (this.happiness > 80) pop_change_rate = 1.05; // 5% growth
        else if (this.happiness > 50) pop_change_rate = 1.02; // 2% growth
        else if (this.happiness > 30) pop_change_rate = 0.98; // 2% decline
        else pop_change_rate = 0.90; // 10% decline (starvation/leaving)

        this.population = Math.floor(this.population * pop_change_rate);

        // Normalize split (maintain approx 80/20 split between working and non-working as population changes)
        this.working_population = Math.floor(this.population * 0.8);
        this.non_working_population = this.population - this.working_population;

        // Ensure assigned workers don't exceed current working population
        let over_assigned = (this.assigned_workshop + this.assigned_barracks) - this.working_population;
        if (over_assigned > 0) {
            // Unassign from barracks first, then workshop if necessary
            const barracks_reduction = Math.min(this.assigned_barracks, over_assigned);
            this.assigned_barracks -= barracks_reduction;
            over_assigned -= barracks_reduction;

            if (over_assigned > 0) {
                this.assigned_workshop = Math.max(0, this.assigned_workshop - over_assigned);
            }
        }

        // 4. Land Development
        if (this.happiness > 60 && this.gold > 50 && this.working_population_at_manors > this.land_developed) {
            // Naturally develop land if there's excess labor and happiness
            const new_land = Math.min(50, this.land_capacity - this.land_developed);
            this.land_developed += new_land;
            this.gold -= 50; // Cost of development
        }

        // 5. Logistics Calculation (Delay Rule)
        // Check random interception (e.g. 10% chance to lose 20% supplies)
        let interceptionMultiplier = 1;
        if (Math.random() < 0.1) {
            interceptionMultiplier = 0.8;
        }
        this.current_supplies = Math.floor(this.supplies_sent * interceptionMultiplier);
        this.supplies_sent = 0; // Reset for next planning phase

        return this;
    }

    static processVictory(economyData) {
        let e = new Economy(economyData);
        e.happiness += 10;
        return e.processEndOfTurn();
    }

    static clone(economyData) {
        return new Economy(economyData);
    }
}
