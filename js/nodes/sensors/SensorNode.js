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
            waveform: "random", // random, sine, square, sawtooth
            frequency: 1.0, // Hz
            amplitude: 50, // peak amplitude
            offset: 50, // center value
            name: "Sensor 1"
        };
        this.size = [140, 60];
        this.color = "#2E86C1";
        this.currentValue = 0;
        this.startTime = Date.now();
    }
    
    onExecute() {
        if (!simulationRunning) return;
        
        // Generate sensor data based on waveform type
        this.currentValue = this.generateWaveform();
        
        this.setOutputData(0, this.currentValue);
    }
    
    generateWaveform() {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - this.startTime) / 1000; // seconds
        
        switch (this.properties.waveform) {
            case "sine":
                return this.generateSine(elapsedTime);
            case "square":
                return this.generateSquare(elapsedTime);
            case "sawtooth":
                return this.generateSawtooth(elapsedTime);
            case "random":
            default:
                return this.generateRandom();
        }
    }
    
    generateSine(time) {
        const angle = 2 * Math.PI * this.properties.frequency * time;
        const sineValue = Math.sin(angle);
        return this.properties.offset + this.properties.amplitude * sineValue;
    }
    
    generateSquare(time) {
        const period = 1 / this.properties.frequency;
        const phase = (time % period) / period;
        const squareValue = phase < 0.5 ? 1 : -1;
        return this.properties.offset + this.properties.amplitude * squareValue;
    }
    
    generateSawtooth(time) {
        const period = 1 / this.properties.frequency;
        const phase = (time % period) / period;
        const sawtoothValue = 2 * phase - 1; // -1 to 1
        return this.properties.offset + this.properties.amplitude * sawtoothValue;
    }
    
    generateRandom() {
        // Use custom range if specified, otherwise use predefined sensor types
        if (this.properties.useCustomRange) {
            return this.properties.min + Math.random() * (this.properties.max - this.properties.min);
        }
        
        // Use traditional sensor data generation
        if (window.SensorData) {
            return SensorData.generate(this.properties.type, this.properties);
        }
        
        // Fallback
        return Math.random() * 100;
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
        
        // Reset start time when waveform properties change
        if (['waveform', 'frequency', 'amplitude', 'offset'].includes(property)) {
            this.startTime = Date.now();
        }
    }
}

// Make SensorNode available globally
window.SensorNode = SensorNode;