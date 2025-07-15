// Counter Node - Edge-triggered counting with overflow detection
class CounterNode extends BaseNode {
    constructor() {
        super();
        this.title = "Zähler";
        this.addInput("Trigger", "boolean");
        this.addInput("Reset", "boolean");
        this.addOutput("Count", "number");
        this.addOutput("Overflow", "boolean");
        this.properties = {
            maxCount: 10,
            resetOnOverflow: true,
            name: "Zähler 1"
        };
        this.size = [150, 70];
        this.color = "#D35400";
        this.count = 0;
        this.overflow = false;
        this.lastTrigger = false;
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Reset Counter",
                callback: () => {
                    this.count = 0;
                    this.overflow = false;
                    this.lastTrigger = false;
                }
            }
        ];
    }
    
    onExecute() {
        const trigger = this.getInputData(0);
        const reset = this.getInputData(1);
        
        // Reset logic
        if (reset) {
            this.count = 0;
            this.overflow = false;
            this.lastTrigger = false;
        }
        
        // Trigger logic (edge detection)
        if (trigger && !this.lastTrigger && simulationRunning) {
            this.count++;
            
            if (this.count >= this.properties.maxCount) {
                this.overflow = true;
                if (this.properties.resetOnOverflow) {
                    this.count = 0;
                }
            }
        }
        
        this.lastTrigger = trigger;
        this.setOutputData(0, this.count);
        this.setOutputData(1, this.overflow);
    }
    
    onDrawForeground(ctx) {
        // Display current count
        this.drawText(ctx, this.count.toString(), this.size[0] * 0.5, this.size[1] * 0.5, {
            font: "16px Arial",
            color: this.overflow ? "#E74C3C" : "#333"
        });
        
        // Overflow indicator
        if (this.overflow) {
            this.drawIndicator(ctx, this.size[0] - 15, 12, 6, "#E74C3C", true);
        }
    }
}

// Make CounterNode available globally
window.CounterNode = CounterNode;