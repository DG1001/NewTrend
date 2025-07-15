class SwitchNode extends BaseNode {
    constructor() {
        super();
        this.title = 'Switch';
        this.addOutput('isOn', 'boolean');
        this.properties = {
            switchText: 'Toggle',
            defaultState: false
        };
        this.isOn = this.properties.defaultState;
        this.addWidget('toggle', this.properties.switchText, this.isOn, (value) => {
            this.isOn = value;
        });
    }
    
    onExecute() {
        this.setOutputData(0, this.isOn);
    }

    onPropertyChanged(name, value) {
        if (name === 'switchText') {
            this.widgets[0].name = value;
        } else if (name === 'defaultState') {
            this.isOn = value;
            this.widgets[0].value = value;
        }
    }
}

window.SwitchNode = SwitchNode;