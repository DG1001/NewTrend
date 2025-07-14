// Timer Node - Interval and timeout-based operations
class TimerNode extends BaseNode {
    constructor() {
        super();
        this.title = "Timer";
        this.addInput("Start", "boolean");
        this.addInput("Reset", "boolean");
        this.addOutput("Output", "boolean");
        this.addOutput("Elapsed", "number");
        this.properties = {
            mode: "interval",
            duration: 5,
            autoReset: true,
            name: "Timer 1"
        };
        this.size = [140, 80];
        this.color = "#8E44AD";
        this.startTime = null;
        this.isActive = false;
        this.output = false;
        this.elapsedTime = 0;
    }
    
    onExecute() {
        const start = this.getInputData(0);
        const reset = this.getInputData(1);
        const currentTime = Date.now();
        
        // Reset logic
        if (reset) {
            this.startTime = null;
            this.isActive = false;
            this.output = false;
            this.elapsedTime = 0;
        }
        
        // Start logic
        if (start && !this.isActive && simulationRunning) {
            this.startTime = currentTime;
            this.isActive = true;
        }
        
        // Timer logic
        if (this.isActive && this.startTime) {
            this.elapsedTime = (currentTime - this.startTime) / 1000; // Convert to seconds
            
            if (this.properties.mode === "timeout") {
                // Timeout mode: trigger once after duration
                if (this.elapsedTime >= this.properties.duration) {
                    this.output = true;
                    this.isActive = false;
                }
            } else {
                // Interval mode: toggle output based on duration
                const cycles = Math.floor(this.elapsedTime / this.properties.duration);
                this.output = (cycles % 2) === 1;
                
                if (this.properties.autoReset && cycles > 0 && (this.elapsedTime % this.properties.duration) < 0.1) {
                    // Reset for next cycle if auto-reset is enabled
                    this.startTime = currentTime;
                    this.elapsedTime = 0;
                }
            }
        }
        
        this.setOutputData(0, this.output);
        this.setOutputData(1, this.elapsedTime);
    }
    
    onDrawForeground(ctx) {
        // Display timer mode and elapsed time
        this.drawText(ctx, this.properties.mode, this.size[0] * 0.5, this.size[1] * 0.3, {
            font: "10px Arial",
            color: "#666"
        });
        
        this.drawText(ctx, `${this.elapsedTime.toFixed(1)}s`, this.size[0] * 0.5, this.size[1] * 0.5, {
            font: "12px Arial",
            color: "#333"
        });
        
        this.drawText(ctx, `/${this.properties.duration}s`, this.size[0] * 0.5, this.size[1] * 0.7, {
            font: "10px Arial",
            color: "#666"
        });
        
        // Active indicator
        if (this.isActive) {
            this.drawIndicator(ctx, this.size[0] - 15, 12, 6, "#8E44AD", true);
        }
    }
}

// Make TimerNode available globally
window.TimerNode = TimerNode;