// OR Gate Node - Boolean OR operation with expandable inputs  
class OrGateNode extends BaseNode {
    constructor() {
        super();
        this.title = "OR";
        this.addInput("A", "boolean");
        this.addInput("B", "boolean");
        this.addOutput("Output", "boolean");
        this.properties = {
            name: "OR Gate 1"
        };
        this.size = [100, 60];
        this.color = "#34495E";
        this.result = false;
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Add Input",
                callback: () => {
                    if (this.inputs.length < 8) {
                        const letter = String.fromCharCode(65 + this.inputs.length); // A, B, C, D...
                        this.addInput(letter, "boolean");
                        this.size[1] = Math.max(60, 40 + this.inputs.length * 10);
                    }
                }
            },
            {
                content: "Remove Input",
                callback: () => {
                    if (this.inputs.length > 2) {
                        this.removeInput(this.inputs.length - 1);
                        this.size[1] = Math.max(60, 40 + this.inputs.length * 10);
                    }
                }
            }
        ];
    }
    
    onExecute() {
        // OR operation: at least one input must be true
        this.result = false;
        
        for (let i = 0; i < this.inputs.length; i++) {
            const input = this.getInputData(i);
            if (input) {
                this.result = true;
                break;
            }
        }
        
        this.setOutputData(0, this.result);
    }
    
    onDrawForeground(ctx) {
        // Draw OR gate symbol
        this.drawText(ctx, "OR", this.size[0] * 0.5, this.size[1] * 0.5, {
            font: "14px Arial",
            color: this.result ? "#27AE60" : "#E74C3C"
        });
        
        // LED indicator
        this.drawIndicator(ctx, this.size[0] - 15, 12, 6, this.result ? "#27AE60" : "#BDC3C7", true);
    }
}

// Make OrGateNode available globally
window.OrGateNode = OrGateNode;