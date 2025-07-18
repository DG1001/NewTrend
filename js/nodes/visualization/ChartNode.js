// Chart Node - Time-series line chart with multi-trace support
class ChartNode extends BaseNode {
    constructor() {
        super();
        this.title = "Chart";
        this.addInput("Value 1", "number");
        this.addInput("Value 2", "number");
        this.addInput("Value 3", "number");
        this.properties = {
            timeWindow: 30,
            autoScale: true,
            minY: 0,
            maxY: 100,
            showGrid: true,
            name: "Chart 1"
        };
        this.size = [200, 120];
        this.color = "#9B59B6";
        this.dataHistory = [[], [], []]; // Three traces
        this.maxDataPoints = 3000; // Enough for 300 seconds at 100ms intervals
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            {
                content: "Add Input",
                callback: () => {
                    if (this.inputs.length < 5) {
                        this.addInput(`Value ${this.inputs.length + 1}`, "number");
                        this.dataHistory.push([]);
                        this.size[1] = Math.max(120, 80 + this.inputs.length * 10);
                    }
                }
            },
            {
                content: "Remove Input",
                callback: () => {
                    if (this.inputs.length > 1) {
                        this.removeInput(this.inputs.length - 1);
                        this.dataHistory.pop();
                        this.size[1] = Math.max(120, 80 + this.inputs.length * 10);
                    }
                }
            },
            {
                content: "Clear History",
                callback: () => {
                    this.dataHistory.forEach(trace => trace.length = 0);
                }
            }
        ];
    }
    
    onExecute() {
        if (!simulationRunning) return;
        
        const currentTime = Date.now();
        
        // Collect current values and add to history
        for (let i = 0; i < this.inputs.length; i++) {
            const value = this.getInputData(i);
            if (value !== undefined) {
                this.dataHistory[i].push({ time: currentTime, value: value });
                
                // Only limit total points (don't filter by time here)
                if (this.dataHistory[i].length > this.maxDataPoints) {
                    this.dataHistory[i] = this.dataHistory[i].slice(-this.maxDataPoints);
                }
            }
        }
    }
    
    onDrawForeground(ctx) {
        const padding = 15;
        const chartX = padding;
        const chartY = 20;
        const chartW = this.size[0] - padding * 2;
        const chartH = this.size[1] - 40;
        
        // Draw background
        ctx.fillStyle = "#2C3E50";
        ctx.fillRect(chartX, chartY, chartW, chartH);
        
        // Draw grid if enabled
        if (this.properties.showGrid) {
            ctx.strokeStyle = "#34495E";
            ctx.lineWidth = 1;
            
            // Vertical grid lines
            for (let i = 0; i <= 4; i++) {
                const x = chartX + (chartW / 4) * i;
                ctx.beginPath();
                ctx.moveTo(x, chartY);
                ctx.lineTo(x, chartY + chartH);
                ctx.stroke();
            }
            
            // Horizontal grid lines
            for (let i = 0; i <= 4; i++) {
                const y = chartY + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(chartX, y);
                ctx.lineTo(chartX + chartW, y);
                ctx.stroke();
            }
        }
        
        // Calculate Y-axis range
        let minY = this.properties.minY;
        let maxY = this.properties.maxY;
        
        if (this.properties.autoScale) {
            let allValues = [];
            this.dataHistory.forEach(trace => {
                trace.forEach(point => allValues.push(point.value));
            });
            
            if (allValues.length > 0) {
                minY = Math.min(...allValues);
                maxY = Math.max(...allValues);
                const range = maxY - minY;
                if (range === 0) {
                    minY -= 1;
                    maxY += 1;
                } else {
                    minY -= range * 0.1;
                    maxY += range * 0.1;
                }
            }
        }
        
        // Draw data traces
        const colors = ["#E74C3C", "#27AE60", "#3498DB", "#F39C12", "#9B59B6"];
        const currentTime = Date.now();
        const timeWindow = this.properties.timeWindow * 1000;
        
        this.dataHistory.forEach((trace, index) => {
            if (trace.length < 1 || index >= colors.length) return;
            
            // Filter trace to only include points within the time window
            const visibleTrace = trace.filter(point => 
                currentTime - point.time <= timeWindow
            );
            
            if (visibleTrace.length < 1) return;
            
            // Always use the full time window for consistent scaling
            const chartStartTime = currentTime - timeWindow;
            const chartEndTime = currentTime;
            
            ctx.strokeStyle = colors[index];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            let firstPoint = true;
            visibleTrace.forEach(point => {
                // Map point time to chart position using full time window
                const timeFromStart = point.time - chartStartTime;
                const timeProgress = timeFromStart / timeWindow;
                const x = chartX + chartW * timeProgress;
                const y = chartY + chartH * (1 - (point.value - minY) / (maxY - minY));
                
                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        });
        
        // Draw axis labels and debug info
        ctx.fillStyle = "#ECF0F1";
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        ctx.fillText(minY.toFixed(1), chartX + 2, chartY + chartH - 2);
        ctx.fillText(maxY.toFixed(1), chartX + 2, chartY + 12);
        
        // Debug: Show time window info
        ctx.fillStyle = "#BDC3C7";
        ctx.font = "8px Arial";
        ctx.fillText(`${this.properties.timeWindow}s window`, chartX + 2, chartY + chartH + 12);
        
        // Show actual data span if there's data
        if (this.dataHistory[0] && this.dataHistory[0].length > 0) {
            const oldestPoint = this.dataHistory[0].reduce((oldest, point) => 
                point.time < oldest.time ? point : oldest
            );
            const actualSpan = ((currentTime - oldestPoint.time) / 1000).toFixed(1);
            ctx.fillText(`${actualSpan}s data`, chartX + 2, chartY + chartH + 22);
        }
    }
}

// Make ChartNode available globally
window.ChartNode = ChartNode;