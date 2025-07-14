// Gauge Node - Analog-style circular gauge
class GaugeNode extends BaseNode {
    constructor() {
        super();
        this.title = "Gauge";
        this.addInput("Value", "number");
        this.properties = {
            minValue: 0,
            maxValue: 100,
            warningThreshold: 70,
            criticalThreshold: 90,
            unit: "",
            name: "Gauge 1",
            showDigital: true
        };
        this.size = [120, 120];
        this.color = "#3498DB";
        this.currentValue = 0;
        this.needleAngle = 0;
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input !== undefined) {
            this.currentValue = input;
            // Calculate needle angle (-120° to +120°, total 240°)
            const normalized = (input - this.properties.minValue) / (this.properties.maxValue - this.properties.minValue);
            this.needleAngle = -120 + (normalized * 240);
        }
    }
    
    onDrawForeground(ctx) {
        const centerX = this.size[0] * 0.5;
        const centerY = this.size[1] * 0.55;
        const radius = Math.min(this.size[0], this.size[1]) * 0.35;
        
        // Draw gauge background
        ctx.fillStyle = "#2C3E50";
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw colored segments
        const segments = [
            { start: -120, end: this.getAngleForValue(this.properties.warningThreshold), color: "#27AE60" },
            { start: this.getAngleForValue(this.properties.warningThreshold), end: this.getAngleForValue(this.properties.criticalThreshold), color: "#F39C12" },
            { start: this.getAngleForValue(this.properties.criticalThreshold), end: 120, color: "#E74C3C" }
        ];
        
        segments.forEach(segment => {
            ctx.strokeStyle = segment.color;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 
                (segment.start - 90) * Math.PI / 180, 
                (segment.end - 90) * Math.PI / 180);
            ctx.stroke();
        });
        
        // Draw scale marks
        ctx.strokeStyle = "#ECF0F1";
        ctx.lineWidth = 2;
        for (let angle = -120; angle <= 120; angle += 30) {
            const x1 = centerX + (radius - 8) * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = centerY + (radius - 8) * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = centerX + (radius - 15) * Math.cos((angle - 90) * Math.PI / 180);
            const y2 = centerY + (radius - 15) * Math.sin((angle - 90) * Math.PI / 180);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Draw needle
        ctx.strokeStyle = "#E74C3C";
        ctx.lineWidth = 3;
        const needleLength = radius - 10;
        const needleX = centerX + needleLength * Math.cos((this.needleAngle - 90) * Math.PI / 180);
        const needleY = centerY + needleLength * Math.sin((this.needleAngle - 90) * Math.PI / 180);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.stroke();
        
        // Draw center dot
        ctx.fillStyle = "#E74C3C";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw digital value if enabled
        if (this.properties.showDigital) {
            ctx.fillStyle = "#ECF0F1";
            ctx.font = "12px Arial";
            ctx.textAlign = "center";
            const displayValue = this.currentValue.toFixed(1) + this.properties.unit;
            ctx.fillText(displayValue, centerX, centerY + radius + 15);
        }
    }
    
    getAngleForValue(value) {
        const normalized = (value - this.properties.minValue) / (this.properties.maxValue - this.properties.minValue);
        return -120 + (normalized * 240);
    }
}

// Make GaugeNode available globally
window.GaugeNode = GaugeNode;