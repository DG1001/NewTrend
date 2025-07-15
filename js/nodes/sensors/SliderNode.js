class SliderNode extends BaseNode {
    constructor() {
        super();
        this.title = 'Slider';
        this.addOutput('value', 'number');
        this.properties = {
            sliderText: 'Value',
            minValue: 0,
            maxValue: 100,
            defaultValue: 50,
            step: 1
        };
        this.value = this.properties.defaultValue;
        this.addWidget('slider', this.properties.sliderText, this.value, (value) => {
            this.value = value;
        }, {
            min: this.properties.minValue,
            max: this.properties.maxValue,
            step: this.properties.step
        });
    }
    
    onExecute() {
        this.setOutputData(0, this.value);
    }

    onPropertyChanged(name, value) {
        if (name === 'sliderText') {
            this.widgets[0].name = value;
        } else if (name === 'minValue') {
            this.widgets[0].options.min = value;
            this.properties.minValue = value;
        } else if (name === 'maxValue') {
            this.widgets[0].options.max = value;
            this.properties.maxValue = value;
        } else if (name === 'step') {
            this.widgets[0].options.step = value;
            this.properties.step = value;
        } else if (name === 'defaultValue') {
            this.value = value;
            this.widgets[0].value = value;
        }
    }
}

window.SliderNode = SliderNode;