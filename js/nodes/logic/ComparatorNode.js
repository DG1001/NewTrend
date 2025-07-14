// Comparator Node - Three-output comparison (greater, equal, less)
class ComparatorNode extends BaseNode {
    constructor() {
        super();
        this.title = "Vergleich";
        this.addInput("A", "number");
        this.addInput("B", "number");
        this.addOutput("A > B", "boolean");
        this.addOutput("A = B", "boolean");
        this.addOutput("A < B", "boolean");
        this.properties = {
            tolerance: 0.01,
            name: "Vergleich 1"
        };
        this.size = [160, 90];
        this.color = "#E67E22";
        this.results = { greater: false, equal: false, less: false };
    }
    
    onExecute() {
        const a = this.getInputData(0) || 0;
        const b = this.getInputData(1) || 0;
        const tolerance = this.properties.tolerance;
        
        this.results.greater = a > b + tolerance;
        this.results.equal = Math.abs(a - b) <= tolerance;
        this.results.less = a < b - tolerance;
        
        this.setOutputData(0, this.results.greater);
        this.setOutputData(1, this.results.equal);
        this.setOutputData(2, this.results.less);
    }
    
    onDrawForeground(ctx) {
        // Show comparison results
        const x = this.size[0] - 10;
        ctx.textAlign = "right";
        ctx.font = "12px Arial";
        
        ctx.fillStyle = this.results.greater ? "#27AE60" : "#BDC3C7";
        ctx.fillText(">", x, 25);
        
        ctx.fillStyle = this.results.equal ? "#27AE60" : "#BDC3C7";
        ctx.fillText("=", x, 45);
        
        ctx.fillStyle = this.results.less ? "#27AE60" : "#BDC3C7";
        ctx.fillText("<", x, 65);
    }
}

// Make ComparatorNode available globally
window.ComparatorNode = ComparatorNode;