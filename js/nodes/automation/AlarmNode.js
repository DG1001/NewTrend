// Alarm Node - Threshold-based alerting system
class AlarmNode extends BaseNode {
    constructor() {
        super();
        this.title = "Alarm";
        this.addInput("Wert", "number");
        this.addOutput("Alarm", "boolean");
        this.properties = {
            threshold: 50,
            condition: "greater",
            hysteresis: 2,
            name: "Alarm 1"
        };
        this.size = [120, 70];
        this.color = "#E74C3C";
        this.alarmActive = false;
        this.lastTriggerTime = 0;
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input === undefined) return;
        
        const threshold = this.properties.threshold;
        const hysteresis = this.properties.hysteresis;
        const currentTime = Date.now();
        
        // Determine alarm state based on condition
        let shouldTrigger = false;
        
        if (this.properties.condition === "greater") {
            if (!this.alarmActive && input > threshold) {
                shouldTrigger = true;
            } else if (this.alarmActive && input < (threshold - hysteresis)) {
                shouldTrigger = false;
            } else {
                shouldTrigger = this.alarmActive;
            }
        } else { // less than
            if (!this.alarmActive && input < threshold) {
                shouldTrigger = true;
            } else if (this.alarmActive && input > (threshold + hysteresis)) {
                shouldTrigger = false;
            } else {
                shouldTrigger = this.alarmActive;
            }
        }
        
        // Update alarm state
        if (shouldTrigger !== this.alarmActive) {
            this.alarmActive = shouldTrigger;
            if (shouldTrigger) {
                this.lastTriggerTime = currentTime;
            }
        }
        
        this.setOutputData(0, this.alarmActive);
    }
    
    onDrawForeground(ctx) {
        // Display threshold and condition
        this.drawText(ctx, `${this.properties.condition === "greater" ? ">" : "<"} ${this.properties.threshold}`, 
                     this.size[0] * 0.5, this.size[1] * 0.4, {
            font: "12px Arial",
            color: "#666"
        });
        
        // Display alarm state
        this.drawText(ctx, this.alarmActive ? "ALARM" : "OK", this.size[0] * 0.5, this.size[1] * 0.7, {
            font: "bold 12px Arial",
            color: this.alarmActive ? "#E74C3C" : "#27AE60"
        });
        
        // Blinking alarm indicator
        if (this.alarmActive) {
            const blinkRate = 500; // ms
            const phase = (Date.now() - this.lastTriggerTime) % (blinkRate * 2);
            const isVisible = phase < blinkRate;
            
            if (isVisible) {
                this.drawIndicator(ctx, this.size[0] - 15, 12, 8, "#E74C3C", true);
            }
        }
    }
}

// Make AlarmNode available globally
window.AlarmNode = AlarmNode;