// Property Panel - Handles node property UI generation and management
const PropertyPanel = {
    // Show properties for the selected node
    show(node) {
        const propertiesPanel = document.getElementById("properties-panel") || document.getElementById("node-properties");
        
        if (!node) {
            this.showEmpty(propertiesPanel);
            return;
        }
        
        // Determine node type styling
        const nodeInfo = this.getNodeInfo(node);
        
        let html = `
            <div class="${nodeInfo.cssClass}">
                <h4><i class="fas ${nodeInfo.icon}"></i> ${node.title}: ${node.properties.name || ""}</h4>
                
                <div class="property">
                    <label>Name:</label>
                    <input type="text" id="prop-name" value="${node.properties.name || ""}" placeholder="Geben Sie einen Namen ein">
                </div>
        `;
        
        // Add node-specific properties
        html += this.generateNodeProperties(node);
        
        // Add update button
        html += `
                <button id="update-properties">
                    <i class="fas fa-save"></i> Aktualisieren
                </button>
            </div>
        `;
        
        propertiesPanel.innerHTML = html;
        
        // Setup event handlers
        this.setupEventHandlers(node);
    },
    
    // Show empty state
    showEmpty(panel) {
        panel.innerHTML = `
            <div class="empty-properties">
                <i class="fas fa-info-circle" style="font-size: 24px; color: #0078d7; margin-bottom: 10px;"></i>
                <p>Wählen Sie ein Element aus, um dessen Eigenschaften zu bearbeiten.</p>
            </div>
        `;
    },
    
    // Get node styling information
    getNodeInfo(node) {
        const nodeTypes = {
            // Data Sources & Display
            'SensorNode': { cssClass: 'sensor-properties', icon: 'fa-thermometer-half' },
            'DisplayNode': { cssClass: 'display-properties', icon: 'fa-chart-line' },
            'ConstantNode': { cssClass: 'constant-properties', icon: 'fa-hashtag' },
            
            // Processing & Analysis
            'FilterNode': { cssClass: 'filter-properties', icon: 'fa-filter' },
            'StatisticsNode': { cssClass: 'statistics-properties', icon: 'fa-chart-bar' },
            'FormulaNode': { cssClass: 'formula-properties', icon: 'fa-calculator' },
            
            // Visualization
            'GaugeNode': { cssClass: 'gauge-properties', icon: 'fa-tachometer-alt' },
            'ChartNode': { cssClass: 'chart-properties', icon: 'fa-chart-area' },
            'LedIndicatorNode': { cssClass: 'led-properties', icon: 'fa-lightbulb' },
            
            // Logic & Control
            'AndGateNode': { cssClass: 'logic-properties', icon: 'fa-square' },
            'OrGateNode': { cssClass: 'logic-properties', icon: 'fa-circle' },
            'NotGateNode': { cssClass: 'logic-properties', icon: 'fa-exclamation' },
            'ComparatorNode': { cssClass: 'comparator-properties', icon: 'fa-not-equal' },
            'CounterNode': { cssClass: 'counter-properties', icon: 'fa-sort-numeric-up' },
            
            // Automation
            'TimerNode': { cssClass: 'timer-properties', icon: 'fa-clock' },
            'PidControllerNode': { cssClass: 'pid-properties', icon: 'fa-cogs' },
            'AlarmNode': { cssClass: 'alarm-properties', icon: 'fa-bell' },
        };
        
        const nodeType = node.constructor.name;
        return nodeTypes[nodeType] || { cssClass: 'default-properties', icon: 'fa-cog' };
    },
    
    // Generate node-specific property forms
    generateNodeProperties(node) {
        const nodeType = node.constructor.name;
        
        switch (nodeType) {
            case 'SensorNode':
                return this.generateSensorProperties(node);
            case 'DisplayNode':
                return this.generateDisplayProperties(node);
            case 'ConstantNode':
                return this.generateConstantProperties(node);
            case 'GaugeNode':
                return this.generateGaugeProperties(node);
            case 'FilterNode':
                return this.generateFilterProperties(node);
            case 'FormulaNode':
                return this.generateFormulaProperties(node);
            case 'AlarmNode':
                return this.generateAlarmProperties(node);
            case 'ComparatorNode':
                return this.generateComparatorProperties(node);
            case 'TimerNode':
                return this.generateTimerProperties(node);
            case 'CounterNode':
                return this.generateCounterProperties(node);
            case 'ChartNode':
                return this.generateChartProperties(node);
            case 'LedIndicatorNode':
                return this.generateLedProperties(node);
            case 'StatisticsNode':
                return this.generateStatisticsProperties(node);
            case 'PidControllerNode':
                return this.generatePidProperties(node);
            case 'AndGateNode':
                return this.generateLogicGateProperties(node);
            case 'OrGateNode':
                return this.generateLogicGateProperties(node);
            case 'NotGateNode':
                return this.generateLogicGateProperties(node);
            case 'ButtonNode':
                return this.generateButtonProperties(node);
            case 'SwitchNode':
                return this.generateSwitchProperties(node);
            case 'SliderNode':
                return this.generateSliderProperties(node);
            case 'FFTNode':
                return this.generateFFTProperties(node);
            default:
                return '<div class="property"><p>No specific properties available for this node type.</p></div>';
        }
    },
    
    // Sensor node properties
    generateSensorProperties(node) {
        return `
            <div class="property">
                <label>Typ:</label>
                <select id="prop-type">
                    <option value="temperature" ${node.properties.type === "temperature" ? "selected" : ""}>Temperatur</option>
                    <option value="humidity" ${node.properties.type === "humidity" ? "selected" : ""}>Luftfeuchtigkeit</option>
                    <option value="pressure" ${node.properties.type === "pressure" ? "selected" : ""}>Druck</option>
                    <option value="flow" ${node.properties.type === "flow" ? "selected" : ""}>Durchfluss</option>
                    <option value="custom" ${node.properties.type === "custom" ? "selected" : ""}>Benutzerdefiniert</option>
                </select>
            </div>
            <div class="property">
                <label>Einheit:</label>
                <input type="text" id="prop-unit" value="${node.properties.unit}" placeholder="z.B. °C, %, hPa">
            </div>
            <div class="property">
                <label>Wertebereich:</label>
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-useCustomRange" ${node.properties.useCustomRange ? "checked" : ""}>
                    <label for="prop-useCustomRange" style="display: inline; font-weight: normal;">Benutzerdefinierten Bereich verwenden</label>
                </div>
            </div>
            <div class="property">
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label>Min:</label>
                        <input type="number" id="prop-min" value="${node.properties.min}">
                    </div>
                    <div style="flex: 1;">
                        <label>Max:</label>
                        <input type="number" id="prop-max" value="${node.properties.max}">
                    </div>
                </div>
            </div>
        `;
    },
    
    // Display node properties
    generateDisplayProperties(node) {
        return `
            <div class="property">
                <label>Einheit:</label>
                <input type="text" id="prop-unit" value="${node.properties.unit}" placeholder="z.B. °C, %, hPa">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-showGraph" ${node.properties.showGraph ? "checked" : ""}>
                    <label for="prop-showGraph" style="display: inline; font-weight: normal;">Mini-Graph anzeigen</label>
                </div>
            </div>
        `;
    },
    
    // Constant node properties
    generateConstantProperties(node) {
        return `
            <div class="property">
                <label>Wert:</label>
                <input type="number" id="prop-value" value="${node.properties.value}" step="any">
            </div>
        `;
    },
    
    // Gauge node properties
    generateGaugeProperties(node) {
        return `
            <div class="property">
                <label>Wertebereich:</label>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label>Min:</label>
                        <input type="number" id="prop-minValue" value="${node.properties.minValue}">
                    </div>
                    <div style="flex: 1;">
                        <label>Max:</label>
                        <input type="number" id="prop-maxValue" value="${node.properties.maxValue}">
                    </div>
                </div>
            </div>
            <div class="property">
                <label>Warnschwelle:</label>
                <input type="number" id="prop-warningThreshold" value="${node.properties.warningThreshold}">
            </div>
            <div class="property">
                <label>Kritische Schwelle:</label>
                <input type="number" id="prop-criticalThreshold" value="${node.properties.criticalThreshold}">
            </div>
            <div class="property">
                <label>Einheit:</label>
                <input type="text" id="prop-unit" value="${node.properties.unit}" placeholder="z.B. °C, %, hPa">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-showDigital" ${node.properties.showDigital ? "checked" : ""}>
                    <label for="prop-showDigital" style="display: inline; font-weight: normal;">Digitalanzeige anzeigen</label>
                </div>
            </div>
        `;
    },
    
    // Setup event handlers for property updates
    setupEventHandlers(node) {
        const updateButton = document.getElementById("update-properties");
        if (updateButton) {
            updateButton.addEventListener("click", () => {
                this.updateNodeProperties(node);
            });
        }
        
        // Setup PID Reset button if present
        const resetPidButton = document.getElementById("reset-pid");
        if (resetPidButton) {
            resetPidButton.addEventListener("click", () => {
                this.resetPidController(node);
            });
        }
    },
    
    // Update node properties from form values
    updateNodeProperties(node) {
        // Update common properties
        const nameField = document.getElementById("prop-name");
        if (nameField) {
            node.properties.name = nameField.value;
        }
        
        // Update node-specific properties
        const nodeType = node.constructor.name;
        
        switch (nodeType) {
            case 'SensorNode':
                this.updateSensorProperties(node);
                break;
            case 'DisplayNode':
                this.updateDisplayProperties(node);
                break;
            case 'ConstantNode':
                this.updateConstantProperties(node);
                break;
            case 'GaugeNode':
                this.updateGaugeProperties(node);
                break;
            case 'FilterNode':
                this.updateFilterProperties(node);
                break;
            case 'FormulaNode':
                this.updateFormulaProperties(node);
                break;
            case 'AlarmNode':
                this.updateAlarmProperties(node);
                break;
            case 'ComparatorNode':
                this.updateComparatorProperties(node);
                break;
            case 'TimerNode':
                this.updateTimerProperties(node);
                break;
            case 'CounterNode':
                this.updateCounterProperties(node);
                break;
            case 'ChartNode':
                this.updateChartProperties(node);
                break;
            case 'LedIndicatorNode':
                this.updateLedProperties(node);
                break;
            case 'StatisticsNode':
                this.updateStatisticsProperties(node);
                break;
            case 'PidControllerNode':
                this.updatePidProperties(node);
                break;
            case 'AndGateNode':
            case 'OrGateNode':
            case 'NotGateNode':
                this.updateLogicGateProperties(node);
                break;
            case 'ButtonNode':
                this.updateButtonProperties(node);
                break;
            case 'SwitchNode':
                this.updateSwitchProperties(node);
                break;
            case 'SliderNode':
                this.updateSliderProperties(node);
                break;
            case 'FFTNode':
                this.updateFFTProperties(node);
                break;
        }
        
        // Show confirmation
        this.showUpdateConfirmation();
        
        // Refresh graph
        if (window.graph) {
            graph.setDirtyCanvas(true);
        }
    },
    
    // Update sensor node properties
    updateSensorProperties(node) {
        const typeField = document.getElementById("prop-type");
        const unitField = document.getElementById("prop-unit");
        const useCustomRangeField = document.getElementById("prop-useCustomRange");
        const minField = document.getElementById("prop-min");
        const maxField = document.getElementById("prop-max");
        
        if (typeField) node.properties.type = typeField.value;
        if (unitField) node.properties.unit = unitField.value;
        if (useCustomRangeField) node.properties.useCustomRange = useCustomRangeField.checked;
        if (minField) node.properties.min = parseFloat(minField.value);
        if (maxField) node.properties.max = parseFloat(maxField.value);
    },
    
    // Update display node properties
    updateDisplayProperties(node) {
        const unitField = document.getElementById("prop-unit");
        const showGraphField = document.getElementById("prop-showGraph");
        
        if (unitField) node.properties.unit = unitField.value;
        if (showGraphField) node.properties.showGraph = showGraphField.checked;
    },
    
    // Update constant node properties
    updateConstantProperties(node) {
        const valueField = document.getElementById("prop-value");
        if (valueField) node.properties.value = parseFloat(valueField.value);
    },
    
    // Update gauge node properties
    updateGaugeProperties(node) {
        const minValueField = document.getElementById("prop-minValue");
        const maxValueField = document.getElementById("prop-maxValue");
        const warningField = document.getElementById("prop-warningThreshold");
        const criticalField = document.getElementById("prop-criticalThreshold");
        const unitField = document.getElementById("prop-unit");
        const showDigitalField = document.getElementById("prop-showDigital");
        
        if (minValueField) node.properties.minValue = parseFloat(minValueField.value);
        if (maxValueField) node.properties.maxValue = parseFloat(maxValueField.value);
        if (warningField) node.properties.warningThreshold = parseFloat(warningField.value);
        if (criticalField) node.properties.criticalThreshold = parseFloat(criticalField.value);
        if (unitField) node.properties.unit = unitField.value;
        if (showDigitalField) node.properties.showDigital = showDigitalField.checked;
    },
    
    // Update filter node properties
    updateFilterProperties(node) {
        const typeField = document.getElementById("prop-type");
        const windowSizeField = document.getElementById("prop-windowSize");
        const cutoffFrequencyField = document.getElementById("prop-cutoffFrequency");
        
        if (typeField) node.properties.type = typeField.value;
        if (windowSizeField) node.properties.windowSize = parseInt(windowSizeField.value);
        if (cutoffFrequencyField) node.properties.cutoffFrequency = parseFloat(cutoffFrequencyField.value);
    },
    
    // Update formula node properties
    updateFormulaProperties(node) {
        const modeField = document.getElementById("prop-mode");
        const operationField = document.getElementById("prop-operation");
        const customFormulaField = document.getElementById("prop-customFormula");
        
        if (modeField) node.properties.mode = modeField.value;
        if (operationField) node.properties.operation = operationField.value;
        if (customFormulaField) node.properties.customFormula = customFormulaField.value;
    },
    
    // Update alarm node properties
    updateAlarmProperties(node) {
        const thresholdField = document.getElementById("prop-threshold");
        const conditionField = document.getElementById("prop-condition");
        const hysteresisField = document.getElementById("prop-hysteresis");
        
        if (thresholdField) node.properties.threshold = parseFloat(thresholdField.value);
        if (conditionField) node.properties.condition = conditionField.value;
        if (hysteresisField) node.properties.hysteresis = parseFloat(hysteresisField.value);
    },
    
    // Update comparator node properties
    updateComparatorProperties(node) {
        const toleranceField = document.getElementById("prop-tolerance");
        if (toleranceField) node.properties.tolerance = parseFloat(toleranceField.value);
    },
    
    // Update timer node properties
    updateTimerProperties(node) {
        const modeField = document.getElementById("prop-mode");
        const durationField = document.getElementById("prop-duration");
        const autoResetField = document.getElementById("prop-autoReset");
        
        if (modeField) node.properties.mode = modeField.value;
        if (durationField) node.properties.duration = parseFloat(durationField.value);
        if (autoResetField) node.properties.autoReset = autoResetField.checked;
    },
    
    // Update counter node properties
    updateCounterProperties(node) {
        const maxCountField = document.getElementById("prop-maxCount");
        const resetOnOverflowField = document.getElementById("prop-resetOnOverflow");
        
        if (maxCountField) node.properties.maxCount = parseInt(maxCountField.value);
        if (resetOnOverflowField) node.properties.resetOnOverflow = resetOnOverflowField.checked;
    },
    
    // Filter node properties
    generateFilterProperties(node) {
        return `
            <div class="property">
                <label>Filter Type:</label>
                <select id="prop-type">
                    <option value="movingAverage" ${node.properties.type === "movingAverage" ? "selected" : ""}>Moving Average</option>
                    <option value="median" ${node.properties.type === "median" ? "selected" : ""}>Median</option>
                    <option value="lowPass" ${node.properties.type === "lowPass" ? "selected" : ""}>Low Pass</option>
                </select>
            </div>
            <div class="property">
                <label>Window Size:</label>
                <input type="number" id="prop-windowSize" value="${node.properties.windowSize}" min="1" max="50">
            </div>
            <div class="property">
                <label>Cutoff Frequency (Low Pass):</label>
                <input type="number" id="prop-cutoffFrequency" value="${node.properties.cutoffFrequency}" min="0" max="1" step="0.01">
            </div>
        `;
    },
    
    // Formula node properties  
    generateFormulaProperties(node) {
        return `
            <div class="property">
                <label>Mode:</label>
                <select id="prop-mode">
                    <option value="basic" ${node.properties.mode === "basic" ? "selected" : ""}>Basic Operations</option>
                    <option value="custom" ${node.properties.mode === "custom" ? "selected" : ""}>Custom Formula</option>
                </select>
            </div>
            <div class="property">
                <label>Operation (Basic Mode):</label>
                <select id="prop-operation">
                    <option value="add" ${node.properties.operation === "add" ? "selected" : ""}>Addition (+)</option>
                    <option value="subtract" ${node.properties.operation === "subtract" ? "selected" : ""}>Subtraction (-)</option>
                    <option value="multiply" ${node.properties.operation === "multiply" ? "selected" : ""}>Multiplication (×)</option>
                    <option value="divide" ${node.properties.operation === "divide" ? "selected" : ""}>Division (÷)</option>
                </select>
            </div>
            <div class="property">
                <label>Custom Formula:</label>
                <textarea id="prop-customFormula" rows="3" placeholder="e.g., a + b * Math.sin(c)">${node.properties.customFormula}</textarea>
                <small>Available variables: a, b, c, d, e. Math functions supported.</small>
            </div>
        `;
    },
    
    // Alarm node properties
    generateAlarmProperties(node) {
        return `
            <div class="property">
                <label>Threshold:</label>
                <input type="number" id="prop-threshold" value="${node.properties.threshold}" step="any">
            </div>
            <div class="property">
                <label>Condition:</label>
                <select id="prop-condition">
                    <option value="greater" ${node.properties.condition === "greater" ? "selected" : ""}>Greater Than</option>
                    <option value="less" ${node.properties.condition === "less" ? "selected" : ""}>Less Than</option>
                </select>
            </div>
            <div class="property">
                <label>Hysteresis:</label>
                <input type="number" id="prop-hysteresis" value="${node.properties.hysteresis}" min="0" step="any">
            </div>
        `;
    },
    
    // Comparator node properties
    generateComparatorProperties(node) {
        return `
            <div class="property">
                <label>Tolerance:</label>
                <input type="number" id="prop-tolerance" value="${node.properties.tolerance}" min="0" step="0.001">
                <small>Values within this tolerance are considered equal</small>
            </div>
        `;
    },
    
    // Timer node properties
    generateTimerProperties(node) {
        return `
            <div class="property">
                <label>Mode:</label>
                <select id="prop-mode">
                    <option value="interval" ${node.properties.mode === "interval" ? "selected" : ""}>Interval</option>
                    <option value="timeout" ${node.properties.mode === "timeout" ? "selected" : ""}>Timeout</option>
                </select>
            </div>
            <div class="property">
                <label>Duration (seconds):</label>
                <input type="number" id="prop-duration" value="${node.properties.duration}" min="0.1" step="0.1">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-autoReset" ${node.properties.autoReset ? "checked" : ""}>
                    <label for="prop-autoReset" style="display: inline; font-weight: normal;">Auto Reset</label>
                </div>
            </div>
        `;
    },
    
    // Counter node properties
    generateCounterProperties(node) {
        return `
            <div class="property">
                <label>Max Count:</label>
                <input type="number" id="prop-maxCount" value="${node.properties.maxCount}" min="1">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-resetOnOverflow" ${node.properties.resetOnOverflow ? "checked" : ""}>
                    <label for="prop-resetOnOverflow" style="display: inline; font-weight: normal;">Reset on Overflow</label>
                </div>
            </div>
        `;
    },
    
    // Chart node properties
    generateChartProperties(node) {
        return `
            <div class="property">
                <label>Time Window (seconds):</label>
                <input type="number" id="prop-timeWindow" value="${node.properties.timeWindow}" min="5" max="300">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-autoScale" ${node.properties.autoScale ? "checked" : ""}>
                    <label for="prop-autoScale" style="display: inline; font-weight: normal;">Auto Scale Y-Axis</label>
                </div>
            </div>
            <div class="property">
                <label>Y-Axis Range (if not auto-scale):</label>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label>Min Y:</label>
                        <input type="number" id="prop-minY" value="${node.properties.minY}">
                    </div>
                    <div style="flex: 1;">
                        <label>Max Y:</label>
                        <input type="number" id="prop-maxY" value="${node.properties.maxY}">
                    </div>
                </div>
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-showGrid" ${node.properties.showGrid ? "checked" : ""}>
                    <label for="prop-showGrid" style="display: inline; font-weight: normal;">Show Grid</label>
                </div>
            </div>
        `;
    },
    
    // LED Indicator properties
    generateLedProperties(node) {
        return `
            <div class="property">
                <label>LED Size:</label>
                <select id="prop-ledSize">
                    <option value="small" ${node.properties.ledSize === "small" ? "selected" : ""}>Small</option>
                    <option value="medium" ${node.properties.ledSize === "medium" ? "selected" : ""}>Medium</option>
                    <option value="large" ${node.properties.ledSize === "large" ? "selected" : ""}>Large</option>
                </select>
            </div>
            <div class="property">
                <label>LED States:</label>
                <small>Configure the different LED states. Current states:</small>
                <div id="led-states-display" style="margin-top: 10px;">
                    ${node.properties.states.map((state, index) => `
                        <div style="display: flex; align-items: center; margin-bottom: 5px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${state.color}; margin-right: 8px;"></div>
                            <span style="flex: 1;">${state.label} (${state.value})</span>
                            <span style="font-size: 10px; color: #666;">${state.blink ? "Blinking" : "Solid"}</span>
                        </div>
                    `).join('')}
                </div>
                <small style="color: #666; margin-top: 5px; display: block;">Note: LED states can be configured by selecting individual states in the advanced properties (future feature).</small>
            </div>
        `;
    },
    
    // Statistics node properties
    generateStatisticsProperties(node) {
        return `
            <div class="property">
                <label>Window Size:</label>
                <input type="number" id="prop-windowSize" value="${node.properties.windowSize}" min="1" max="100">
                <small>Number of data points to analyze</small>
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-resetOnStart" ${node.properties.resetOnStart ? "checked" : ""}>
                    <label for="prop-resetOnStart" style="display: inline; font-weight: normal;">Reset on Simulation Start</label>
                </div>
            </div>
        `;
    },
    
    // PID Controller properties
    generatePidProperties(node) {
        return `
            <div class="property">
                <label>Proportional (Kp):</label>
                <input type="number" id="prop-kp" value="${node.properties.kp}" min="0" max="100" step="0.1">
            </div>
            <div class="property">
                <label>Integral (Ki):</label>
                <input type="number" id="prop-ki" value="${node.properties.ki}" min="0" max="10" step="0.01">
            </div>
            <div class="property">
                <label>Derivative (Kd):</label>
                <input type="number" id="prop-kd" value="${node.properties.kd}" min="0" max="1" step="0.001">
            </div>
            <div class="property">
                <label>Output Limits:</label>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label>Min:</label>
                        <input type="number" id="prop-outputMin" value="${node.properties.outputMin}">
                    </div>
                    <div style="flex: 1;">
                        <label>Max:</label>
                        <input type="number" id="prop-outputMax" value="${node.properties.outputMax}">
                    </div>
                </div>
            </div>
            <div class="property">
                <button id="reset-pid" type="button" style="width: 100%; padding: 8px; background-color: #E67E22; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-undo"></i> Reset PID
                </button>
            </div>
        `;
    },
    
    // Update chart node properties
    updateChartProperties(node) {
        const timeWindowField = document.getElementById("prop-timeWindow");
        const autoScaleField = document.getElementById("prop-autoScale");
        const minYField = document.getElementById("prop-minY");
        const maxYField = document.getElementById("prop-maxY");
        const showGridField = document.getElementById("prop-showGrid");
        
        if (timeWindowField) node.properties.timeWindow = parseInt(timeWindowField.value);
        if (autoScaleField) node.properties.autoScale = autoScaleField.checked;
        if (minYField) node.properties.minY = parseFloat(minYField.value);
        if (maxYField) node.properties.maxY = parseFloat(maxYField.value);
        if (showGridField) node.properties.showGrid = showGridField.checked;
    },
    
    // Update LED properties
    updateLedProperties(node) {
        const ledSizeField = document.getElementById("prop-ledSize");
        if (ledSizeField) node.properties.ledSize = ledSizeField.value;
        // Note: State configuration is more complex and would need a dedicated UI
    },
    
    // Update statistics properties
    updateStatisticsProperties(node) {
        const windowSizeField = document.getElementById("prop-windowSize");
        const resetOnStartField = document.getElementById("prop-resetOnStart");
        
        if (windowSizeField) node.properties.windowSize = parseInt(windowSizeField.value);
        if (resetOnStartField) node.properties.resetOnStart = resetOnStartField.checked;
    },
    
    // Update PID properties
    updatePidProperties(node) {
        const kpField = document.getElementById("prop-kp");
        const kiField = document.getElementById("prop-ki");
        const kdField = document.getElementById("prop-kd");
        const outputMinField = document.getElementById("prop-outputMin");
        const outputMaxField = document.getElementById("prop-outputMax");
        
        if (kpField) node.properties.kp = parseFloat(kpField.value);
        if (kiField) node.properties.ki = parseFloat(kiField.value);
        if (kdField) node.properties.kd = parseFloat(kdField.value);
        if (outputMinField) node.properties.outputMin = parseFloat(outputMinField.value);
        if (outputMaxField) node.properties.outputMax = parseFloat(outputMaxField.value);
    },
    
    // Logic gate node properties (simple - only name)
    generateLogicGateProperties(node) {
        return `
            <div class="property">
                <p>This logic gate has no additional configuration options.</p>
            </div>
        `;
    },
    
    // Update logic gate properties
    updateLogicGateProperties(node) {
        // Logic gates only have name property which is handled by common update
    },
    
    // Button node properties
    generateButtonProperties(node) {
        return `
            <div class="property">
                <label>Button Text:</label>
                <input type="text" id="prop-buttonText" value="${node.properties.buttonText}" placeholder="Button text">
            </div>
        `;
    },
    
    // Switch node properties
    generateSwitchProperties(node) {
        return `
            <div class="property">
                <label>Switch Text:</label>
                <input type="text" id="prop-switchText" value="${node.properties.switchText}" placeholder="Switch text">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-defaultState" ${node.properties.defaultState ? "checked" : ""}>
                    <label for="prop-defaultState" style="display: inline; font-weight: normal;">Default State (On)</label>
                </div>
            </div>
        `;
    },
    
    // Slider node properties
    generateSliderProperties(node) {
        return `
            <div class="property">
                <label>Slider Text:</label>
                <input type="text" id="prop-sliderText" value="${node.properties.sliderText}" placeholder="Slider text">
            </div>
            <div class="property">
                <label>Range:</label>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label>Min:</label>
                        <input type="number" id="prop-minValue" value="${node.properties.minValue}">
                    </div>
                    <div style="flex: 1;">
                        <label>Max:</label>
                        <input type="number" id="prop-maxValue" value="${node.properties.maxValue}">
                    </div>
                </div>
            </div>
            <div class="property">
                <label>Step:</label>
                <input type="number" id="prop-step" value="${node.properties.step}" min="0.01" step="0.01">
            </div>
            <div class="property">
                <label>Default Value:</label>
                <input type="number" id="prop-defaultValue" value="${node.properties.defaultValue}">
            </div>
        `;
    },
    
    // Update button properties
    updateButtonProperties(node) {
        const buttonTextField = document.getElementById("prop-buttonText");
        if (buttonTextField) {
            node.properties.buttonText = buttonTextField.value;
            if (node.onPropertyChanged) {
                node.onPropertyChanged('buttonText', buttonTextField.value);
            }
        }
    },
    
    // Update switch properties
    updateSwitchProperties(node) {
        const switchTextField = document.getElementById("prop-switchText");
        const defaultStateField = document.getElementById("prop-defaultState");
        
        if (switchTextField) {
            node.properties.switchText = switchTextField.value;
            if (node.onPropertyChanged) {
                node.onPropertyChanged('switchText', switchTextField.value);
            }
        }
        if (defaultStateField) {
            node.properties.defaultState = defaultStateField.checked;
            if (node.onPropertyChanged) {
                node.onPropertyChanged('defaultState', defaultStateField.checked);
            }
        }
    },
    
    // Update slider properties
    updateSliderProperties(node) {
        const sliderTextField = document.getElementById("prop-sliderText");
        const minValueField = document.getElementById("prop-minValue");
        const maxValueField = document.getElementById("prop-maxValue");
        const stepField = document.getElementById("prop-step");
        const defaultValueField = document.getElementById("prop-defaultValue");
        
        if (sliderTextField) {
            node.properties.sliderText = sliderTextField.value;
            if (node.onPropertyChanged) {
                node.onPropertyChanged('sliderText', sliderTextField.value);
            }
        }
        if (minValueField) {
            node.properties.minValue = parseFloat(minValueField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('minValue', parseFloat(minValueField.value));
            }
        }
        if (maxValueField) {
            node.properties.maxValue = parseFloat(maxValueField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('maxValue', parseFloat(maxValueField.value));
            }
        }
        if (stepField) {
            node.properties.step = parseFloat(stepField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('step', parseFloat(stepField.value));
            }
        }
        if (defaultValueField) {
            node.properties.defaultValue = parseFloat(defaultValueField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('defaultValue', parseFloat(defaultValueField.value));
            }
        }
    },
    
    // FFT node properties
    generateFFTProperties(node) {
        return `
            <div class="property">
                <label>FFT Size:</label>
                <select id="prop-fftSize">
                    <option value="64" ${node.properties.fftSize === 64 ? "selected" : ""}>64</option>
                    <option value="128" ${node.properties.fftSize === 128 ? "selected" : ""}>128</option>
                    <option value="256" ${node.properties.fftSize === 256 ? "selected" : ""}>256</option>
                    <option value="512" ${node.properties.fftSize === 512 ? "selected" : ""}>512</option>
                    <option value="1024" ${node.properties.fftSize === 1024 ? "selected" : ""}>1024</option>
                    <option value="2048" ${node.properties.fftSize === 2048 ? "selected" : ""}>2048</option>
                </select>
            </div>
            <div class="property">
                <label>Window Type:</label>
                <select id="prop-windowType">
                    <option value="rectangular" ${node.properties.windowType === "rectangular" ? "selected" : ""}>Rectangular</option>
                    <option value="hann" ${node.properties.windowType === "hann" ? "selected" : ""}>Hann</option>
                    <option value="hamming" ${node.properties.windowType === "hamming" ? "selected" : ""}>Hamming</option>
                    <option value="blackman" ${node.properties.windowType === "blackman" ? "selected" : ""}>Blackman</option>
                </select>
            </div>
            <div class="property">
                <label>Sample Rate (Hz):</label>
                <input type="number" id="prop-sampleRate" value="${node.properties.sampleRate}" min="1" max="1000">
                <small>Rate at which input samples are collected</small>
            </div>
            <div class="property">
                <label>Overlap:</label>
                <input type="number" id="prop-overlap" value="${node.properties.overlap}" min="0" max="0.9" step="0.1">
                <small>Overlap between successive FFT windows (0-0.9)</small>
            </div>
            <div class="property">
                <label>Output Mode:</label>
                <select id="prop-outputMode">
                    <option value="peak" ${node.properties.outputMode === "peak" ? "selected" : ""}>Peak Detection</option>
                    <option value="spectrum" ${node.properties.outputMode === "spectrum" ? "selected" : ""}>Full Spectrum</option>
                </select>
            </div>
        `;
    },
    
    // Update FFT properties
    updateFFTProperties(node) {
        const fftSizeField = document.getElementById("prop-fftSize");
        const windowTypeField = document.getElementById("prop-windowType");
        const sampleRateField = document.getElementById("prop-sampleRate");
        const overlapField = document.getElementById("prop-overlap");
        const outputModeField = document.getElementById("prop-outputMode");
        
        if (fftSizeField) {
            node.properties.fftSize = parseInt(fftSizeField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('fftSize', parseInt(fftSizeField.value));
            }
        }
        if (windowTypeField) {
            node.properties.windowType = windowTypeField.value;
            if (node.onPropertyChanged) {
                node.onPropertyChanged('windowType', windowTypeField.value);
            }
        }
        if (sampleRateField) {
            node.properties.sampleRate = parseFloat(sampleRateField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('sampleRate', parseFloat(sampleRateField.value));
            }
        }
        if (overlapField) {
            node.properties.overlap = parseFloat(overlapField.value);
            if (node.onPropertyChanged) {
                node.onPropertyChanged('overlap', parseFloat(overlapField.value));
            }
        }
        if (outputModeField) {
            node.properties.outputMode = outputModeField.value;
            if (node.onPropertyChanged) {
                node.onPropertyChanged('outputMode', outputModeField.value);
            }
        }
    },
    
    // Reset PID controller
    resetPidController(node) {
        if (node.constructor.name === 'PidControllerNode') {
            node.lastError = 0;
            node.integral = 0;
            node.output = 0;
            node.lastTime = null;
            
            // Show confirmation
            const button = document.getElementById("reset-pid");
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Reset!';
                button.style.backgroundColor = '#27AE60';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '#E67E22';
                }, 1000);
            }
        }
    },
    
    // Show update confirmation
    showUpdateConfirmation() {
        const button = document.getElementById("update-properties");
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Gespeichert!';
            button.style.backgroundColor = '#27AE60';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.backgroundColor = '';
            }, 1500);
        }
    }
};

// Make PropertyPanel available globally
window.PropertyPanel = PropertyPanel;

// Create global showNodeProperties function for backward compatibility
window.showNodeProperties = function(node) {
    PropertyPanel.show(node);
};