class ComputeNode extends BaseNode {
    constructor(title) {
        super(title || 'Compute Node');
        
        // Initialize properties first
        this.properties.blocklyXML = '';
        this.properties.generatedCode = '';
        this.properties.inputCount = 1;
        this.properties.outputCount = 1;
        this.globals = {}; // Initialize globals object

        // Set up initial inputs and outputs
        this.updateInputsOutputs();

        this.addWidget('button', 'Open Editor', null, () => {
            this.openBlocklyEditor();
        });
    }

    onExecute() {
        if (this.properties.generatedCode) {
            try {
                const func = new Function('inputs', 'outputs', 'globals', this.properties.generatedCode);
                const inputs = this.getInputs();
                const outputs = {};
                
                func(inputs, outputs, this.globals);

                for (let i = 0; i < this.outputs.length; i++) {
                    if (outputs[i] !== undefined) {
                        this.setOutputData(i, outputs[i]);
                    }
                }
            } catch (error) {
                console.error('Error executing generated code:', error);
            }
        }
    }

    getInputs() {
        const inputs = {};
        for (let i = 0; i < this.inputs.length; i++) {
            inputs[i] = this.getInputData(i);
        }
        return inputs;
    }

    updateInputsOutputs() {
        // Remove existing inputs and outputs
        this.inputs.length = 0;
        this.outputs.length = 0;
        
        // Add inputs based on inputCount
        for (let i = 1; i <= this.properties.inputCount; i++) {
            this.addInput(`Input ${i}`, 'number');
        }
        
        // Add outputs based on outputCount
        for (let i = 1; i <= this.properties.outputCount; i++) {
            this.addOutput(`Output ${i}`, 'number');
        }
        
        // Resize node to accommodate new inputs/outputs
        this.size = this.computeSize();
    }
    
    onPropertyChanged(name, value) {
        if (name === 'inputCount' || name === 'outputCount') {
            // Ensure value is within valid range
            if (name === 'inputCount') {
                this.properties.inputCount = Math.max(1, Math.min(10, parseInt(value) || 1));
            } else if (name === 'outputCount') {
                this.properties.outputCount = Math.max(1, Math.min(10, parseInt(value) || 1));
            }
            this.updateInputsOutputs();
        }
    }

    openBlocklyEditor() {
        if (window.BlocklyHelper) {
            window.BlocklyHelper.open(this);
        }
    }
}

LiteGraph.registerNodeType('processing/compute', ComputeNode);