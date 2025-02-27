// Globale Variablen
let graph = null;
let canvas = null;
let simulationInterval = null;
let simulationRunning = false;

// Sensor-Daten simulieren
const simulateSensorData = {
    temperature: () => 20 + Math.random() * 10,
    humidity: () => 40 + Math.random() * 30,
    pressure: () => 1000 + Math.random() * 20,
    flow: () => Math.random() * 100
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
                name: "Sensor 1"
            };
            this.size = [180, 60];
            this.color = "#2E86C1";
        }
        
        onExecute() {
            const value = simulateSensorData[this.properties.type]();
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
                name: "Formel 1"
            };
            this.size = [180, 90];
            this.color = "#9B59B6";
        }
        
        onExecute() {
            const a = this.getInputData(0) || 0;
            const b = this.getInputData(1) || 0;
            let result = 0;
            
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
            
            this.setOutputData(0, result);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            
            let symbol = "+";
            switch(this.properties.operation) {
                case "subtract": symbol = "-"; break;
                case "multiply": symbol = "×"; break;
                case "divide": symbol = "÷"; break;
            }
            
            ctx.fillText(symbol, this.size[0] * 0.5, 55);
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
}

function addDisplayNode() {
    const node = LiteGraph.createNode("trendows/display");
    node.pos = [500 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
}

function addFormulaNode() {
    const node = LiteGraph.createNode("trendows/formula");
    node.pos = [300 + Math.random() * 300, 300 + Math.random() * 200];
    graph.add(node);
}

function addAlarmNode() {
    const node = LiteGraph.createNode("trendows/alarm");
    node.pos = [500 + Math.random() * 300, 300 + Math.random() * 200];
    graph.add(node);
}

// Eigenschaften eines Knotens anzeigen
function showNodeProperties(node) {
    const propertiesPanel = document.getElementById("node-properties");
    
    if (!node) {
        propertiesPanel.innerHTML = "<p>Wählen Sie ein Element aus, um dessen Eigenschaften zu bearbeiten.</p>";
        return;
    }
    
    let html = `<h4>${node.title}: ${node.properties.name || ""}</h4>`;
    html += `<div class="property"><label>Name:</label>
             <input type="text" id="prop-name" value="${node.properties.name || ""}"></div>`;
    
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
                </select>
            </div>
            <div class="property">
                <label>Einheit:</label>
                <input type="text" id="prop-unit" value="${node.properties.unit}">
            </div>
        `;
    } else if (node.constructor.name === "DisplayNode") {
        html += `
            <div class="property">
                <label>Nachkommastellen:</label>
                <input type="number" id="prop-precision" value="${node.properties.precision}" min="0" max="10">
            </div>
            <div class="property">
                <label>Graph anzeigen:</label>
                <input type="checkbox" id="prop-showGraph" ${node.properties.showGraph ? "checked" : ""}>
            </div>
        `;
    } else if (node.constructor.name === "FormulaNode") {
        html += `
            <div class="property">
                <label>Operation:</label>
                <select id="prop-operation">
                    <option value="add" ${node.properties.operation === "add" ? "selected" : ""}>Addition (+)</option>
                    <option value="subtract" ${node.properties.operation === "subtract" ? "selected" : ""}>Subtraktion (-)</option>
                    <option value="multiply" ${node.properties.operation === "multiply" ? "selected" : ""}>Multiplikation (×)</option>
                    <option value="divide" ${node.properties.operation === "divide" ? "selected" : ""}>Division (÷)</option>
                </select>
            </div>
        `;
    } else if (node.constructor.name === "AlarmNode") {
        html += `
            <div class="property">
                <label>Schwellwert:</label>
                <input type="number" id="prop-threshold" value="${node.properties.threshold}">
            </div>
            <div class="property">
                <label>Bedingung:</label>
                <select id="prop-condition">
                    <option value="greater" ${node.properties.condition === "greater" ? "selected" : ""}>Größer als</option>
                    <option value="less" ${node.properties.condition === "less" ? "selected" : ""}>Kleiner als</option>
                </select>
            </div>
        `;
    }
    
    html += `<button id="update-properties">Aktualisieren</button>`;
    
    propertiesPanel.innerHTML = html;
    
    // Event-Listener für Aktualisieren-Button
    document.getElementById("update-properties").addEventListener("click", function() {
        // Allgemeine Eigenschaften
        node.properties.name = document.getElementById("prop-name").value;
        
        // Spezifische Eigenschaften
        if (node.constructor.name === "SensorNode") {
            node.properties.type = document.getElementById("prop-type").value;
            node.properties.unit = document.getElementById("prop-unit").value;
        } else if (node.constructor.name === "DisplayNode") {
            node.properties.precision = parseInt(document.getElementById("prop-precision").value);
            node.properties.showGraph = document.getElementById("prop-showGraph").checked;
        } else if (node.constructor.name === "FormulaNode") {
            node.properties.operation = document.getElementById("prop-operation").value;
        } else if (node.constructor.name === "AlarmNode") {
            node.properties.threshold = parseFloat(document.getElementById("prop-threshold").value);
            node.properties.condition = document.getElementById("prop-condition").value;
        }
        
        // Graph aktualisieren
        graph.setDirtyCanvas(true);
    });
}

// Simulation starten
function startSimulation() {
    if (!simulationRunning) {
        simulationInterval = setInterval(function() {
            graph.runStep();
        }, 100);
        simulationRunning = true;
    }
}

// Simulation stoppen
function stopSimulation() {
    if (simulationRunning) {
        clearInterval(simulationInterval);
        simulationRunning = false;
    }
}
