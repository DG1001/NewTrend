// Statistics Node - Real-time min/max/average calculations
class StatisticsNode extends BaseNode {
    constructor() {
        super();
        this.title = "Statistik";
        this.addInput("Input", "number");
        this.addOutput("Min", "number");
        this.addOutput("Max", "number");
        this.addOutput("Avg", "number");
        this.properties = {
            windowSize: 10,
            resetOnStart: true,
            name: "Statistik 1"
        };
        this.size = [140, 90];
        this.color = "#16A085";
        this.dataBuffer = [];
        this.stats = { min: 0, max: 0, avg: 0 };
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input === undefined) return;
        
        this.dataBuffer.push(input);
        
        // Limit buffer size
        if (this.dataBuffer.length > this.properties.windowSize) {
            this.dataBuffer.shift();
        }
        
        // Calculate statistics
        if (this.dataBuffer.length > 0) {
            this.stats.min = Math.min(...this.dataBuffer);
            this.stats.max = Math.max(...this.dataBuffer);
            this.stats.avg = this.dataBuffer.reduce((sum, val) => sum + val, 0) / this.dataBuffer.length;
        }
        
        // Output statistics
        this.setOutputData(0, this.stats.min);
        this.setOutputData(1, this.stats.max);
        this.setOutputData(2, this.stats.avg);
    }
    
    onDrawForeground(ctx) {
        // Display current statistics
        const y = this.size[1] * 0.25;
        const spacing = this.size[1] * 0.2;
        
        this.drawText(ctx, `Min: ${this.stats.min.toFixed(1)}`, this.size[0] * 0.5, y, {
            font: "10px Arial",
            color: "#333"
        });
        
        this.drawText(ctx, `Max: ${this.stats.max.toFixed(1)}`, this.size[0] * 0.5, y + spacing, {
            font: "10px Arial", 
            color: "#333"
        });
        
        this.drawText(ctx, `Avg: ${this.stats.avg.toFixed(1)}`, this.size[0] * 0.5, y + spacing * 2, {
            font: "10px Arial",
            color: "#333"
        });
    }
    
    // Add reset functionality
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Reset Statistics",
                callback: () => {
                    this.dataBuffer = [];
                    this.stats = { min: 0, max: 0, avg: 0 };
                }
            }
        ];
    }
}

// Make StatisticsNode available globally
window.StatisticsNode = StatisticsNode;