// Constant Node - Provides fixed value sources
class ConstantNode extends BaseNode {
    constructor() {
        super();
        this.title = "Konstante";
        this.addOutput("Wert", "number");
        this.properties = {
            value: 10,
            name: "Konstante 1"
        };
        this.size = [120, 50];
        this.color = "#95A5A6";
    }
    
    onExecute() {
        this.setOutputData(0, this.properties.value);
    }
    
    onDrawForeground(ctx) {
        // Display the constant value
        ctx.font = "14px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        
        ctx.fillText(this.properties.value.toString(), this.size[0] * 0.5, this.size[1] * 0.6);
    }
}

// Make ConstantNode available globally
window.ConstantNode = ConstantNode;