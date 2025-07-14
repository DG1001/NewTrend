// NOT Gate Node - Boolean NOT (inversion) operation
class NotGateNode extends BaseNode {
    constructor() {
        super();
        this.title = "NOT";
        this.addInput("Input", "boolean");
        this.addOutput("Output", "boolean");
        this.properties = {
            name: "NOT Gate 1"
        };
        this.size = [80, 50];
        this.color = "#34495E";
        this.result = false;
    }
    
    onExecute() {
        const input = this.getInputData(0);
        this.result = !input;
        this.setOutputData(0, this.result);
    }
    
    onDrawForeground(ctx) {
        // Draw NOT gate symbol
        this.drawText(ctx, "NOT", this.size[0] * 0.5, this.size[1] * 0.5, {
            font: "14px Arial",
            color: this.result ? "#27AE60" : "#E74C3C"
        });
        
        // LED indicator
        this.drawIndicator(ctx, this.size[0] - 15, 12, 6, this.result ? "#27AE60" : "#BDC3C7", true);
    }
}

// Make NotGateNode available globally
window.NotGateNode = NotGateNode;