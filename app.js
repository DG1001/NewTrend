// Globale Variablen
let graph = null;
let canvas = null;
let simulationInterval = null;
let simulationRunning = false;
let simulationStartTime = null;

// Sensor-Daten simulieren
const simulateSensorData = {
    temperature: () => 20 + Math.random() * 10,
    humidity: () => 40 + Math.random() * 30,
    pressure: () => 1000 + Math.random() * 20,
    flow: () => Math.random() * 100,
    custom: (min, max) => min + Math.random() * (max - min)
};

// Beim Laden der Seite initialisieren
window.onload = function() {
    initGraph();
    setupEventListeners();
};

// Graph initialisieren
function initGraph() {
    // Canvas Element holen
    canvas = document.getElementById("graph-canvas");
    
    // Graph erstellen
    graph = new LiteGraph.LGraph();
    
    // Canvas mit Graph verbinden
    canvas = new LiteGraph.LGraphCanvas(canvas, graph);
    
    // Canvas an Container anpassen
    resizeCanvas();
    
    // Eigene Knoten registrieren
    registerCustomNodes();
    
    // Graph starten
    graph.start();
    
    // Kontinuierliche Aktualisierung aktivieren (unabhängig von Mausbewegung)
    graph.onBeforeStep = function() {
        graph.setDirtyCanvas(true);
    };
    
    // Override the canvas selection to trigger our properties panel
    const originalSelectNode = canvas.selectNode;
    canvas.selectNode = function(node) {
        const result = originalSelectNode.call(this, node);
        if (node) {
            showNodeProperties(node);
        } else {
            showNodeProperties(null);
        }
        return result;
    };
    
    // Completely disable LiteGraph's default property panel
    canvas.allow_interaction = true;
    canvas.allow_dragcanvas = true;
    canvas.allow_dragnodes = true;
    canvas.allow_reconnect_links = true;
    
    // Override the context menu to prevent default properties from showing
    const originalGetCanvasMenuOptions = canvas.getCanvasMenuOptions;
    canvas.getCanvasMenuOptions = function() {
        const options = originalGetCanvasMenuOptions ? originalGetCanvasMenuOptions.call(this) : [];
        // Remove any "Properties" options from the canvas menu
        return options.filter(option => !option || option.content !== "Properties");
    };
    
    // Override node context menu to redirect properties to our panel
    const originalGetNodeMenuOptions = canvas.getNodeMenuOptions;
    canvas.getNodeMenuOptions = function(node) {
        return [
            {
                content: "Properties",
                callback: () => {
                    canvas.selectNode(node);
                    showNodeProperties(node);
                }
            },
            null,
            {
                content: "Clone",
                callback: () => {
                    const cloned = LiteGraph.createNode(node.constructor.type || node.type);
                    if (cloned) {
                        cloned.pos = [node.pos[0] + 30, node.pos[1] + 30];
                        for (let i in node.properties) {
                            cloned.properties[i] = node.properties[i];
                        }
                        graph.add(cloned);
                    }
                }
            },
            {
                content: "Remove",
                callback: () => {
                    graph.remove(node);
                }
            }
        ];
    };
    
    // Disable LiteGraph's automatic property panel creation completely
    const originalShowNodePanel = canvas.showNodePanel;
    canvas.showNodePanel = function(node) {
        // Instead of showing the default panel, use our custom one
        if (node) {
            this.selectNode(node);
            showNodeProperties(node);
        }
        return false; // Prevent default behavior
    };
    
    // Override processContextMenu to prevent default property panels
    const originalProcessContextMenu = canvas.processContextMenu;
    canvas.processContextMenu = function(node, event) {
        if (node) {
            // Show our custom context menu
            const menu_options = this.getNodeMenuOptions(node);
            if (menu_options) {
                const menu = new LiteGraph.ContextMenu(menu_options, {
                    event: event,
                    callback: null,
                    parentMenu: null,
                    ignore_item_callbacks: false,
                    title: node.constructor.title || "Node"
                });
                return false;
            }
        }
        // For canvas context menu, use default behavior
        return originalProcessContextMenu ? originalProcessContextMenu.call(this, node, event) : true;
    };
}

