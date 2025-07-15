class ComputeNode extends BaseNode {
    constructor(title) {
        super(title || 'Compute Node');
        this.addInput('Input 1', 'number');
        this.addOutput('Output 1', 'number');

        this.properties.blocklyXML = '';
        this.properties.generatedCode = '';

        this.addWidget('button', 'Open Editor', null, () => {
            this.openBlocklyEditor();
        });
    }

    onExecute() {
        if (this.properties.generatedCode) {
            try {
                const func = new Function('inputs', 'outputs', this.properties.generatedCode);
                const inputs = this.getInputs();
                const outputs = {};
                
                func(inputs, outputs);

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

    openBlocklyEditor() {
        if (window.BlocklyHelper) {
            window.BlocklyHelper.open(this);
        }
    }
}

LiteGraph.registerNodeType('processing/compute', ComputeNode);