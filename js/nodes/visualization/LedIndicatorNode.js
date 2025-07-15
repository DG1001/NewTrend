// LED Indicator Node - Multi-state visual status indicator
class LedIndicatorNode extends BaseNode {
    constructor() {
        super();
        this.title = "LED Indicator";
        this.addInput("State", "number");
        this.addInput("Boolean", "boolean");
        this.properties = {
            states: [
                { value: 0, color: "#95A5A6", label: "Off", blink: false },
                { value: 1, color: "#27AE60", label: "On", blink: false },
                { value: 2, color: "#F39C12", label: "Warning", blink: true },
                { value: 3, color: "#E74C3C", label: "Alarm", blink: true }
            ],
            name: "LED 1",
            ledSize: "medium"
        };
        this.size = [140, 100];
        this.color = "#34495E";
        this.currentState = 0;
        this.blinkPhase = 0;
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Add State",
                callback: () => {
                    if (this.properties.states.length < 8) {
                        const newValue = this.properties.states.length;
                        this.properties.states.push({
                            value: newValue,
                            color: "#3498DB",
                            label: `State ${newValue}`,
                            blink: false
                        });
                        this.size[1] = Math.max(100, 60 + this.properties.states.length * 18);
                    }
                }
            },
            {
                content: "Remove State",
                callback: () => {
                    if (this.properties.states.length > 2) {
                        this.properties.states.pop();
                        this.size[1] = Math.max(100, 60 + this.properties.states.length * 18);
                    }
                }
            }
        ];
    }
    
    onExecute() {
        const numberInput = this.getInputData(0);
        const booleanInput = this.getInputData(1);
        
        // Boolean input takes priority
        if (booleanInput !== undefined) {
            this.currentState = booleanInput ? 1 : 0;
        } else if (numberInput !== undefined) {
            this.currentState = Math.round(numberInput);
        }
        
        // Update blink phase
        this.blinkPhase += 0.1;
        if (this.blinkPhase > 2 * Math.PI) {
            this.blinkPhase = 0;
        }
    }
    
    onDrawForeground(ctx) {
        const ledSizes = { small: 8, medium: 12, large: 16 };
        const ledRadius = ledSizes[this.properties.ledSize] || 12;
        
        const centerX = this.size[0] * 0.5;
        let currentY = 25;
        
        this.properties.states.forEach((state, index) => {
            const isActive = this.currentState === state.value;
            let alpha = isActive ? 1.0 : 0.3;
            
            // Apply blinking effect
            if (isActive && state.blink) {
                alpha = 0.3 + 0.7 * (Math.sin(this.blinkPhase * 3) + 1) / 2;
            }
            
            // Draw LED
            ctx.globalAlpha = alpha;
            ctx.fillStyle = state.color;
            ctx.beginPath();
            ctx.arc(centerX - 30, currentY, ledRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw LED highlight
            if (isActive) {
                ctx.globalAlpha = alpha * 0.6;
                ctx.fillStyle = "#FFFFFF";
                ctx.beginPath();
                ctx.arc(centerX - 30 - ledRadius * 0.3, currentY - ledRadius * 0.3, ledRadius * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw label
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = isActive ? "#ECF0F1" : "#7F8C8D";
            ctx.font = isActive ? "bold 12px Arial" : "12px Arial";
            ctx.textAlign = "left";
            ctx.fillText(state.label, centerX - 10, currentY + 4);
            
            currentY += 18;
        });
        
        ctx.globalAlpha = 1.0;
    }
}

// Make LedIndicatorNode available globally
window.LedIndicatorNode = LedIndicatorNode;