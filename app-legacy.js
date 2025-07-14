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
    document.getElementById("add-filter").addEventListener("click", addFilterNode);
    document.getElementById("add-statistics").addEventListener("click", addStatisticsNode);
    document.getElementById("add-timer").addEventListener("click", addTimerNode);
    document.getElementById("add-constant").addEventListener("click", addConstantNode);
    document.getElementById("add-and").addEventListener("click", addAndGateNode);
    document.getElementById("add-or").addEventListener("click", addOrGateNode);
    document.getElementById("add-not").addEventListener("click", addNotGateNode);
    document.getElementById("add-comparator").addEventListener("click", addComparatorNode);
    document.getElementById("add-counter").addEventListener("click", addCounterNode);
    document.getElementById("add-pid").addEventListener("click", addPidNode);
    document.getElementById("add-gauge").addEventListener("click", addGaugeNode);
    document.getElementById("add-chart").addEventListener("click", addChartNode);
    document.getElementById("add-led").addEventListener("click", addLedNode);
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
    
    // Filter-Knoten
    class FilterNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Filter";
            this.addInput("Input", "number");
            this.addOutput("Output", "number");
            this.properties = {
                type: "movingAverage", // movingAverage, lowPass
                windowSize: 5,
                alpha: 0.1, // für low-pass filter
                name: "Filter 1"
            };
            this.size = [180, 70];
            this.color = "#F39C12";
            this.buffer = [];
            this.lastOutput = 0;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const input = this.getInputData(0);
            let output = this.lastOutput;
            
            if (input !== undefined && simulationRunning) {
                if (this.properties.type === "movingAverage") {
                    // Moving Average Filter
                    this.buffer.push(input);
                    if (this.buffer.length > this.properties.windowSize) {
                        this.buffer.shift();
                    }
                    
                    const sum = this.buffer.reduce((a, b) => a + b, 0);
                    output = sum / this.buffer.length;
                } else if (this.properties.type === "lowPass") {
                    // Low-pass Filter (exponential smoothing)
                    const alpha = Math.max(0.01, Math.min(1.0, this.properties.alpha));
                    output = alpha * input + (1 - alpha) * this.lastOutput;
                }
                
                this.lastOutput = output;
            }
            
            this.setOutputData(0, output);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "14px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            
            const typeText = this.properties.type === "movingAverage" ? "MA" : "LP";
            ctx.fillText(typeText, this.size[0] * 0.5, 45);
            
            if (this.properties.type === "movingAverage") {
                ctx.font = "12px Arial";
                ctx.fillText(`N=${this.properties.windowSize}`, this.size[0] * 0.5, 58);
            } else {
                ctx.font = "12px Arial";
                ctx.fillText(`α=${this.properties.alpha.toFixed(2)}`, this.size[0] * 0.5, 58);
            }
        }
    }
    LiteGraph.registerNodeType("trendows/filter", FilterNode);
    
    // Statistik-Knoten
    class StatisticsNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Statistik";
            this.addInput("Input", "number");
            this.addOutput("Min", "number");
            this.addOutput("Max", "number");
            this.addOutput("Avg", "number");
            this.properties = {
                windowSize: 10,
                resetOnOverflow: true,
                name: "Statistik 1"
            };
            this.size = [180, 90];
            this.color = "#16A085";
            this.buffer = [];
            this.statistics = { min: 0, max: 0, avg: 0 };
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const input = this.getInputData(0);
            
            if (input !== undefined && simulationRunning) {
                this.buffer.push(input);
                
                if (this.buffer.length > this.properties.windowSize) {
                    if (this.properties.resetOnOverflow) {
                        this.buffer.shift();
                    } else {
                        this.buffer = this.buffer.slice(-this.properties.windowSize);
                    }
                }
                
                if (this.buffer.length > 0) {
                    this.statistics.min = Math.min(...this.buffer);
                    this.statistics.max = Math.max(...this.buffer);
                    this.statistics.avg = this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
                }
            }
            
            this.setOutputData(0, this.statistics.min);
            this.setOutputData(1, this.statistics.max);
            this.setOutputData(2, this.statistics.avg);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "12px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "left";
            
            ctx.fillText(`Min: ${this.statistics.min.toFixed(1)}`, 10, 45);
            ctx.fillText(`Max: ${this.statistics.max.toFixed(1)}`, 10, 57);
            ctx.fillText(`Avg: ${this.statistics.avg.toFixed(1)}`, 10, 69);
            
            ctx.textAlign = "right";
            ctx.fillText(`N=${this.buffer.length}`, this.size[0] - 10, 45);
        }
    }
    LiteGraph.registerNodeType("trendows/statistics", StatisticsNode);
    
    // Timer-Knoten
    class TimerNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Timer";
            this.addInput("Trigger", "boolean");
            this.addInput("Reset", "boolean");
            this.addOutput("Output", "boolean");
            this.addOutput("Elapsed", "number");
            this.properties = {
                duration: 5.0, // seconds
                mode: "oneShot", // oneShot, interval
                autoReset: false,
                name: "Timer 1"
            };
            this.size = [180, 80];
            this.color = "#8E44AD";
            this.startTime = null;
            this.isRunning = false;
            this.output = false;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const trigger = this.getInputData(0);
            const reset = this.getInputData(1);
            const currentTime = Date.now() / 1000; // seconds
            
            // Reset logic
            if (reset) {
                this.startTime = null;
                this.isRunning = false;
                this.output = false;
            }
            
            // Trigger logic
            if (trigger && !this.isRunning && simulationRunning) {
                this.startTime = currentTime;
                this.isRunning = true;
                this.output = false;
            }
            
            // Timer logic
            if (this.isRunning && this.startTime !== null) {
                const elapsed = currentTime - this.startTime;
                
                if (elapsed >= this.properties.duration) {
                    this.output = true;
                    
                    if (this.properties.mode === "oneShot") {
                        this.isRunning = false;
                        if (this.properties.autoReset) {
                            this.output = false;
                        }
                    } else if (this.properties.mode === "interval") {
                        // Restart for interval mode
                        this.startTime = currentTime;
                        this.output = false;
                    }
                }
                
                this.setOutputData(1, elapsed);
            } else {
                this.setOutputData(1, 0);
            }
            
            this.setOutputData(0, this.output);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "14px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            
            const status = this.isRunning ? "RUN" : (this.output ? "OUT" : "IDLE");
            ctx.fillText(status, this.size[0] * 0.5, 45);
            
            ctx.font = "12px Arial";
            ctx.fillText(`${this.properties.duration}s`, this.size[0] * 0.5, 58);
            
            // Visual indicator
            ctx.fillStyle = this.isRunning ? "#27AE60" : (this.output ? "#E74C3C" : "#BDC3C7");
            ctx.beginPath();
            ctx.arc(this.size[0] - 15, 15, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    LiteGraph.registerNodeType("trendows/timer", TimerNode);
    
    // Konstante-Knoten
    class ConstantNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Konstante";
            this.addOutput("Value", "number");
            this.properties = {
                value: 1.0,
                type: "number", // number, boolean, string
                boolValue: true,
                stringValue: "text",
                name: "Konstante 1"
            };
            this.size = [160, 50];
            this.color = "#95A5A6";
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            let output;
            switch (this.properties.type) {
                case "number":
                    output = this.properties.value;
                    break;
                case "boolean":
                    output = this.properties.boolValue;
                    break;
                case "string":
                    output = this.properties.stringValue;
                    break;
                default:
                    output = this.properties.value;
            }
            
            this.setOutputData(0, output);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            
            let displayValue;
            switch (this.properties.type) {
                case "number":
                    displayValue = this.properties.value.toString();
                    break;
                case "boolean":
                    displayValue = this.properties.boolValue ? "TRUE" : "FALSE";
                    break;
                case "string":
                    displayValue = this.properties.stringValue.length > 8 ? 
                        this.properties.stringValue.substring(0, 8) + "..." : 
                        this.properties.stringValue;
                    break;
                default:
                    displayValue = "?";
            }
            
            ctx.fillText(displayValue, this.size[0] * 0.5, 35);
        }
    }
    LiteGraph.registerNodeType("trendows/constant", ConstantNode);
    
    // AND Logic Gate
    class AndGateNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "AND";
            this.addInput("A", "boolean");
            this.addInput("B", "boolean");
            this.addOutput("Output", "boolean");
            this.properties = {
                name: "AND Gate 1"
            };
            this.size = [120, 60];
            this.color = "#34495E";
            this.result = false;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                {
                    content: "Add Input",
                    callback: () => {
                        const inputCount = this.inputs.length;
                        this.addInput(`Input${inputCount + 1}`, "boolean");
                        this.size[1] = Math.max(60, 30 + this.inputs.length * 15);
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            let result = true;
            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.getInputData(i);
                if (!input) {
                    result = false;
                    break;
                }
            }
            this.result = result;
            this.setOutputData(0, result);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "14px Arial";
            ctx.fillStyle = this.result ? "#27AE60" : "#E74C3C";
            ctx.textAlign = "center";
            ctx.fillText("AND", this.size[0] * 0.5, this.size[1] * 0.5 + 5);
            
            // LED indicator
            ctx.fillStyle = this.result ? "#27AE60" : "#BDC3C7";
            ctx.beginPath();
            ctx.arc(this.size[0] - 15, 15, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    LiteGraph.registerNodeType("trendows/and", AndGateNode);
    
    // OR Logic Gate
    class OrGateNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "OR";
            this.addInput("A", "boolean");
            this.addInput("B", "boolean");
            this.addOutput("Output", "boolean");
            this.properties = {
                name: "OR Gate 1"
            };
            this.size = [120, 60];
            this.color = "#34495E";
            this.result = false;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                {
                    content: "Add Input",
                    callback: () => {
                        const inputCount = this.inputs.length;
                        this.addInput(`Input${inputCount + 1}`, "boolean");
                        this.size[1] = Math.max(60, 30 + this.inputs.length * 15);
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            let result = false;
            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.getInputData(i);
                if (input) {
                    result = true;
                    break;
                }
            }
            this.result = result;
            this.setOutputData(0, result);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "14px Arial";
            ctx.fillStyle = this.result ? "#27AE60" : "#E74C3C";
            ctx.textAlign = "center";
            ctx.fillText("OR", this.size[0] * 0.5, this.size[1] * 0.5 + 5);
            
            // LED indicator
            ctx.fillStyle = this.result ? "#27AE60" : "#BDC3C7";
            ctx.beginPath();
            ctx.arc(this.size[0] - 15, 15, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    LiteGraph.registerNodeType("trendows/or", OrGateNode);
    
    // NOT Logic Gate
    class NotGateNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "NOT";
            this.addInput("Input", "boolean");
            this.addOutput("Output", "boolean");
            this.properties = {
                name: "NOT Gate 1"
            };
            this.size = [120, 50];
            this.color = "#34495E";
            this.result = true;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const input = this.getInputData(0);
            this.result = !input;
            this.setOutputData(0, this.result);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "14px Arial";
            ctx.fillStyle = this.result ? "#27AE60" : "#E74C3C";
            ctx.textAlign = "center";
            ctx.fillText("NOT", this.size[0] * 0.5, this.size[1] * 0.5 + 5);
            
            // LED indicator
            ctx.fillStyle = this.result ? "#27AE60" : "#BDC3C7";
            ctx.beginPath();
            ctx.arc(this.size[0] - 15, 12, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    LiteGraph.registerNodeType("trendows/not", NotGateNode);
    
    // Comparator Node
    class ComparatorNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Vergleich";
            this.addInput("A", "number");
            this.addInput("B", "number");
            this.addOutput("A > B", "boolean");
            this.addOutput("A = B", "boolean");
            this.addOutput("A < B", "boolean");
            this.properties = {
                tolerance: 0.01,
                name: "Vergleich 1"
            };
            this.size = [160, 90];
            this.color = "#E67E22";
            this.results = { greater: false, equal: false, less: false };
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const a = this.getInputData(0) || 0;
            const b = this.getInputData(1) || 0;
            const tolerance = this.properties.tolerance;
            
            this.results.greater = a > b + tolerance;
            this.results.equal = Math.abs(a - b) <= tolerance;
            this.results.less = a < b - tolerance;
            
            this.setOutputData(0, this.results.greater);
            this.setOutputData(1, this.results.equal);
            this.setOutputData(2, this.results.less);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "12px Arial";
            ctx.textAlign = "right";
            
            // Show comparison results
            ctx.fillStyle = this.results.greater ? "#27AE60" : "#BDC3C7";
            ctx.fillText(">", this.size[0] - 10, 25);
            
            ctx.fillStyle = this.results.equal ? "#27AE60" : "#BDC3C7";
            ctx.fillText("=", this.size[0] - 10, 45);
            
            ctx.fillStyle = this.results.less ? "#27AE60" : "#BDC3C7";
            ctx.fillText("<", this.size[0] - 10, 65);
        }
    }
    LiteGraph.registerNodeType("trendows/comparator", ComparatorNode);
    
    // Counter Node
    class CounterNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Zähler";
            this.addInput("Trigger", "boolean");
            this.addInput("Reset", "boolean");
            this.addOutput("Count", "number");
            this.addOutput("Overflow", "boolean");
            this.properties = {
                maxCount: 10,
                resetOnOverflow: true,
                name: "Zähler 1"
            };
            this.size = [150, 70];
            this.color = "#D35400";
            this.count = 0;
            this.lastTrigger = false;
            this.overflow = false;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const trigger = this.getInputData(0);
            const reset = this.getInputData(1);
            
            // Reset logic
            if (reset) {
                this.count = 0;
                this.overflow = false;
            }
            
            // Trigger logic (edge detection)
            if (trigger && !this.lastTrigger && simulationRunning) {
                this.count++;
                
                if (this.count >= this.properties.maxCount) {
                    this.overflow = true;
                    if (this.properties.resetOnOverflow) {
                        this.count = 0;
                    }
                }
            }
            
            this.lastTrigger = trigger;
            this.setOutputData(0, this.count);
            this.setOutputData(1, this.overflow);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "16px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            ctx.fillText(this.count.toString(), this.size[0] * 0.5, 40);
            
            ctx.font = "10px Arial";
            ctx.fillText(`/ ${this.properties.maxCount}`, this.size[0] * 0.5, 52);
            
            // Overflow indicator
            if (this.overflow) {
                ctx.fillStyle = "#E74C3C";
                ctx.beginPath();
                ctx.arc(this.size[0] - 15, 15, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    LiteGraph.registerNodeType("trendows/counter", CounterNode);
    
    // PID Controller Node
    class PidControllerNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "PID Regler";
            this.addInput("Setpoint", "number");
            this.addInput("Process", "number");
            this.addOutput("Output", "number");
            this.properties = {
                kp: 1.0,    // Proportional gain
                ki: 0.1,    // Integral gain
                kd: 0.01,   // Derivative gain
                outputMin: -100,
                outputMax: 100,
                name: "PID Regler 1"
            };
            this.size = [180, 100];
            this.color = "#2C3E50";
            
            // PID state variables
            this.lastError = 0;
            this.integral = 0;
            this.lastTime = Date.now();
            this.output = 0;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                {
                    content: "Reset PID",
                    callback: () => {
                        this.lastError = 0;
                        this.integral = 0;
                        this.output = 0;
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            if (!simulationRunning) {
                this.setOutputData(0, this.output);
                return;
            }
            
            const setpoint = this.getInputData(0) || 0;
            const process = this.getInputData(1) || 0;
            const currentTime = Date.now();
            const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
            
            if (deltaTime <= 0) {
                this.setOutputData(0, this.output);
                return;
            }
            
            // Calculate error
            const error = setpoint - process;
            
            // Proportional term
            const proportional = this.properties.kp * error;
            
            // Integral term
            this.integral += error * deltaTime;
            const integral = this.properties.ki * this.integral;
            
            // Derivative term
            const derivative = this.properties.kd * (error - this.lastError) / deltaTime;
            
            // Calculate output
            this.output = proportional + integral + derivative;
            
            // Clamp output to limits
            this.output = Math.max(this.properties.outputMin, 
                         Math.min(this.properties.outputMax, this.output));
            
            // Integral windup prevention
            if (this.output >= this.properties.outputMax || this.output <= this.properties.outputMin) {
                this.integral -= error * deltaTime;
            }
            
            // Update state
            this.lastError = error;
            this.lastTime = currentTime;
            
            this.setOutputData(0, this.output);
        }
        
        onDrawForeground(ctx) {
            ctx.font = "14px Arial";
            ctx.fillStyle = "#000";
            ctx.textAlign = "center";
            ctx.fillText("PID", this.size[0] * 0.5, 30);
            
            ctx.font = "12px Arial";
            ctx.fillText(`Out: ${this.output.toFixed(1)}`, this.size[0] * 0.5, 50);
            
            // Show PID gains
            ctx.font = "10px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`P:${this.properties.kp.toFixed(2)}`, 10, 70);
            ctx.fillText(`I:${this.properties.ki.toFixed(2)}`, 60, 70);
            ctx.fillText(`D:${this.properties.kd.toFixed(3)}`, 110, 70);
        }
    }
    LiteGraph.registerNodeType("trendows/pid", PidControllerNode);
    
    // Gauge Node - Analog-style circular gauge
    class GaugeNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Gauge";
            this.addInput("Value", "number");
            this.properties = {
                minValue: 0,
                maxValue: 100,
                warningThreshold: 70,
                criticalThreshold: 90,
                unit: "",
                name: "Gauge 1",
                showDigital: true
            };
            this.size = [120, 120];
            this.color = "#3498DB";
            this.currentValue = 0;
            this.needleAngle = 0;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const input = this.getInputData(0);
            if (input !== undefined) {
                this.currentValue = input;
                // Calculate needle angle (-120° to +120°, total 240°)
                const normalized = (input - this.properties.minValue) / (this.properties.maxValue - this.properties.minValue);
                this.needleAngle = -120 + (normalized * 240);
            }
        }
        
        onDrawForeground(ctx) {
            const centerX = this.size[0] * 0.5;
            const centerY = this.size[1] * 0.55;
            const radius = Math.min(this.size[0], this.size[1]) * 0.35;
            
            // Draw gauge background
            ctx.fillStyle = "#2C3E50";
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw colored segments
            const segments = [
                { start: -120, end: this.getAngleForValue(this.properties.warningThreshold), color: "#27AE60" },
                { start: this.getAngleForValue(this.properties.warningThreshold), end: this.getAngleForValue(this.properties.criticalThreshold), color: "#F39C12" },
                { start: this.getAngleForValue(this.properties.criticalThreshold), end: 120, color: "#E74C3C" }
            ];
            
            segments.forEach(segment => {
                ctx.strokeStyle = segment.color;
                ctx.lineWidth = 8;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 
                    (segment.start - 90) * Math.PI / 180, 
                    (segment.end - 90) * Math.PI / 180);
                ctx.stroke();
            });
            
            // Draw scale marks
            ctx.strokeStyle = "#ECF0F1";
            ctx.lineWidth = 2;
            for (let angle = -120; angle <= 120; angle += 30) {
                const x1 = centerX + (radius - 8) * Math.cos((angle - 90) * Math.PI / 180);
                const y1 = centerY + (radius - 8) * Math.sin((angle - 90) * Math.PI / 180);
                const x2 = centerX + (radius - 15) * Math.cos((angle - 90) * Math.PI / 180);
                const y2 = centerY + (radius - 15) * Math.sin((angle - 90) * Math.PI / 180);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Draw needle
            ctx.strokeStyle = "#E74C3C";
            ctx.lineWidth = 3;
            const needleLength = radius - 10;
            const needleX = centerX + needleLength * Math.cos((this.needleAngle - 90) * Math.PI / 180);
            const needleY = centerY + needleLength * Math.sin((this.needleAngle - 90) * Math.PI / 180);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(needleX, needleY);
            ctx.stroke();
            
            // Draw center dot
            ctx.fillStyle = "#E74C3C";
            ctx.beginPath();
            ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw digital value if enabled
            if (this.properties.showDigital) {
                ctx.fillStyle = "#ECF0F1";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                const displayValue = this.currentValue.toFixed(1) + this.properties.unit;
                ctx.fillText(displayValue, centerX, centerY + radius + 15);
            }
        }
        
        getAngleForValue(value) {
            const normalized = (value - this.properties.minValue) / (this.properties.maxValue - this.properties.minValue);
            return -120 + (normalized * 240);
        }
    }
    LiteGraph.registerNodeType("trendows/gauge", GaugeNode);
    
    // Chart Node - Time-series line chart
    class ChartNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "Chart";
            this.addInput("Value 1", "number");
            this.addInput("Value 2", "number");
            this.addInput("Value 3", "number");
            this.properties = {
                timeWindow: 30,
                autoScale: true,
                minY: 0,
                maxY: 100,
                showGrid: true,
                name: "Chart 1"
            };
            this.size = [200, 120];
            this.color = "#9B59B6";
            this.dataHistory = [[], [], []]; // Three traces
            this.maxDataPoints = 300;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                {
                    content: "Add Input",
                    callback: () => {
                        if (this.inputs.length < 5) {
                            this.addInput(`Value ${this.inputs.length + 1}`, "number");
                            this.dataHistory.push([]);
                            this.size[1] = Math.max(120, 80 + this.inputs.length * 10);
                        }
                    }
                },
                {
                    content: "Remove Input",
                    callback: () => {
                        if (this.inputs.length > 1) {
                            this.removeInput(this.inputs.length - 1);
                            this.dataHistory.pop();
                            this.size[1] = Math.max(120, 80 + this.inputs.length * 10);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            if (!simulationRunning) return;
            
            const currentTime = Date.now();
            const timeWindow = this.properties.timeWindow * 1000; // Convert to ms
            
            // Collect current values and add to history
            for (let i = 0; i < this.inputs.length; i++) {
                const value = this.getInputData(i);
                if (value !== undefined) {
                    this.dataHistory[i].push({ time: currentTime, value: value });
                    
                    // Remove old data points
                    this.dataHistory[i] = this.dataHistory[i].filter(point => 
                        currentTime - point.time <= timeWindow
                    );
                    
                    // Limit total points
                    if (this.dataHistory[i].length > this.maxDataPoints) {
                        this.dataHistory[i] = this.dataHistory[i].slice(-this.maxDataPoints);
                    }
                }
            }
        }
        
        onDrawForeground(ctx) {
            const padding = 15;
            const chartX = padding;
            const chartY = 20;
            const chartW = this.size[0] - padding * 2;
            const chartH = this.size[1] - 40;
            
            // Draw background
            ctx.fillStyle = "#2C3E50";
            ctx.fillRect(chartX, chartY, chartW, chartH);
            
            // Draw grid if enabled
            if (this.properties.showGrid) {
                ctx.strokeStyle = "#34495E";
                ctx.lineWidth = 1;
                
                // Vertical grid lines
                for (let i = 0; i <= 4; i++) {
                    const x = chartX + (chartW / 4) * i;
                    ctx.beginPath();
                    ctx.moveTo(x, chartY);
                    ctx.lineTo(x, chartY + chartH);
                    ctx.stroke();
                }
                
                // Horizontal grid lines
                for (let i = 0; i <= 4; i++) {
                    const y = chartY + (chartH / 4) * i;
                    ctx.beginPath();
                    ctx.moveTo(chartX, y);
                    ctx.lineTo(chartX + chartW, y);
                    ctx.stroke();
                }
            }
            
            // Calculate Y-axis range
            let minY = this.properties.minY;
            let maxY = this.properties.maxY;
            
            if (this.properties.autoScale) {
                let allValues = [];
                this.dataHistory.forEach(trace => {
                    trace.forEach(point => allValues.push(point.value));
                });
                
                if (allValues.length > 0) {
                    minY = Math.min(...allValues);
                    maxY = Math.max(...allValues);
                    const range = maxY - minY;
                    if (range === 0) {
                        minY -= 1;
                        maxY += 1;
                    } else {
                        minY -= range * 0.1;
                        maxY += range * 0.1;
                    }
                }
            }
            
            // Draw data traces
            const colors = ["#E74C3C", "#27AE60", "#3498DB", "#F39C12", "#9B59B6"];
            const currentTime = Date.now();
            const timeWindow = this.properties.timeWindow * 1000;
            
            this.dataHistory.forEach((trace, index) => {
                if (trace.length < 2 || index >= colors.length) return;
                
                ctx.strokeStyle = colors[index];
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                let firstPoint = true;
                trace.forEach(point => {
                    const x = chartX + chartW * (1 - (currentTime - point.time) / timeWindow);
                    const y = chartY + chartH * (1 - (point.value - minY) / (maxY - minY));
                    
                    if (firstPoint) {
                        ctx.moveTo(x, y);
                        firstPoint = false;
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.stroke();
            });
            
            // Draw axis labels
            ctx.fillStyle = "#ECF0F1";
            ctx.font = "10px Arial";
            ctx.textAlign = "left";
            ctx.fillText(minY.toFixed(1), chartX + 2, chartY + chartH - 2);
            ctx.fillText(maxY.toFixed(1), chartX + 2, chartY + 12);
        }
    }
    LiteGraph.registerNodeType("trendows/chart", ChartNode);
    
    // LED Indicator Node - Visual status indicator
    class LedIndicatorNode extends LiteGraph.LGraphNode {
        constructor() {
            super();
            this.title = "LED Indicator";
            this.addInput("State", "number");
            this.properties = {
                states: [
                    { value: 0, color: "#95A5A6", label: "Off", blink: false },
                    { value: 1, color: "#27AE60", label: "On", blink: false },
                    { value: 2, color: "#F39C12", label: "Warning", blink: true },
                    { value: 3, color: "#E74C3C", label: "Alarm", blink: true }
                ],
                name: "LED 1",
                ledSize: "medium"
            };
            this.size = [140, 100];
            this.color = "#34495E";
            this.currentState = 0;
            this.blinkPhase = 0;
        }
        
        getMenuOptions() {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        if (graph) {
                            graph.selectNode(this);
                            showNodeProperties(this);
                        }
                    }
                },
                null,
                {
                    content: "Clone",
                    callback: () => {
                        const cloned = LiteGraph.createNode(this.constructor.type);
                        cloned.pos = [this.pos[0] + 50, this.pos[1] + 50];
                        Object.assign(cloned.properties, this.properties);
                        graph.add(cloned);
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        graph.remove(this);
                    }
                }
            ];
        }
        
        onExecute() {
            const input = this.getInputData(0);
            if (input !== undefined) {
                this.currentState = Math.round(input);
            }
            
            // Update blink phase
            this.blinkPhase += 0.1;
            if (this.blinkPhase > 2 * Math.PI) {
                this.blinkPhase = 0;
            }
        }
        
        onDrawForeground(ctx) {
            const ledSizes = { small: 8, medium: 12, large: 16 };
            const ledRadius = ledSizes[this.properties.ledSize] || 12;
            
            const centerX = this.size[0] * 0.5;
            let currentY = 25;
            
            this.properties.states.forEach((state, index) => {
                const isActive = this.currentState === state.value;
                let alpha = isActive ? 1.0 : 0.3;
                
                // Apply blinking effect
                if (isActive && state.blink) {
                    alpha = 0.3 + 0.7 * (Math.sin(this.blinkPhase * 3) + 1) / 2;
                }
                
                // Draw LED
                ctx.globalAlpha = alpha;
                ctx.fillStyle = state.color;
                ctx.beginPath();
                ctx.arc(centerX - 30, currentY, ledRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw LED highlight
                if (isActive) {
                    ctx.globalAlpha = alpha * 0.6;
                    ctx.fillStyle = "#FFFFFF";
                    ctx.beginPath();
                    ctx.arc(centerX - 30 - ledRadius * 0.3, currentY - ledRadius * 0.3, ledRadius * 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw label
                ctx.globalAlpha = 1.0;
                ctx.fillStyle = isActive ? "#ECF0F1" : "#7F8C8D";
                ctx.font = isActive ? "bold 12px Arial" : "12px Arial";
                ctx.textAlign = "left";
                ctx.fillText(state.label, centerX - 10, currentY + 4);
                
                currentY += 18;
            });
            
            ctx.globalAlpha = 1.0;
        }
    }
    LiteGraph.registerNodeType("trendows/led", LedIndicatorNode);
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

function addFilterNode() {
    const node = LiteGraph.createNode("trendows/filter");
    node.pos = [100 + Math.random() * 300, 400 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-filter");
}

function addStatisticsNode() {
    const node = LiteGraph.createNode("trendows/statistics");
    node.pos = [300 + Math.random() * 300, 400 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-statistics");
}

function addTimerNode() {
    const node = LiteGraph.createNode("trendows/timer");
    node.pos = [500 + Math.random() * 300, 400 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-timer");
}

function addConstantNode() {
    const node = LiteGraph.createNode("trendows/constant");
    node.pos = [200 + Math.random() * 300, 500 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-constant");
}

function addAndGateNode() {
    const node = LiteGraph.createNode("trendows/and");
    node.pos = [100 + Math.random() * 300, 600 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-and");
}

function addOrGateNode() {
    const node = LiteGraph.createNode("trendows/or");
    node.pos = [250 + Math.random() * 300, 600 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-or");
}

function addNotGateNode() {
    const node = LiteGraph.createNode("trendows/not");
    node.pos = [400 + Math.random() * 300, 600 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-not");
}

function addComparatorNode() {
    const node = LiteGraph.createNode("trendows/comparator");
    node.pos = [550 + Math.random() * 300, 600 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-comparator");
}

function addCounterNode() {
    const node = LiteGraph.createNode("trendows/counter");
    node.pos = [700 + Math.random() * 300, 600 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-counter");
}

function addPidNode() {
    const node = LiteGraph.createNode("trendows/pid");
    node.pos = [850 + Math.random() * 300, 600 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-pid");
}

function addGaugeNode() {
    const node = LiteGraph.createNode("trendows/gauge");
    node.pos = [100 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-gauge");
}

function addChartNode() {
    const node = LiteGraph.createNode("trendows/chart");
    node.pos = [300 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-chart");
}

function addLedNode() {
    const node = LiteGraph.createNode("trendows/led");
    node.pos = [500 + Math.random() * 300, 100 + Math.random() * 200];
    graph.add(node);
    
    // Automatisch Eigenschaften anzeigen
    graph.selectNode(node);
    showNodeProperties(node);
    
    // Visuelles Feedback
    flashToolbarButton("add-led");
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
    } else if (node.constructor.name === "FilterNode") {
        nodeTypeClass = "filter-properties";
        nodeIcon = "fa-filter";
    } else if (node.constructor.name === "StatisticsNode") {
        nodeTypeClass = "statistics-properties";
        nodeIcon = "fa-chart-bar";
    } else if (node.constructor.name === "TimerNode") {
        nodeTypeClass = "timer-properties";
        nodeIcon = "fa-clock";
    } else if (node.constructor.name === "ConstantNode") {
        nodeTypeClass = "constant-properties";
        nodeIcon = "fa-hashtag";
    } else if (node.constructor.name === "AndGateNode") {
        nodeTypeClass = "logic-properties";
        nodeIcon = "fa-square";
    } else if (node.constructor.name === "OrGateNode") {
        nodeTypeClass = "logic-properties";
        nodeIcon = "fa-circle";
    } else if (node.constructor.name === "NotGateNode") {
        nodeTypeClass = "logic-properties";
        nodeIcon = "fa-exclamation";
    } else if (node.constructor.name === "ComparatorNode") {
        nodeTypeClass = "comparator-properties";
        nodeIcon = "fa-not-equal";
    } else if (node.constructor.name === "CounterNode") {
        nodeTypeClass = "counter-properties";
        nodeIcon = "fa-sort-numeric-up";
    } else if (node.constructor.name === "PidControllerNode") {
        nodeTypeClass = "pid-properties";
        nodeIcon = "fa-cogs";
    } else if (node.constructor.name === "GaugeNode") {
        nodeTypeClass = "gauge-properties";
        nodeIcon = "fa-tachometer-alt";
    } else if (node.constructor.name === "ChartNode") {
        nodeTypeClass = "chart-properties";
        nodeIcon = "fa-chart-area";
    } else if (node.constructor.name === "LedIndicatorNode") {
        nodeTypeClass = "led-properties";
        nodeIcon = "fa-lightbulb";
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
    } else if (node.constructor.name === "FilterNode") {
        html += `
            <div class="property">
                <label>Filter-Typ:</label>
                <select id="prop-filterType">
                    <option value="movingAverage" ${node.properties.type === "movingAverage" ? "selected" : ""}>Gleitender Mittelwert</option>
                    <option value="lowPass" ${node.properties.type === "lowPass" ? "selected" : ""}>Tiefpass-Filter</option>
                </select>
            </div>
            <div class="property" id="moving-average-settings" ${node.properties.type !== "movingAverage" ? 'style="display:none;"' : ''}>
                <label>Fenstergröße:</label>
                <input type="number" id="prop-windowSize" value="${node.properties.windowSize}" min="2" max="50">
            </div>
            <div class="property" id="lowpass-settings" ${node.properties.type !== "lowPass" ? 'style="display:none;"' : ''}>
                <label>Alpha (Glättungsfaktor):</label>
                <input type="range" id="prop-alpha" value="${node.properties.alpha}" min="0.01" max="1.0" step="0.01">
                <span id="alpha-value">${node.properties.alpha.toFixed(2)}</span>
            </div>
        `;
    } else if (node.constructor.name === "StatisticsNode") {
        html += `
            <div class="property">
                <label>Fenstergröße:</label>
                <input type="number" id="prop-statsWindowSize" value="${node.properties.windowSize}" min="2" max="100">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-resetOnOverflow" ${node.properties.resetOnOverflow ? "checked" : ""}>
                    <label for="prop-resetOnOverflow" style="display: inline; font-weight: normal;">Bei Überlauf zurücksetzen</label>
                </div>
            </div>
        `;
    } else if (node.constructor.name === "TimerNode") {
        html += `
            <div class="property">
                <label>Dauer (Sekunden):</label>
                <input type="number" id="prop-duration" value="${node.properties.duration}" min="0.1" max="3600" step="0.1">
            </div>
            <div class="property">
                <label>Modus:</label>
                <select id="prop-timerMode">
                    <option value="oneShot" ${node.properties.mode === "oneShot" ? "selected" : ""}>Einmalig</option>
                    <option value="interval" ${node.properties.mode === "interval" ? "selected" : ""}>Intervall</option>
                </select>
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-autoReset" ${node.properties.autoReset ? "checked" : ""}>
                    <label for="prop-autoReset" style="display: inline; font-weight: normal;">Automatisch zurücksetzen</label>
                </div>
            </div>
        `;
    } else if (node.constructor.name === "ConstantNode") {
        html += `
            <div class="property">
                <label>Typ:</label>
                <select id="prop-constantType">
                    <option value="number" ${node.properties.type === "number" ? "selected" : ""}>Zahl</option>
                    <option value="boolean" ${node.properties.type === "boolean" ? "selected" : ""}>Boolean</option>
                    <option value="string" ${node.properties.type === "string" ? "selected" : ""}>Text</option>
                </select>
            </div>
            <div class="property" id="number-input" ${node.properties.type !== "number" ? 'style="display:none;"' : ''}>
                <label>Wert:</label>
                <input type="number" id="prop-numberValue" value="${node.properties.value}" step="any">
            </div>
            <div class="property" id="boolean-input" ${node.properties.type !== "boolean" ? 'style="display:none;"' : ''}>
                <label>Wert:</label>
                <select id="prop-boolValue">
                    <option value="true" ${node.properties.boolValue ? "selected" : ""}>True</option>
                    <option value="false" ${!node.properties.boolValue ? "selected" : ""}>False</option>
                </select>
            </div>
            <div class="property" id="string-input" ${node.properties.type !== "string" ? 'style="display:none;"' : ''}>
                <label>Wert:</label>
                <input type="text" id="prop-stringValue" value="${node.properties.stringValue}">
            </div>
        `;
    } else if (node.constructor.name === "AndGateNode" || node.constructor.name === "OrGateNode" || node.constructor.name === "NotGateNode") {
        html += `
            <div class="property">
                <label>Info:</label>
                <p style="color: #666; font-size: 13px;">Logik-Gatter für boolesche Operationen. 
                ${node.constructor.name === "AndGateNode" ? "AND: Alle Eingänge müssen aktiv sein." : 
                  node.constructor.name === "OrGateNode" ? "OR: Mindestens ein Eingang muss aktiv sein." : 
                  "NOT: Invertiert den Eingangswert."}</p>
            </div>
        `;
    } else if (node.constructor.name === "ComparatorNode") {
        html += `
            <div class="property">
                <label>Toleranz für Gleichheit:</label>
                <input type="number" id="prop-tolerance" value="${node.properties.tolerance}" min="0" max="10" step="0.001">
                <small>Werte gelten als gleich, wenn der Unterschied kleiner als die Toleranz ist.</small>
            </div>
        `;
    } else if (node.constructor.name === "CounterNode") {
        html += `
            <div class="property">
                <label>Maximaler Zählwert:</label>
                <input type="number" id="prop-maxCount" value="${node.properties.maxCount}" min="1" max="1000">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-resetOnOverflow" ${node.properties.resetOnOverflow ? "checked" : ""}>
                    <label for="prop-resetOnOverflow" style="display: inline; font-weight: normal;">Bei Überlauf zurücksetzen</label>
                </div>
            </div>
        `;
    } else if (node.constructor.name === "PidControllerNode") {
        html += `
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
                <label>Ausgabegrenzen:</label>
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
                <button id="reset-pid" style="width: 100%; padding: 8px; background-color: #E67E22; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-undo"></i> PID zurücksetzen
                </button>
            </div>
        `;
    } else if (node.constructor.name === "GaugeNode") {
        html += `
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
    } else if (node.constructor.name === "ChartNode") {
        html += `
            <div class="property">
                <label>Zeitfenster (Sekunden):</label>
                <input type="number" id="prop-timeWindow" value="${node.properties.timeWindow}" min="5" max="300">
            </div>
            <div class="property">
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="prop-autoScale" ${node.properties.autoScale ? "checked" : ""}>
                    <label for="prop-autoScale" style="display: inline; font-weight: normal;">Automatische Skalierung</label>
                </div>
            </div>
            <div class="property">
                <label>Y-Achsen Bereich (bei fester Skalierung):</label>
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
                    <label for="prop-showGrid" style="display: inline; font-weight: normal;">Gitter anzeigen</label>
                </div>
            </div>
        `;
    } else if (node.constructor.name === "LedIndicatorNode") {
        html += `
            <div class="property">
                <label>LED Größe:</label>
                <select id="prop-ledSize">
                    <option value="small" ${node.properties.ledSize === "small" ? "selected" : ""}>Klein</option>
                    <option value="medium" ${node.properties.ledSize === "medium" ? "selected" : ""}>Mittel</option>
                    <option value="large" ${node.properties.ledSize === "large" ? "selected" : ""}>Groß</option>
                </select>
            </div>
            <div class="property">
                <label>LED Zustände:</label>
                <small>Konfigurieren Sie die verschiedenen LED-Zustände:</small>
                <div id="led-states-config" style="margin-top: 10px;">
                    ${node.properties.states.map((state, index) => `
                        <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 8px; border-radius: 4px;">
                            <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                                <div style="flex: 1;">
                                    <label>Wert:</label>
                                    <input type="number" class="state-value" data-index="${index}" value="${state.value}">
                                </div>
                                <div style="flex: 1;">
                                    <label>Farbe:</label>
                                    <input type="color" class="state-color" data-index="${index}" value="${state.color}">
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <div style="flex: 1;">
                                    <label>Label:</label>
                                    <input type="text" class="state-label" data-index="${index}" value="${state.label}">
                                </div>
                                <div style="flex: 1; display: flex; align-items: end;">
                                    <div class="checkbox-wrapper">
                                        <input type="checkbox" class="state-blink" data-index="${index}" ${state.blink ? "checked" : ""}>
                                        <label style="display: inline; font-weight: normal;">Blinken</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
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
    } else if (node.constructor.name === "FilterNode") {
        // Event-Listener für Filter-Typ Änderung
        const filterTypeSelect = document.getElementById("prop-filterType");
        const movingAverageSettings = document.getElementById("moving-average-settings");
        const lowpassSettings = document.getElementById("lowpass-settings");
        const alphaSlider = document.getElementById("prop-alpha");
        const alphaValue = document.getElementById("alpha-value");
        
        if (filterTypeSelect) {
            filterTypeSelect.addEventListener("change", function() {
                if (this.value === "movingAverage") {
                    movingAverageSettings.style.display = "block";
                    lowpassSettings.style.display = "none";
                } else {
                    movingAverageSettings.style.display = "none";
                    lowpassSettings.style.display = "block";
                }
            });
        }
        
        if (alphaSlider && alphaValue) {
            alphaSlider.addEventListener("input", function() {
                alphaValue.textContent = parseFloat(this.value).toFixed(2);
            });
        }
    } else if (node.constructor.name === "ConstantNode") {
        // Event-Listener für Konstanten-Typ Änderung
        const constantTypeSelect = document.getElementById("prop-constantType");
        const numberInput = document.getElementById("number-input");
        const booleanInput = document.getElementById("boolean-input");
        const stringInput = document.getElementById("string-input");
        
        if (constantTypeSelect) {
            constantTypeSelect.addEventListener("change", function() {
                numberInput.style.display = this.value === "number" ? "block" : "none";
                booleanInput.style.display = this.value === "boolean" ? "block" : "none";
                stringInput.style.display = this.value === "string" ? "block" : "none";
            });
        }
    } else if (node.constructor.name === "PidControllerNode") {
        // Event-Listener für PID Reset Button
        const resetPidButton = document.getElementById("reset-pid");
        if (resetPidButton) {
            resetPidButton.addEventListener("click", function() {
                node.lastError = 0;
                node.integral = 0;
                node.output = 0;
                
                // Visual feedback
                this.innerHTML = '<i class="fas fa-check"></i> Zurückgesetzt!';
                this.style.backgroundColor = '#27AE60';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-undo"></i> PID zurücksetzen';
                    this.style.backgroundColor = '#E67E22';
                }, 1500);
            });
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
        } else if (node.constructor.name === "FilterNode") {
            node.properties.type = document.getElementById("prop-filterType").value;
            node.properties.windowSize = parseInt(document.getElementById("prop-windowSize").value);
            node.properties.alpha = parseFloat(document.getElementById("prop-alpha").value);
        } else if (node.constructor.name === "StatisticsNode") {
            node.properties.windowSize = parseInt(document.getElementById("prop-statsWindowSize").value);
            node.properties.resetOnOverflow = document.getElementById("prop-resetOnOverflow").checked;
        } else if (node.constructor.name === "TimerNode") {
            node.properties.duration = parseFloat(document.getElementById("prop-duration").value);
            node.properties.mode = document.getElementById("prop-timerMode").value;
            node.properties.autoReset = document.getElementById("prop-autoReset").checked;
        } else if (node.constructor.name === "ConstantNode") {
            node.properties.type = document.getElementById("prop-constantType").value;
            switch (node.properties.type) {
                case "number":
                    node.properties.value = parseFloat(document.getElementById("prop-numberValue").value);
                    break;
                case "boolean":
                    node.properties.boolValue = document.getElementById("prop-boolValue").value === "true";
                    break;
                case "string":
                    node.properties.stringValue = document.getElementById("prop-stringValue").value;
                    break;
            }
        } else if (node.constructor.name === "ComparatorNode") {
            node.properties.tolerance = parseFloat(document.getElementById("prop-tolerance").value);
        } else if (node.constructor.name === "CounterNode") {
            node.properties.maxCount = parseInt(document.getElementById("prop-maxCount").value);
            node.properties.resetOnOverflow = document.getElementById("prop-resetOnOverflow").checked;
        } else if (node.constructor.name === "PidControllerNode") {
            node.properties.kp = parseFloat(document.getElementById("prop-kp").value);
            node.properties.ki = parseFloat(document.getElementById("prop-ki").value);
            node.properties.kd = parseFloat(document.getElementById("prop-kd").value);
            node.properties.outputMin = parseFloat(document.getElementById("prop-outputMin").value);
            node.properties.outputMax = parseFloat(document.getElementById("prop-outputMax").value);
        } else if (node.constructor.name === "GaugeNode") {
            node.properties.minValue = parseFloat(document.getElementById("prop-minValue").value);
            node.properties.maxValue = parseFloat(document.getElementById("prop-maxValue").value);
            node.properties.warningThreshold = parseFloat(document.getElementById("prop-warningThreshold").value);
            node.properties.criticalThreshold = parseFloat(document.getElementById("prop-criticalThreshold").value);
            node.properties.unit = document.getElementById("prop-unit").value;
            node.properties.showDigital = document.getElementById("prop-showDigital").checked;
        } else if (node.constructor.name === "ChartNode") {
            node.properties.timeWindow = parseInt(document.getElementById("prop-timeWindow").value);
            node.properties.autoScale = document.getElementById("prop-autoScale").checked;
            node.properties.minY = parseFloat(document.getElementById("prop-minY").value);
            node.properties.maxY = parseFloat(document.getElementById("prop-maxY").value);
            node.properties.showGrid = document.getElementById("prop-showGrid").checked;
        } else if (node.constructor.name === "LedIndicatorNode") {
            node.properties.ledSize = document.getElementById("prop-ledSize").value;
            
            // Update LED states
            const stateValues = document.querySelectorAll(".state-value");
            const stateColors = document.querySelectorAll(".state-color");
            const stateLabels = document.querySelectorAll(".state-label");
            const stateBlinks = document.querySelectorAll(".state-blink");
            
            node.properties.states.forEach((state, index) => {
                if (stateValues[index]) state.value = parseFloat(stateValues[index].value);
                if (stateColors[index]) state.color = stateColors[index].value;
                if (stateLabels[index]) state.label = stateLabels[index].value;
                if (stateBlinks[index]) state.blink = stateBlinks[index].checked;
            });
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
