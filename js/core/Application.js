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
        
        // File operations
        if (window.GraphStorage) {
            this.bindEvent("save-graph", () => this.handleSaveGraph());
            this.bindEvent("load-graph", () => this.handleLoadGraph());
            this.bindEvent("export-graph", () => this.handleExportGraph());
            this.bindEvent("import-graph", () => this.handleImportGraph());
            this.setupFileImport();
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
    },
    
    // Handle save graph
    handleSaveGraph() {
        this.showSaveModal();
    },
    
    // Handle load graph
    handleLoadGraph() {
        this.showLoadModal();
    },
    
    // Handle export graph
    handleExportGraph() {
        const name = prompt("Export filename:", "graph_export");
        if (!name) return;
        
        const result = GraphStorage.exportGraph(name);
        
        if (result.success) {
            this.showMessage(result.message, 'success');
            if (window.ToolbarHelpers) {
                ToolbarHelpers.flashToolbarButton('export-graph');
            }
        } else {
            this.showMessage(result.message, 'error');
        }
    },
    
    // Handle import graph
    handleImportGraph() {
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) {
            fileInput.click();
        }
    },
    
    // Setup file import handling
    setupFileImport() {
        const fileInput = document.getElementById('import-file-input');
        if (!fileInput) return;
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    const result = GraphStorage.importGraph(jsonData);
                    
                    if (result.success) {
                        this.showMessage(result.message, 'success');
                        if (window.ToolbarHelpers) {
                            ToolbarHelpers.flashToolbarButton('import-graph');
                        }
                    } else {
                        this.showMessage(result.message, 'error');
                    }
                } catch (error) {
                    this.showMessage('Invalid JSON file', 'error');
                }
                
                // Reset file input
                event.target.value = '';
            };
            
            reader.readAsText(file);
        });
    },
    
    // Show message to user
    showMessage(message, type = 'info') {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#27AE60';
                break;
            case 'error':
                toast.style.backgroundColor = '#E74C3C';
                break;
            case 'info':
            default:
                toast.style.backgroundColor = '#3498DB';
                break;
        }
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    },
    
    // Show save modal
    showSaveModal() {
        const modal = document.getElementById('graph-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const actionBtn = document.getElementById('modal-action');
        
        title.textContent = 'Save Graph';
        actionBtn.textContent = 'Save';
        
        body.innerHTML = `
            <div class="form-group">
                <label for="save-name">Graph Name:</label>
                <input type="text" id="save-name" value="My Graph" required>
            </div>
            <div class="form-group">
                <label for="save-description">Description (optional):</label>
                <textarea id="save-description" placeholder="Enter a description for this graph..."></textarea>
            </div>
        `;
        
        this.showModal(modal, () => {
            const name = document.getElementById('save-name').value.trim();
            const description = document.getElementById('save-description').value.trim();
            
            if (!name) {
                this.showMessage('Please enter a graph name', 'error');
                return false;
            }
            
            const result = GraphStorage.saveGraph(name, description);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                if (window.ToolbarHelpers) {
                    ToolbarHelpers.flashToolbarButton('save-graph');
                }
                return true;
            } else {
                this.showMessage(result.message, 'error');
                return false;
            }
        });
    },
    
    // Show load modal
    showLoadModal() {
        const graphs = GraphStorage.getGraphList();
        const graphIds = Object.keys(graphs);
        
        if (graphIds.length === 0) {
            this.showMessage('No saved graphs found', 'info');
            return;
        }
        
        const modal = document.getElementById('graph-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        const actionBtn = document.getElementById('modal-action');
        
        title.textContent = 'Load Graph';
        actionBtn.textContent = 'Load';
        
        let selectedGraphId = null;
        
        body.innerHTML = `
            <div class="graph-list">
                ${graphIds.map(id => {
                    const graph = graphs[id];
                    return `
                        <div class="graph-item" data-graph-id="${id}">
                            <div class="graph-item-header">
                                <span class="graph-item-name">${graph.name}</span>
                                <span class="graph-item-date">${new Date(graph.timestamp).toLocaleDateString()}</span>
                            </div>
                            ${graph.description ? `<div class="graph-item-description">${graph.description}</div>` : ''}
                            <div class="graph-item-stats">
                                <span>Nodes: ${graph.nodeCount || 0}</span>
                                <span>Connections: ${graph.linkCount || 0}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add click handlers for graph selection
        body.querySelectorAll('.graph-item').forEach(item => {
            item.addEventListener('click', () => {
                body.querySelectorAll('.graph-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                selectedGraphId = item.dataset.graphId;
            });
        });
        
        this.showModal(modal, () => {
            if (!selectedGraphId) {
                this.showMessage('Please select a graph to load', 'error');
                return false;
            }
            
            const result = GraphStorage.loadGraph(selectedGraphId);
            
            if (result.success) {
                this.showMessage(result.message, 'success');
                if (window.ToolbarHelpers) {
                    ToolbarHelpers.flashToolbarButton('load-graph');
                }
                return true;
            } else {
                this.showMessage(result.message, 'error');
                return false;
            }
        });
    },
    
    // Generic modal display with action handler
    showModal(modal, onAction) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = document.getElementById('modal-cancel');
        const actionBtn = document.getElementById('modal-action');
        
        const closeModal = () => {
            modal.style.display = 'none';
        };
        
        const handleAction = () => {
            if (onAction && onAction()) {
                closeModal();
            }
        };
        
        // Remove existing event listeners
        closeBtn.onclick = null;
        cancelBtn.onclick = null;
        actionBtn.onclick = null;
        modal.onclick = null;
        
        // Add event listeners
        closeBtn.onclick = closeModal;
        cancelBtn.onclick = closeModal;
        actionBtn.onclick = handleAction;
        
        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
        
        // Show modal
        modal.style.display = 'flex';
        
        // Focus first input if available
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            firstInput.focus();
            if (firstInput.type === 'text') {
                firstInput.select();
            }
        }
    }
};

// Make Application available globally
window.Application = Application;