// Event-Listener einrichten
function setupEventListeners() {
    // Buttons mit Funktionen verbinden
    document.getElementById("add-sensor").addEventListener("click", addSensorNode);
    document.getElementById("add-display").addEventListener("click", addDisplayNode);
    document.getElementById("add-formula").addEventListener("click", addFormulaNode);
    document.getElementById("add-alarm").addEventListener("click", addAlarmNode);
    document.getElementById("start-sim").addEventListener("click", startSimulation);
    document.getElementById("stop-sim").addEventListener("click", stopSimulation);
    
    // Canvas-Größe anpassen, wenn Fenster-Größe sich ändert
    window.addEventListener("resize", resizeCanvas);
    
    // Eigenschaften anzeigen, wenn Knoten ausgewählt wird
    graph.onNodeSelected = showNodeProperties;
}

// Canvas-Größe an Container anpassen
function resizeCanvas() {
    const container = document.getElementById("canvas-container");
    canvas.resize(container.clientWidth, container.clientHeight);
}

// Helper-Funktion für Operationssymbole
function getOperationSymbol(operation) {
    switch(operation) {
        case "add": return "+";
        case "subtract": return "−";
        case "multiply": return "×";
        case "divide": return "÷";
        default: return "+";
    }
}

// Eigene Knoten für Trendows registrieren
function registerCustomNodes() {
    // Sensor-Knoten
    class SensorNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Sensor";
            this.addOutput("Wert", "number");
            this.properties = { 
                type: "temperature", 
                min: 0, 
                max: 100,
                unit: "°C",
                name: "Sensor 1",
                useCustomRange: false
            };
            this.size = [180, 60];
            this.color = "#2E86C1";
        }
        
        
        onExecute() {
            let value = 0;
            // Nur neue Werte generieren, wenn die Simulation läuft
            if (simulationRunning) {
                if (this.properties.type === "custom" || this.properties.useCustomRange) {
                    value = simulateSensorData.custom(this.properties.min, this.properties.max);
                } else {
                    value = simulateSensorData[this.properties.type]();
                }
            }
            this.setOutputData(0, value);
        }
    }
    LiteGraph.registerNodeType("trendows/sensor", SensorNode);
    
    // Anzeige-Knoten
    class DisplayNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Anzeige";
            this.addInput("Wert", "number");
            this.properties = { 
                precision: 2,
                showGraph: true,
                name: "Anzeige 1"
            };
            this.size = [180, 80];
            this.color = "#27AE60";
            this.currentValue = 0;
            this.values = new Array(50).fill(0);
        }
        
        onExecute() {
            const value = this.getInputData(0);
            if (value !== undefined) {
                this.currentValue = value;
                // Nur den Graphen aktualisieren, wenn die Simulation läuft
                if (simulationRunning) {
                    this.values.push(value);
                    this.values.shift();
                }
            }
        }
        
        onDrawForeground(ctx) {
            if (this.currentValue !== undefined) {
                ctx.font = "20px Arial";
                ctx.fillStyle = "#000";
                ctx.textAlign = "center";
                ctx.fillText(this.currentValue.toFixed(this.properties.precision), this.size[0] * 0.5, 45);
                
                if (this.properties.showGraph && this.inputs[0] && this.inputs[0].link !== null) {
                    ctx.strokeStyle = "#AAA";
                    ctx.beginPath();
                    const margin = 10;
                    const graphHeight = 30;
                    const graphY = this.size[1] - margin;
                    
                    // Finde Min und Max für Skalierung
                    const min = Math.min(...this.values);
                    const max = Math.max(...this.values);
                    const range = max - min || 1;
                    
                    // Zeichne Graph
                    for (let i = 0; i < this.values.length - 1; i++) {
                        const x1 = margin + (i / (this.values.length - 1)) * (this.size[0] - margin * 2);
                        const y1 = graphY - ((this.values[i] - min) / range) * graphHeight;
                        const x2 = margin + ((i + 1) / (this.values.length - 1)) * (this.size[0] - margin * 2);
                        const y2 = graphY - ((this.values[i + 1] - min) / range) * graphHeight;
                        
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                    }
                    ctx.stroke();
                }
            }
        }
    }
    LiteGraph.registerNodeType("trendows/display", DisplayNode);
    
    // Formel-Knoten
    class FormulaNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Formel";
            this.addInput("A", "number");
            this.addInput("B", "number");
            this.addOutput("Ergebnis", "number");
            this.properties = { 
                operation: "add", // add, subtract, multiply, divide
                customFormula: "",
                useCustomFormula: false,
                name: "Formel 1"
            };
            this.size = [180, 90];
            this.color = "#9B59B6";
            
        }
        
        
        onExecute() {
            const a = this.getInputData(0) || 0;
            const b = this.getInputData(1) || 0;
            let result = 0;
            
            // Nur berechnen, wenn die Simulation läuft
            if (simulationRunning) {
                if (this.properties.useCustomFormula && this.properties.customFormula) {
                    try {
                        // Create a safe evaluation context with only the inputs
                        const evalFn = new Function('a', 'b', 'return ' + this.properties.customFormula);
                        result = evalFn(a, b);
                        
                        // Check if result is valid
                        if (isNaN(result) || !isFinite(result)) {
                            result = 0;
                        }
                    } catch (error) {
                        console.error("Formula error:", error);
                        result = 0;
                    }
                } else {
                    switch(this.properties.operation) {
                        case "add":
                            result = a + b;
                            break;
                        case "subtract":
                            result = a - b;
                            break;
                        case "multiply":
                            result = a * b;
                            break;
                        case "divide":
                            result = b !== 0 ? a / b : 0;
                            break;
                    }
                }
            }
            
            this.setOutputData(0, result);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            
            if (this.properties.useCustomFormula && this.properties.customFormula) {
                // Show a small preview of the custom formula
                const formula = this.properties.customFormula.length > 10 ? 
                    this.properties.customFormula.substring(0, 10) + "..." : 
                    this.properties.customFormula;
                ctx.fillText(formula, this.size[0] * 0.5, 55);
            } else {
                let symbol = "+";
                switch(this.properties.operation) {
                    case "subtract": symbol = "-"; break;
                    case "multiply": symbol = "×"; break;
                    case "divide": symbol = "÷"; break;
                }
                
                ctx.fillText(symbol, this.size[0] * 0.5, 55);
            }
        }
    }
    LiteGraph.registerNodeType("trendows/formula", FormulaNode);
    
    // Alarm-Knoten
    class AlarmNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Alarm";
            this.addInput("Wert", "number");
            this.addOutput("Alarm", "boolean");
            this.properties = { 
                threshold: 50,
                condition: "greater", // greater, less
                name: "Alarm 1"
            };
            this.size = [180, 60];
            this.color = "#E74C3C";
            this.alarm = false;
        }
        
        onExecute() {
            const value = this.getInputData(0);
            if (value !== undefined) {
                // Nur Alarm-Status aktualisieren, wenn die Simulation läuft
                if (simulationRunning) {
                    if (this.properties.condition === "greater") {
                        this.alarm = value > this.properties.threshold;
                    } else {
                        this.alarm = value < this.properties.threshold;
                    }
                }
                this.setOutputData(0, this.alarm);
            }
        }
        
        onDrawForeground(ctx) {
            if (this.alarm) {
                ctx.fillStyle = "#FF0000";
                ctx.beginPath();
                ctx.arc(this.size[0] - 20, 20, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    LiteGraph.registerNodeType("trendows/alarm", AlarmNode);
}

// Knoten zum Graph hinzufügen
function addSensorNode() {
    const node = LiteGraph.createNode("trendows/sensor");
    node.pos = [100 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-sensor");
}

function addDisplayNode() {
    const node = LiteGraph.createNode("trendows/display");
    node.pos = [500 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-display");
}

function addFormulaNode() {
    const node = LiteGraph.createNode("trendows/formula");
    node.pos = [300 + Math.random() * 300, 300 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-formula");
}

function addAlarmNode() {
    const node = LiteGraph.createNode("trendows/alarm");
    node.pos = [500 + Math.random() * 300, 300 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-alarm");
}

// Visuelles Feedback für Buttons
function flashToolbarButton(buttonId) {
    const button = document.getElementById(buttonId);
    const originalColor = button.style.backgroundColor;
    
    button.style.backgroundColor = "#27AE60";
    button.style.transform = "scale(1.1)";
    
    setTimeout(() => {
        button.style.backgroundColor = originalColor;
        button.style.transform = "";
    }, 300);
}

// Eigenschaften eines Knotens anzeigen
function showNodeProperties(node) {
    // Verwende das vorgesehene Panel am rechten Rand
    const propertiesPanel = document.getElementById("properties-panel") || document.getElementById("node-properties");
    
    if (!node) {
        propertiesPanel.innerHTML = `
            <div class="empty-properties">
                <i class="fas fa-info-circle" style="font-size: 24px; color: #0078d7; margin-bottom: 10px;"></i>
                <p>Wählen Sie ein Element aus, um dessen Eigenschaften zu bearbeiten.</p>
            </div>
        `;
        return;
    }
    
    // Bestimme die CSS-Klasse basierend auf dem Knotentyp
    let nodeTypeClass = "";
    let nodeIcon = "";
    
    if (node.constructor.name === "SensorNode") {
        nodeTypeClass = "sensor-properties";
        nodeIcon = "fa-thermometer-half";
    } else if (node.constructor.name === "DisplayNode") {
        nodeTypeClass = "display-properties";
        nodeIcon = "fa-chart-line";
    } else if (node.constructor.name === "FormulaNode") {
        nodeTypeClass = "formula-properties";
        nodeIcon = "fa-calculator";
    } else if (node.constructor.name === "AlarmNode") {
        nodeTypeClass = "alarm-properties";
        nodeIcon = "fa-bell";
    }
    
    let html = `
        <div class="${nodeTypeClass}">
            <h4><i class="fas ${nodeIcon}"></i> ${node.title}: ${node.properties.name || ""}</h4>
            
            <div class="property">
                <label>Name:</label>
                <input type="text" id="prop-name" value="${node.properties.name || ""}" placeholder="Geben Sie einen Namen ein">
            </div>
    `;
    
    // Spezifische Eigenschaften je nach Knotentyp
    if (node.constructor.name === "SensorNode") {
        html += `
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
    } else if (node.constructor.name === "DisplayNode") {
        html += `
            <div class="property">
                <label>Nachkommastellen:</label>
                <input type="number" id="prop-precision" value="${node.properties.precision}" min="0" max="10">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-showGraph" ${node.properties.showGraph ? "checked" : ""}>
                    <label for="prop-showGraph" style="display: inline; font-weight: normal;">Graph anzeigen</label>
                </div>
            </div>
        `;
    } else if (node.constructor.name === "FormulaNode") {
        html += `
            <div class="property">
                <label>Formel-Modus:</label>
                <div class="formula-mode-selector">
                    <button type="button" class="formula-mode-btn ${!node.properties.useCustomFormula ? 'active' : ''}" data-mode="standard">
                        <i class="fas fa-calculator"></i> Standard
                    </button>
                    <button type="button" class="formula-mode-btn ${node.properties.useCustomFormula ? 'active' : ''}" data-mode="custom">
                        <i class="fas fa-code"></i> Erweitert
                    </button>
                </div>
            </div>
            
            <div class="property formula-editor ${!node.properties.useCustomFormula ? 'active' : ''}" id="standard-operations" ${node.properties.useCustomFormula ? 'style="display:none;"' : ''}>
                <label>Wählen Sie eine Operation:</label>
                <div class="operation-grid">
                    <div class="operation-option ${node.properties.operation === "add" ? 'selected' : ''}" data-operation="add">
                        <div class="operation-symbol">+</div>
                        <div class="operation-name">Addition</div>
                    </div>
                    <div class="operation-option ${node.properties.operation === "subtract" ? 'selected' : ''}" data-operation="subtract">
                        <div class="operation-symbol">−</div>
                        <div class="operation-name">Subtraktion</div>
                    </div>
                    <div class="operation-option ${node.properties.operation === "multiply" ? 'selected' : ''}" data-operation="multiply">
                        <div class="operation-symbol">×</div>
                        <div class="operation-name">Multiplikation</div>
                    </div>
                    <div class="operation-option ${node.properties.operation === "divide" ? 'selected' : ''}" data-operation="divide">
                        <div class="operation-symbol">÷</div>
                        <div class="operation-name">Division</div>
                    </div>
                </div>
                <div class="formula-preview" id="operation-preview">
                    A ${getOperationSymbol(node.properties.operation)} B
                </div>
            </div>
            
            <div class="property formula-editor ${node.properties.useCustomFormula ? 'active' : ''}" id="custom-formula" ${!node.properties.useCustomFormula ? 'style="display:none;"' : ''}>
                <label>Benutzerdefinierte Formel:</label>
                <textarea id="prop-customFormula" class="formula-input" placeholder="z.B.: a * b + 10">${node.properties.customFormula || ''}</textarea>
                <div class="formula-validation" id="formula-validation"></div>
                <div class="formula-examples">
                    <div class="formula-examples-title">💡 Beispiele und Funktionen:</div>
                    • Grundoperationen: <code>a + b</code>, <code>a * b</code>, <code>a - b</code>, <code>a / b</code><br>
                    • Mathematik: <code>Math.sqrt(a)</code>, <code>Math.sin(a)</code>, <code>Math.pow(a, 2)</code><br>
                    • Bedingt: <code>a > b ? a : b</code> (Maximum)<br>
                    • Konstanten: <code>Math.PI</code>, <code>Math.E</code><br>
                    • Komplex: <code>(a + b) * Math.sqrt(a * b)</code>
                </div>
            </div>
        `;
    } else if (node.constructor.name === "AlarmNode") {
        html += `
            <div class="property">
                <label>Schwellwert: <span id="threshold-display">${node.properties.threshold}</span></label>
                <input type="range" id="prop-threshold" class="threshold-slider" 
                       value="${node.properties.threshold}" min="0" max="100" step="1">
                <div class="threshold-value">
                    <span id="threshold-value-display">${node.properties.threshold}</span>
                    <i class="fas fa-bell" style="color: #E74C3C; margin-left: 5px;"></i>
                </div>
            </div>
            <div class="property">
                <label>Bedingung:</label>
                <select id="prop-condition">
                    <option value="greater" ${node.properties.condition === "greater" ? "selected" : ""}>Größer als (>)</option>
                    <option value="less" ${node.properties.condition === "less" ? "selected" : ""}>Kleiner als (<)</option>
                </select>
            </div>
            <div class="property" style="text-align: center;">
                <div style="margin: 10px 0; padding: 10px; background-color: #f8d7da; border-radius: 4px; border-left: 4px solid #E74C3C;">
                    <i class="fas fa-exclamation-triangle" style="color: #E74C3C;"></i>
                    <span style="margin-left: 5px;">Alarm wird ausgelöst, wenn der Wert 
                    <strong>${node.properties.condition === "greater" ? "größer als" : "kleiner als"} ${node.properties.threshold}</strong> ist.</span>
                </div>
            </div>
        `;
    }
    
    html += `
            <button id="update-properties">
                <i class="fas fa-save"></i> Aktualisieren
            </button>
        </div>
    `;
    
    propertiesPanel.innerHTML = html;
    
    // Zusätzliche Event-Listener für spezielle Elemente
    if (node.constructor.name === "FormulaNode") {
        // Event-Listener für die Formel-Modus-Buttons
        const modeButtons = document.querySelectorAll(".formula-mode-btn");
        const standardOperations = document.getElementById("standard-operations");
        const customFormula = document.getElementById("custom-formula");
        const operationOptions = document.querySelectorAll(".operation-option");
        const operationPreview = document.getElementById("operation-preview");
        const customFormulaInput = document.getElementById("prop-customFormula");
        const formulaValidation = document.getElementById("formula-validation");
        
        // Mode-Button Event-Listener
        modeButtons.forEach(button => {
            button.addEventListener("click", function() {
                const mode = this.dataset.mode;
                const isCustom = mode === "custom";
                
                // Update button states
                modeButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
                
                // Update panel visibility and state
                if (isCustom) {
                    standardOperations.style.display = "none";
                    customFormula.style.display = "block";
                    customFormula.classList.add("active");
                    standardOperations.classList.remove("active");
                } else {
                    standardOperations.style.display = "block";
                    customFormula.style.display = "none";
                    standardOperations.classList.add("active");
                    customFormula.classList.remove("active");
                }
                
                // Update node properties immediately
                node.properties.useCustomFormula = isCustom;
                graph.setDirtyCanvas(true);
                
                // Visual feedback for update
                showUpdateFeedback();
            });
        });
        
        // Operation-Button Event-Listener
        operationOptions.forEach(option => {
            option.addEventListener("click", function() {
                const operation = this.dataset.operation;
                
                // Update selection state
                operationOptions.forEach(opt => opt.classList.remove("selected"));
                this.classList.add("selected");
                
                // Update preview
                operationPreview.textContent = `A ${getOperationSymbol(operation)} B`;
                
                // Update node properties immediately
                node.properties.operation = operation;
                graph.setDirtyCanvas(true);
                
                // Visual feedback for update
                showUpdateFeedback();
            });
        });
        
        // Helper function for visual update feedback
        function showUpdateFeedback() {
            const formulaEditors = document.querySelectorAll(".formula-editor");
            formulaEditors.forEach(editor => {
                editor.classList.add("updating");
                setTimeout(() => {
                    editor.classList.remove("updating");
                }, 500);
            });
        }
        
        // Custom formula validation and live updates
        if (customFormulaInput) {
            function validateFormula(formula) {
                if (!formula.trim()) {
                    return { valid: true, message: "" };
                }
                
                try {
                    // Test the formula with sample values
                    const testFn = new Function('a', 'b', 'return ' + formula);
                    const result = testFn(10, 5);
                    
                    if (isNaN(result) || !isFinite(result)) {
                        return { valid: false, message: "Formel gibt ungültigen Wert zurück" };
                    }
                    
                    return { valid: true, message: `✓ Gültige Formel (Beispiel: 10, 5 → ${result})` };
                } catch (error) {
                    return { valid: false, message: `Syntaxfehler: ${error.message}` };
                }
            }
            
            function updateValidation() {
                const formula = customFormulaInput.value;
                const validation = validateFormula(formula);
                
                // Update input styling
                customFormulaInput.classList.remove("error");
                if (!validation.valid && formula.trim()) {
                    customFormulaInput.classList.add("error");
                }
                
                // Update validation message
                formulaValidation.className = "formula-validation";
                if (validation.message) {
                    formulaValidation.className += validation.valid ? " success" : " error";
                    formulaValidation.textContent = validation.message;
                } else {
                    formulaValidation.style.display = "none";
                }
                
                // Update node properties
                node.properties.customFormula = formula;
                graph.setDirtyCanvas(true);
            }
            
            // Live validation as user types
            customFormulaInput.addEventListener("input", updateValidation);
            customFormulaInput.addEventListener("blur", updateValidation);
            
            // Initial validation
            updateValidation();
        }
    } else if (node.constructor.name === "AlarmNode") {
        // Event-Listener für den Schwellwert-Slider
        const thresholdSlider = document.getElementById("prop-threshold");
        const thresholdDisplay = document.getElementById("threshold-value-display");
        const conditionSelect = document.getElementById("prop-condition");
        
        if (thresholdSlider && thresholdDisplay) {
            thresholdSlider.addEventListener("input", function() {
                thresholdDisplay.textContent = this.value;
            });
        }
        
        // Aktualisiere die Alarmbedingungsanzeige, wenn sich die Bedingung ändert
        if (conditionSelect) {
            const alarmDescription = conditionSelect.parentElement.nextElementSibling.querySelector("span");
            
            conditionSelect.addEventListener("change", function() {
                const condition = this.value === "greater" ? "größer als" : "kleiner als";
                const threshold = thresholdSlider.value;
                alarmDescription.innerHTML = `Alarm wird ausgelöst, wenn der Wert <strong>${condition} ${threshold}</strong> ist.`;
            });
            
            // Aktualisiere auch die Beschreibung, wenn sich der Schwellwert ändert
            if (thresholdSlider && alarmDescription) {
                thresholdSlider.addEventListener("input", function() {
                    const condition = conditionSelect.value === "greater" ? "größer als" : "kleiner als";
                    alarmDescription.innerHTML = `Alarm wird ausgelöst, wenn der Wert <strong>${condition} ${this.value}</strong> ist.`;
                });
            }
        }
    }
    
    // Event-Listener für Aktualisieren-Button
    document.getElementById("update-properties").addEventListener("click", function() {
        // Allgemeine Eigenschaften
        node.properties.name = document.getElementById("prop-name").value;
        
        // Spezifische Eigenschaften
        if (node.constructor.name === "SensorNode") {
            node.properties.type = document.getElementById("prop-type").value;
            node.properties.unit = document.getElementById("prop-unit").value;
            node.properties.useCustomRange = document.getElementById("prop-useCustomRange").checked;
            node.properties.min = parseFloat(document.getElementById("prop-min").value);
            node.properties.max = parseFloat(document.getElementById("prop-max").value);
        } else if (node.constructor.name === "DisplayNode") {
            node.properties.precision = parseInt(document.getElementById("prop-precision").value);
            node.properties.showGraph = document.getElementById("prop-showGraph").checked;
        } else if (node.constructor.name === "FormulaNode") {
            // Properties are already updated in real-time, but we'll refresh them here for confirmation
            const customFormulaInput = document.getElementById("prop-customFormula");
            const selectedOperation = document.querySelector(".operation-option.selected");
            
            if (customFormulaInput && node.properties.useCustomFormula) {
                node.properties.customFormula = customFormulaInput.value;
            } else if (selectedOperation) {
                node.properties.operation = selectedOperation.dataset.operation;
            }
        } else if (node.constructor.name === "AlarmNode") {
            node.properties.threshold = parseFloat(document.getElementById("prop-threshold").value);
            node.properties.condition = document.getElementById("prop-condition").value;
        }
        
        // Bestätigungsnachricht anzeigen
        const button = this;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Gespeichert!';
        button.style.backgroundColor = '#27AE60';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
        }, 1500);
        
        // Graph aktualisieren
        graph.setDirtyCanvas(true);
    });
}

/**
 * Startet die Simulation der Sensordaten
 * 
 * Diese Funktion:
 * 1. Erstellt einen Timer, der regelmäßig graph.runStep() aufruft
 * 2. Aktualisiert die UI, um den aktiven Zustand anzuzeigen
 * 3. Generiert Sensordaten basierend auf den Konfigurationen der Sensorknoten
 */
function startSimulation() {
    if (!simulationRunning) {
        // Erstelle einen Timer, der alle 100ms die Graphberechnung ausführt
        simulationInterval = setInterval(function() {
            graph.runStep();
            
            // Erzwinge Neuzeichnen des Canvas
            graph.setDirtyCanvas(true);
            
            // Aktualisiere die Anzeige der Simulationszeit
            updateSimulationTime();
        }, 100);
        
        simulationRunning = true;
        
        // UI-Feedback
        const startButton = document.getElementById("start-sim");
        const stopButton = document.getElementById("stop-sim");
        
        startButton.style.backgroundColor = "#27AE60";
        startButton.innerHTML = '<i class="fas fa-play"></i> Simulation läuft...';
        stopButton.style.backgroundColor = "#E74C3C";
        
        // Visuelles Feedback
        flashToolbarButton("start-sim");
        
        // Zeige Simulationsinfo an
        showSimulationInfo(true);
        
        console.log("Simulation gestartet - Sensordaten werden generiert");
    }
}

/**
 * Stoppt die laufende Simulation
 * 
 * Diese Funktion:
 * 1. Beendet den Timer für die Datengenerierung
 * 2. Aktualisiert die UI, um den inaktiven Zustand anzuzeigen
 */
function stopSimulation() {
    if (simulationRunning) {
        // Beende den Timer
        clearInterval(simulationInterval);
        simulationRunning = false;
        
        // UI-Feedback
        const startButton = document.getElementById("start-sim");
        const stopButton = document.getElementById("stop-sim");
        
        startButton.style.backgroundColor = "";
        startButton.innerHTML = '<i class="fas fa-play"></i> Simulation starten';
        stopButton.style.backgroundColor = "";
        
        // Visuelles Feedback
        flashToolbarButton("stop-sim");
        
        // Verstecke Simulationsinfo
        showSimulationInfo(false);
        
        console.log("Simulation gestoppt");
    }
}

/**
 * Zeigt oder versteckt die Simulationsinformationen
 */
function showSimulationInfo(show) {
    // Erstelle das Simulationsinfo-Element, falls es noch nicht existiert
    let simInfo = document.getElementById("simulation-info");
    
    if (!simInfo) {
        simInfo = document.createElement("div");
        simInfo.id = "simulation-info";
        simInfo.className = "simulation-info";
        
        // Füge Inhalt hinzu
        simInfo.innerHTML = `
            <div class="sim-status">
                <i class="fas fa-cog fa-spin"></i>
                <span>Simulation aktiv</span>
            </div>
            <div class="sim-time">
                Laufzeit: <span id="sim-time-value">00:00:00</span>
            </div>
        `;
        
        // Füge es zum DOM hinzu
        document.getElementById("canvas-container").appendChild(simInfo);
    }
    
    // Zeige oder verstecke es
    simInfo.style.display = show ? "block" : "none";
    
    // Setze die Startzeit zurück, wenn die Simulation gestartet wird
    if (show) {
        simulationStartTime = new Date();
    }
}

/**
 * Aktualisiert die angezeigte Simulationszeit
 */
function updateSimulationTime() {
    if (!simulationRunning || !simulationStartTime) return;
    
    const now = new Date();
    const diff = now - simulationStartTime;
    
    // Formatiere die Zeit als HH:MM:SS
    const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // Aktualisiere die Anzeige
    const timeElement = document.getElementById("sim-time-value");
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}
