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
            'SensorNode': { cssClass: 'sensor-properties', icon: 'fa-thermometer-half' },
            'DisplayNode': { cssClass: 'display-properties', icon: 'fa-chart-line' },
            'ConstantNode': { cssClass: 'constant-properties', icon: 'fa-hashtag' },
            'GaugeNode': { cssClass: 'gauge-properties', icon: 'fa-tachometer-alt' },
            // Add other node types as needed
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