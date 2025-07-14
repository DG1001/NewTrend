// Sensor Node - Generates simulated sensor data
class SensorNode extends BaseNode {
    constructor() {
        super();
        this.title = "Sensor";
        this.addOutput("Wert", "number");
        this.properties = {
            type: "temperature",
            unit: "°C", 
            useCustomRange: false,
            min: 0,
            max: 100,
            name: "Sensor 1"
        };
        this.size = [140, 60];
        this.color = "#2E86C1";
        this.currentValue = 0;
    }
    
    onExecute() {
        if (!simulationRunning) return;
        
        // Generate sensor data based on type and properties
        if (window.SensorData) {
            this.currentValue = SensorData.generate(this.properties.type, this.properties);
        } else {
            // Fallback if SensorData not available
            this.currentValue = Math.random() * 100;
        }
        
        this.setOutputData(0, this.currentValue);
    }
    
    onDrawForeground(ctx) {
        // Display current value on the node
        ctx.font = "12px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        
        const displayValue = `${this.currentValue.toFixed(1)} ${this.properties.unit}`;
        ctx.fillText(displayValue, this.size[0] * 0.5, this.size[1] * 0.7);
        
        // Display sensor type
        ctx.font = "10px Arial";
        ctx.fillStyle = "#666";
        
        let typeDisplay = this.properties.type;
        if (window.SensorData) {
            typeDisplay = SensorData.getDisplayName(this.properties.type);
        }
        
        ctx.fillText(typeDisplay, this.size[0] * 0.5, this.size[1] * 0.3);
    }
    
    onPropertyChanged(property, value) {
        // Update unit when type changes
        if (property === "type" && window.SensorData) {
            this.properties.unit = SensorData.getUnit(value);
        }
    }
}

// Make SensorNode available globally
window.SensorNode = SensorNode;