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
            this.value = this.formatValue(value);
        }, {
            min: this.properties.minValue,
            max: this.properties.maxValue,
            step: this.properties.step
        });
    }
    
    // Calculate decimal places based on step size
    getDecimalPlaces(step) {
        if (step % 1 === 0) {
            // Integer step size -> no decimals
            return 0;
        }
        
        // Convert to string and count decimal places
        const stepStr = step.toString();
        if (stepStr.indexOf('.') !== -1) {
            return stepStr.split('.')[1].length;
        }
        
        // Handle scientific notation (e.g., 1e-3)
        if (stepStr.indexOf('e-') !== -1) {
            return parseInt(stepStr.split('e-')[1]);
        }
        
        return 1; // Default fallback
    }
    
    // Format value based on step size
    formatValue(value) {
        const decimalPlaces = this.getDecimalPlaces(this.properties.step);
        return parseFloat(value.toFixed(decimalPlaces));
    }
    
    onExecute() {
        // Format the value based on step size before output
        const formattedValue = this.formatValue(this.value);
        this.setOutputData(0, formattedValue);
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
            this.value = this.formatValue(value);
            this.widgets[0].value = this.value;
        }
    }
}

window.SliderNode = SliderNode;