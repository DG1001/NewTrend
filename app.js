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
            let value;
            if (this.properties.type === "custom" || this.properties.useCustomRange) {
                value = simulateSensorData.custom(this.properties.min, this.properties.max);
            } else {
                value = simulateSensorData[this.properties.type]();
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
                this.values.push(value);
                this.values.shift();
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
                if (this.properties.condition === "greater") {
                    this.alarm = value > this.properties.threshold;
                } else {
                    this.alarm = value < this.properties.threshold;
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
    
    // Visuelles Feedback
    flashToolbarButton("add-sensor");
}

function addDisplayNode() {
    const node = LiteGraph.createNode("trendows/display");
    node.pos = [500 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-display");
}

function addFormulaNode() {
    const node = LiteGraph.createNode("trendows/formula");
    node.pos = [300 + Math.random() * 300, 300 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-formula");
}

function addAlarmNode() {
    const node = LiteGraph.createNode("trendows/alarm");
    node.pos = [500 + Math.random() * 300, 300 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    
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
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-useCustomFormula" ${node.properties.useCustomFormula ? "checked" : ""}>
                    <label for="prop-useCustomFormula" style="display: inline; font-weight: normal;">Benutzerdefinierte Formel verwenden</label>
                </div>
            </div>
            
            <div class="property formula-editor" id="standard-operations" ${node.properties.useCustomFormula ? 'style="display:none;"' : ''}>
                <label>Operation:</label>
                <select id="prop-operation">
                    <option value="add" ${node.properties.operation === "add" ? "selected" : ""}>Addition (+)</option>
                    <option value="subtract" ${node.properties.operation === "subtract" ? "selected" : ""}>Subtraktion (-)</option>
                    <option value="multiply" ${node.properties.operation === "multiply" ? "selected" : ""}>Multiplikation (×)</option>
                    <option value="divide" ${node.properties.operation === "divide" ? "selected" : ""}>Division (÷)</option>
                </select>
                
                <div style="margin-top: 15px; text-align: center;">
                    <div style="font-size: 18px; font-weight: bold; color: #9B59B6;">
                        A <span id="operation-symbol">+</span> B
                    </div>
                </div>
            </div>
            
            <div class="property formula-editor" id="custom-formula" ${!node.properties.useCustomFormula ? 'style="display:none;"' : ''}>
                <label>Formel (verwende a und b als Variablen):</label>
                <input type="text" id="prop-customFormula" class="formula-input" value="${node.properties.customFormula || ''}" placeholder="z.B.: a * b + 10">
                <small>
                    <strong>Beispiele:</strong><br>
                    • Einfache Operationen: <code>a + b</code>, <code>a * b</code><br>
                    • Mathematische Funktionen: <code>Math.sin(a)</code>, <code>Math.sqrt(a)</code><br>
                    • Bedingte Ausdrücke: <code>a > b ? a : b</code> (Maximum)<br>
                    • Komplexe Formeln: <code>Math.pow(a, 2) + Math.pow(b, 2)</code>
                </small>
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
        // Event-Listener für den Wechsel zwischen Standard-Operationen und benutzerdefinierten Formeln
        const useCustomFormulaCheckbox = document.getElementById("prop-useCustomFormula");
        const standardOperations = document.getElementById("standard-operations");
        const customFormula = document.getElementById("custom-formula");
        const operationSelect = document.getElementById("prop-operation");
        const operationSymbol = document.getElementById("operation-symbol");
        
        if (useCustomFormulaCheckbox) {
            useCustomFormulaCheckbox.addEventListener("change", function() {
                if (this.checked) {
                    standardOperations.style.display = "none";
                    customFormula.style.display = "block";
                } else {
                    standardOperations.style.display = "block";
                    customFormula.style.display = "none";
                }
            });
        }
        
        // Aktualisiere das Operationssymbol, wenn sich die Operation ändert
        if (operationSelect && operationSymbol) {
            // Setze das initiale Symbol
            updateOperationSymbol(operationSelect.value);
            
            operationSelect.addEventListener("change", function() {
                updateOperationSymbol(this.value);
            });
        }
        
        function updateOperationSymbol(operation) {
            switch(operation) {
                case "add": operationSymbol.textContent = "+"; break;
                case "subtract": operationSymbol.textContent = "-"; break;
                case "multiply": operationSymbol.textContent = "×"; break;
                case "divide": operationSymbol.textContent = "÷"; break;
            }
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
            node.properties.useCustomFormula = document.getElementById("prop-useCustomFormula").checked;
            if (node.properties.useCustomFormula) {
                node.properties.customFormula = document.getElementById("prop-customFormula").value;
            } else {
                node.properties.operation = document.getElementById("prop-operation").value;
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
