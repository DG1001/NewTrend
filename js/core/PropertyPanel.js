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