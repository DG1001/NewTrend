
class ButtonNode extends BaseNode {
    constructor(graph) {
        super(graph);
        this.title = 'Button';
        this.addOutput('onPressed', 'boolean');
        this.properties = {
            buttonText: 'Press Me'
        };
        this.pressed = false;
        this.pulseTimer = 0;
        this.addWidget('button', this.properties.buttonText, null, () => {
            this.pressed = true;
            this.pulseTimer = 200; // Hold high for 200ms
        });
    }
    
    onExecute() {
        if (this.pulseTimer > 0) {
            this.pulseTimer -= 16; // Approximate frame time
            if (this.pulseTimer <= 0) {
                this.pressed = false;
            }
        }
        this.setOutputData(0, this.pressed);
    }

    onPropertyChanged(name, value) {
        if (name === 'buttonText') {
            this.widgets[0].name = value;
        }
    }
}

window.ButtonNode = ButtonNode;
