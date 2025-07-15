// Toolbar helper functions and node creation utilities
const ToolbarHelpers = {
    // Create a node and add it to the graph with visual feedback
    createNode(nodeType, position, buttonId) {
        const node = LiteGraph.createNode(nodeType);
        if (!node) {
            console.error(`Failed to create node of type: ${nodeType}`);
            return null;
        }
        
        // Set position with some randomization
        const baseX = position.x || 100;
        const baseY = position.y || 100;
        node.pos = [
            baseX + Math.random() * 300,
            baseY + Math.random() * 200
        ];
        
        // Add to graph
        graph.add(node);
        
        // Show properties automatically
        graph.selectNode(node);
        if (window.showNodeProperties) {
            showNodeProperties(node);
        }
        
        // Visual feedback
        if (buttonId) {
            this.flashToolbarButton(buttonId);
        }
        
        return node;
    },
    
    // Visual feedback for toolbar buttons
    flashToolbarButton(buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        const originalColor = button.style.backgroundColor;
        const originalTransform = button.style.transform;
        
        button.style.backgroundColor = "#27AE60";
        button.style.transform = "scale(1.1)";
        
        setTimeout(() => {
            button.style.backgroundColor = originalColor;
            button.style.transform = originalTransform;
        }, 200);
    },
    
    // Node creation functions for toolbar buttons
    createSensorNode() {
        return this.createNode("trendows/sensor", { x: 100, y: 100 }, "add-sensor");
    },
    
    createDisplayNode() {
        return this.createNode("trendows/display", { x: 500, y: 100 }, "add-display");
    },
    
    createConstantNode() {
        return this.createNode("trendows/constant", { x: 200, y: 500 }, "add-constant");
    },

    createButtonNode() {
        return this.createNode("trendows/button", { x: 350, y: 500 }, "add-button");
    },
    
    createFormulaNode() {
        return this.createNode("trendows/formula", { x: 300, y: 300 }, "add-formula");
    },
    
    createAlarmNode() {
        return this.createNode("trendows/alarm", { x: 500, y: 300 }, "add-alarm");
    },
    
    createFilterNode() {
        return this.createNode("trendows/filter", { x: 100, y: 400 }, "add-filter");
    },
    
    createStatisticsNode() {
        return this.createNode("trendows/statistics", { x: 300, y: 400 }, "add-statistics");
    },
    
    createTimerNode() {
        return this.createNode("trendows/timer", { x: 500, y: 400 }, "add-timer");
    },
    
    createAndGateNode() {
        return this.createNode("trendows/and", { x: 100, y: 600 }, "add-and");
    },
    
    createOrGateNode() {
        return this.createNode("trendows/or", { x: 250, y: 600 }, "add-or");
    },
    
    createNotGateNode() {
        return this.createNode("trendows/not", { x: 400, y: 600 }, "add-not");
    },
    
    createComparatorNode() {
        return this.createNode("trendows/comparator", { x: 550, y: 600 }, "add-comparator");
    },
    
    createCounterNode() {
        return this.createNode("trendows/counter", { x: 700, y: 600 }, "add-counter");
    },
    
    createPidNode() {
        return this.createNode("trendows/pid", { x: 850, y: 600 }, "add-pid");
    },
    
    createGaugeNode() {
        return this.createNode("trendows/gauge", { x: 100, y: 100 }, "add-gauge");
    },
    
    createChartNode() {
        return this.createNode("trendows/chart", { x: 300, y: 100 }, "add-chart");
    },
    
    createLedNode() {
        return this.createNode("trendows/led", { x: 500, y: 100 }, "add-led");
    }
};

// Make ToolbarHelpers available globally
window.ToolbarHelpers = ToolbarHelpers;