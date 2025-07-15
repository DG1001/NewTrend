// Core application initialization and graph management
const Application = {
    // Global state
    graph: null,
    canvas: null,
    
    // Initialize the application
    init() {
        this.initGraph();
        this.setupEventListeners();
    },
    
    // Initialize the LiteGraph canvas and graph
    initGraph() {
        // Get canvas element
        const canvasElement = document.getElementById("graph-canvas");
        if (!canvasElement) {
            console.error("Graph canvas element not found!");
            return;
        }
        
        // Create graph
        this.graph = new LiteGraph.LGraph();
        
        // Create canvas and connect to graph
        this.canvas = new LiteGraph.LGraphCanvas(canvasElement, this.graph);
        
        // Adjust canvas to container
        this.resizeCanvas();
        
        // Register all custom nodes
        if (window.NodeRegistry) {
            NodeRegistry.registerAll();
        }
        
        // Start the graph
        this.graph.start();
        
        // Enable continuous updates
        this.graph.onBeforeStep = () => {
            this.graph.setDirtyCanvas(true);
        };
        
        // Override canvas selection to trigger properties panel
        this.setupCanvasOverrides();
        
        // Make graph and canvas globally available
        window.graph = this.graph;
        window.canvas = this.canvas;
    },
    
    // Setup canvas overrides for custom behavior
    setupCanvasOverrides() {
        // Override node selection to show properties
        const originalSelectNode = this.canvas.selectNode;
        this.canvas.selectNode = (node) => {
            const result = originalSelectNode.call(this.canvas, node);
            if (node && window.showNodeProperties) {
                showNodeProperties(node);
            } else if (window.showNodeProperties) {
                showNodeProperties(null);
            }
            return result;
        };
        
        // Override canvas menu to remove default properties
        const originalGetCanvasMenuOptions = this.canvas.getCanvasMenuOptions;
        this.canvas.getCanvasMenuOptions = function() {
            const options = originalGetCanvasMenuOptions ? originalGetCanvasMenuOptions.call(this) : [];
            return options.filter(option => !option || option.content !== "Properties");
        };
        
        // Override node context menu to redirect to our properties panel
        const originalGetNodeMenuOptions = this.canvas.getNodeMenuOptions;
        this.canvas.getNodeMenuOptions = (node) => {
            return [
                {
                    content: "Properties",
                    callback: () => {
                        this.canvas.selectNode(node);
                        if (window.showNodeProperties) {
                            showNodeProperties(node);
                        }
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
                            this.graph.add(cloned);
                        }
                    }
                },
                {
                    content: "Remove",
                    callback: () => {
                        this.graph.remove(node);
                    }
                }
            ];
        };
        
        // Enable interaction settings
        this.canvas.allow_interaction = true;
        this.canvas.allow_dragcanvas = true;
        this.canvas.allow_dragnodes = true;
        this.canvas.allow_reconnect_links = true;
    },
    
    // Setup event listeners for the application
    setupEventListeners() {
        // Toolbar button event listeners
        if (window.ToolbarHelpers) {
            const helpers = ToolbarHelpers;
            
            // Data Sources & Display
            this.bindEvent("add-sensor", () => helpers.createSensorNode());
            this.bindEvent("add-display", () => helpers.createDisplayNode());
            this.bindEvent("add-constant", () => helpers.createConstantNode());
            this.bindEvent("add-button", () => helpers.createButtonNode());
            this.bindEvent("add-switch", () => helpers.createSwitchNode());
            this.bindEvent("add-slider", () => helpers.createSliderNode());
            this.bindEvent("add-mqtt", () => helpers.createMQTTNode());
            this.bindEvent("add-mqttsend", () => helpers.createMQTTSendNode());
            
            // Processing & Analysis
            this.bindEvent("add-filter", () => helpers.createFilterNode());
            this.bindEvent("add-statistics", () => helpers.createStatisticsNode());
            this.bindEvent("add-formula", () => helpers.createFormulaNode());
            this.bindEvent("add-fft", () => helpers.createFFTNode());
            
            // Visualization
            this.bindEvent("add-gauge", () => helpers.createGaugeNode());
            this.bindEvent("add-chart", () => helpers.createChartNode());
            this.bindEvent("add-led", () => helpers.createLedNode());
            
            // Logic & Control
            this.bindEvent("add-and", () => helpers.createAndGateNode());
            this.bindEvent("add-or", () => helpers.createOrGateNode());
            this.bindEvent("add-not", () => helpers.createNotGateNode());
            this.bindEvent("add-comparator", () => helpers.createComparatorNode());
            this.bindEvent("add-counter", () => helpers.createCounterNode());
            
            // Automation
            this.bindEvent("add-timer", () => helpers.createTimerNode());
            this.bindEvent("add-pid", () => helpers.createPidNode());
            this.bindEvent("add-alarm", () => helpers.createAlarmNode());
        }
        
        // Simulation controls
        if (window.SimulationEngine) {
            this.bindEvent("start-sim", () => SimulationEngine.start());
            this.bindEvent("stop-sim", () => SimulationEngine.stop());
        }
        
        // Window resize handler
        window.addEventListener("resize", () => this.resizeCanvas());
        
        // Node selection handler
        if (this.graph) {
            this.graph.onNodeSelected = (node) => {
                if (window.showNodeProperties) {
                    showNodeProperties(node);
                }
            };
        }
    },
    
    // Helper to bind event listeners
    bindEvent(elementId, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener("click", handler);
        } else {
            console.warn(`Element with id '${elementId}' not found`);
        }
    },
    
    // Resize canvas to fit container
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = document.getElementById("canvas-container");
        if (container) {
            this.canvas.resize(container.clientWidth, container.clientHeight);
        }
    }
};

// Make Application available globally
window.Application = Application;