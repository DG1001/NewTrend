// Formula Node - Mathematical operations and custom JavaScript formulas
class FormulaNode extends BaseNode {
    constructor() {
        super();
        this.title = "Formel";
        this.addInput("a", "number");
        this.addInput("b", "number");
        this.addOutput("Ergebnis", "number");
        this.properties = {
            operation: "add",
            customFormula: "a + b",
            mode: "basic",
            name: "Formel 1"
        };
        this.size = [140, 80];
        this.color = "#9B59B6";
        this.result = 0;
        this.lastError = null;
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Add Input",
                callback: () => {
                    if (this.inputs.length < 5) {
                        const letter = String.fromCharCode(97 + this.inputs.length); // a, b, c, d, e
                        this.addInput(letter, "number");
                        this.size[1] = Math.max(80, 60 + this.inputs.length * 10);
                    }
                }
            },
            {
                content: "Remove Input", 
                callback: () => {
                    if (this.inputs.length > 2) {
                        this.removeInput(this.inputs.length - 1);
                        this.size[1] = Math.max(80, 60 + this.inputs.length * 10);
                    }
                }
            }
        ];
    }
    
    onExecute() {
        const a = this.getInputData(0) || 0;
        const b = this.getInputData(1) || 0;
        const c = this.getInputData(2) || 0;
        const d = this.getInputData(3) || 0;
        const e = this.getInputData(4) || 0;
        
        try {
            if (this.properties.mode === "basic") {
                this.result = this.executeBasicOperation(a, b);
            } else {
                this.result = this.executeCustomFormula({ a, b, c, d, e });
            }
            this.lastError = null;
        } catch (error) {
            this.lastError = error.message;
            this.result = 0;
            console.error("Formula execution error:", error);
        }
        
        this.setOutputData(0, this.result);
    }
    
    executeBasicOperation(a, b) {
        switch (this.properties.operation) {
            case "add": return a + b;
            case "subtract": return a - b;
            case "multiply": return a * b;
            case "divide": return b !== 0 ? a / b : 0;
            default: return a + b;
        }
    }
    
    executeCustomFormula(inputs) {
        // Create a safe evaluation context
        const context = {
            ...inputs,
            Math: Math,
            abs: Math.abs,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            sqrt: Math.sqrt,
            pow: Math.pow,
            min: Math.min,
            max: Math.max,
            PI: Math.PI,
            E: Math.E
        };
        
        // Simple and safer eval alternative for basic formulas
        const formula = this.properties.customFormula;
        
        // Basic validation - only allow safe characters
        if (!/^[a-e0-9+\-*/().\s,Math_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]*$/.test(formula)) {
            throw new Error("Invalid characters in formula");
        }
        
        // Create function and execute
        const func = new Function(...Object.keys(context), `return ${formula}`);
        return func(...Object.values(context));
    }
    
    onDrawForeground(ctx) {
        // Display operation symbol or result
        if (this.properties.mode === "basic") {
            const symbol = this.getOperationSymbol(this.properties.operation);
            this.drawText(ctx, symbol, this.size[0] * 0.5, this.size[1] * 0.4, {
                font: "24px Arial",
                color: "#9B59B6"
            });
        }
        
        // Display result
        this.drawText(ctx, this.result.toFixed(2), this.size[0] * 0.5, this.size[1] * 0.7, {
            font: "12px Arial",
            color: this.lastError ? "#E74C3C" : "#333"
        });
        
        // Display error indicator
        if (this.lastError) {
            this.drawIndicator(ctx, this.size[0] - 8, 8, 4, "#E74C3C", true);
        }
    }
    
    getOperationSymbol(operation) {
        const symbols = {
            add: "+",
            subtract: "−", 
            multiply: "×",
            divide: "÷"
        };
        return symbols[operation] || "+";
    }
}

// Make FormulaNode available globally
window.FormulaNode = FormulaNode;