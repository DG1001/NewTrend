// Display Node - Shows real-time values with optional mini-graphs
class DisplayNode extends BaseNode {
    constructor() {
        super();
        this.title = "Anzeige";
        this.addInput("Wert", "number");
        this.properties = {
            unit: "",
            showGraph: false,
            name: "Anzeige 1"
        };
        this.size = [120, 80];
        this.color = "#27AE60";
        this.currentValue = 0;
        this.valueHistory = [];
        this.maxHistoryLength = 50;
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input !== undefined) {
            this.currentValue = input;
            
            // Store value for mini-graph if enabled
            if (this.properties.showGraph) {
                this.valueHistory.push(input);
                if (this.valueHistory.length > this.maxHistoryLength) {
                    this.valueHistory.shift();
                }
            }
        }
    }
    
    onDrawForeground(ctx) {
        // Display current value
        ctx.font = "16px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        
        const displayValue = `${this.currentValue.toFixed(2)} ${this.properties.unit}`;
        ctx.fillText(displayValue, this.size[0] * 0.5, this.size[1] * 0.4);
        
        // Draw mini-graph if enabled
        if (this.properties.showGraph && this.valueHistory.length > 1) {
            this.drawMiniGraph(ctx);
        }
    }
    
    drawMiniGraph(ctx) {
        const graphX = 10;
        const graphY = this.size[1] * 0.55;
        const graphW = this.size[0] - 20;
        const graphH = this.size[1] * 0.35;
        
        // Graph background
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(graphX, graphY, graphW, graphH);
        
        // Find min/max for scaling
        const min = Math.min(...this.valueHistory);
        const max = Math.max(...this.valueHistory);
        const range = max - min || 1;
        
        // Draw graph line
        ctx.strokeStyle = "#27AE60";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.valueHistory.length; i++) {
            const x = graphX + (i / (this.valueHistory.length - 1)) * graphW;
            const normalizedValue = (this.valueHistory[i] - min) / range;
            const y = graphY + graphH - (normalizedValue * graphH);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
}

// Make DisplayNode available globally
window.DisplayNode = DisplayNode;