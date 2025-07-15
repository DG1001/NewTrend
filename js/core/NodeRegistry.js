// Node registration and management
const NodeRegistry = {
    // Registry of all node types
    nodeTypes: new Map(),
    
    // Register a single node type
    register(nodeClass, typeName) {
        if (typeof nodeClass !== 'function') {
            console.error(`Invalid node class for type: ${typeName}`);
            return;
        }
        
        // Set the type on the class
        nodeClass.type = typeName;
        
        // Register with LiteGraph
        LiteGraph.registerNodeType(typeName, nodeClass);
        
        // Store in our registry
        this.nodeTypes.set(typeName, nodeClass);
        
        console.log(`Registered node type: ${typeName}`);
    },
    
    // Register all available node types
    registerAll() {
        // Data Sources & Display
        if (window.SensorNode) this.register(SensorNode, "trendows/sensor");
        if (window.DisplayNode) this.register(DisplayNode, "trendows/display");
        if (window.ConstantNode) this.register(ConstantNode, "trendows/constant");
        if (window.ButtonNode) this.register(ButtonNode, "trendows/button");
        if (window.SwitchNode) this.register(SwitchNode, "trendows/switch");
        if (window.SliderNode) this.register(SliderNode, "trendows/slider");
        
        // Processing & Analysis
        if (window.FilterNode) this.register(FilterNode, "trendows/filter");
        if (window.StatisticsNode) this.register(StatisticsNode, "trendows/statistics");
        if (window.FormulaNode) this.register(FormulaNode, "trendows/formula");
        
        // Visualization
        if (window.GaugeNode) this.register(GaugeNode, "trendows/gauge");
        if (window.ChartNode) this.register(ChartNode, "trendows/chart");
        if (window.LedIndicatorNode) this.register(LedIndicatorNode, "trendows/led");
        
        // Logic & Control
        if (window.AndGateNode) this.register(AndGateNode, "trendows/and");
        if (window.OrGateNode) this.register(OrGateNode, "trendows/or");
        if (window.NotGateNode) this.register(NotGateNode, "trendows/not");
        if (window.ComparatorNode) this.register(ComparatorNode, "trendows/comparator");
        if (window.CounterNode) this.register(CounterNode, "trendows/counter");
        
        // Automation
        if (window.TimerNode) this.register(TimerNode, "trendows/timer");
        if (window.PidControllerNode) this.register(PidControllerNode, "trendows/pid");
        if (window.AlarmNode) this.register(AlarmNode, "trendows/alarm");
        
        console.log(`Registered ${this.nodeTypes.size} node types`);
    },
    
    // Get a registered node class
    getNodeClass(typeName) {
        return this.nodeTypes.get(typeName);
    },
    
    // Get all registered node types
    getAllTypes() {
        return Array.from(this.nodeTypes.keys());
    },
    
    // Check if a node type is registered
    isRegistered(typeName) {
        return this.nodeTypes.has(typeName);
    }
};

// Make NodeRegistry available globally
window.NodeRegistry = NodeRegistry;