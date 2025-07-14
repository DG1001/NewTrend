// Filter Node - Data filtering with moving average, median, and low-pass
class FilterNode extends BaseNode {
    constructor() {
        super();
        this.title = "Filter";
        this.addInput("Input", "number");
        this.addOutput("Output", "number");
        this.properties = {
            type: "movingAverage",
            windowSize: 5,
            cutoffFrequency: 0.1,
            name: "Filter 1"
        };
        this.size = [140, 60];
        this.color = "#F39C12";
        this.dataBuffer = [];
        this.filteredValue = 0;
        this.lastOutput = 0;
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input === undefined) return;
        
        this.dataBuffer.push(input);
        
        // Limit buffer size
        const maxSize = Math.max(this.properties.windowSize, 10);
        if (this.dataBuffer.length > maxSize) {
            this.dataBuffer.shift();
        }
        
        // Apply selected filter
        switch (this.properties.type) {
            case "movingAverage":
                this.filteredValue = this.applyMovingAverage();
                break;
            case "median":
                this.filteredValue = this.applyMedianFilter();
                break;
            case "lowPass":
                this.filteredValue = this.applyLowPassFilter(input);
                break;
            default:
                this.filteredValue = input;
        }
        
        this.lastOutput = this.filteredValue;
        this.setOutputData(0, this.filteredValue);
    }
    
    applyMovingAverage() {
        if (this.dataBuffer.length === 0) return 0;
        
        const windowSize = Math.min(this.properties.windowSize, this.dataBuffer.length);
        const recentData = this.dataBuffer.slice(-windowSize);
        const sum = recentData.reduce((acc, val) => acc + val, 0);
        return sum / recentData.length;
    }
    
    applyMedianFilter() {
        if (this.dataBuffer.length === 0) return 0;
        
        const windowSize = Math.min(this.properties.windowSize, this.dataBuffer.length);
        const recentData = this.dataBuffer.slice(-windowSize);
        const sorted = [...recentData].sort((a, b) => a - b);
        
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            return sorted[mid];
        }
    }
    
    applyLowPassFilter(input) {
        // Simple exponential moving average low-pass filter
        const alpha = this.properties.cutoffFrequency;
        this.lastOutput = alpha * input + (1 - alpha) * this.lastOutput;
        return this.lastOutput;
    }
    
    onDrawForeground(ctx) {
        // Display filter type and current value
        this.drawText(ctx, this.properties.type, this.size[0] * 0.5, this.size[1] * 0.3, {
            font: "10px Arial",
            color: "#666"
        });
        
        this.drawText(ctx, this.filteredValue.toFixed(2), this.size[0] * 0.5, this.size[1] * 0.7, {
            font: "12px Arial",
            color: "#333"
        });
    }
}

// Make FilterNode available globally
window.FilterNode = FilterNode;