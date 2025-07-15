# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Trendows Web Prototype - a web-based visual node editor for creating sensor monitoring and data processing flows. It's built for Kirsten Controls and simulates industrial monitoring scenarios with sensors, displays, formulas, alarms, and IoT connectivity.

## Architecture

The application uses a **modular architecture** with separate files for each component:

- `index.html` - Main HTML structure with toolbar and canvas layout
- `styles.css` - Complete styling including node type-specific visual elements
- `js/` - Modular JavaScript source code organized by functionality

### Core Modules

**Application Core (`js/core/`)**
- `Application.js` - Main application class, manages the graph and simulation
- `NodeRegistry.js` - Manages registration of all node types
- `PropertyPanel.js` - Handles the dynamic property panel for nodes
- `SimulationEngine.js` - Controls the real-time data simulation

**Node System (`js/nodes/`)**
- **22 custom node types** organized by category:
  - `sensors/` - Data sources (SensorNode, DisplayNode, ButtonNode, SwitchNode, SliderNode, MQTTNode, ConstantNode)
  - `processing/` - Data processing (FilterNode, FormulaNode, StatisticsNode, FFTNode)
  - `visualization/` - Visual displays (GaugeNode, ChartNode, LedIndicatorNode)
  - `logic/` - Logic operations (AndGateNode, OrGateNode, NotGateNode, ComparatorNode, CounterNode)
  - `automation/` - Control systems (TimerNode, PidControllerNode, AlarmNode)
  - `base/` - BaseNode class for common functionality

**Utilities (`js/utils/`)**
- `SensorData.js` - Manages historical data for sensors
- `ToolbarHelpers.js` - Helper functions for creating toolbar buttons
- `FFTHelper.js` - FFT algorithms and windowing functions

## Development

This is a vanilla JavaScript application using:
- LiteGraph.js (v0.7.14) for the visual node editor
- Font Awesome (v5.15.4) for icons
- MQTT.js for WebSocket MQTT connections
- No build system or package manager

To run: Open `index.html` in a web browser.

## Adding New Nodes

### Step-by-Step Guide

**1. Create Node Class File**
Create a new file in the appropriate category folder under `js/nodes/`:
```javascript
// Example: js/nodes/sensors/MyNewNode.js
class MyNewNode extends BaseNode {
    constructor() {
        super();
        this.title = 'My Node';
        this.addInput('input', 'number');
        this.addOutput('output', 'number');
        this.properties = {
            myProperty: 'default value',
            name: 'My Node 1'
        };
        this.size = [140, 60];
        this.color = "#3498DB";
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input !== undefined) {
            // Process input and set output
            this.setOutputData(0, input * 2);
        }
    }
    
    onPropertyChanged(name, value) {
        if (name === 'myProperty') {
            this.properties.myProperty = value;
        }
    }
    
    onDrawForeground(ctx) {
        // Optional: Custom drawing on the node
        this.drawText(ctx, this.properties.myProperty, this.size[0] * 0.5, this.size[1] * 0.7);
    }
}

window.MyNewNode = MyNewNode;
```

**2. Register in NodeRegistry**
Add to `js/core/NodeRegistry.js`:
```javascript
if (window.MyNewNode) this.register(MyNewNode, "trendows/mynewnode");
```

**3. Add Properties Panel Support**
In `js/core/PropertyPanel.js`, add to `generateNodeProperties()`:
```javascript
case 'MyNewNode':
    return this.generateMyNewNodeProperties(node);
```

Add to update switch in `updateNodeProperties()`:
```javascript
case 'MyNewNode':
    this.updateMyNewNodeProperties(node);
    break;
```

Add property generation and update methods:
```javascript
generateMyNewNodeProperties(node) {
    return `
        <div class="property">
            <label>My Property:</label>
            <input type="text" id="prop-myProperty" value="${node.properties.myProperty}">
        </div>
    `;
},

updateMyNewNodeProperties(node) {
    const myPropertyField = document.getElementById("prop-myProperty");
    if (myPropertyField) {
        node.properties.myProperty = myPropertyField.value;
        if (node.onPropertyChanged) {
            node.onPropertyChanged('myProperty', myPropertyField.value);
        }
    }
},
```

**4. Add Toolbar Support**
Add to `js/utils/ToolbarHelpers.js`:
```javascript
createMyNewNode() {
    return this.createNode("trendows/mynewnode", { x: 300, y: 400 }, "add-mynewnode");
},
```

Add to `js/core/Application.js`:
```javascript
this.bindEvent("add-mynewnode", () => helpers.createMyNewNode());
```

**5. Add to HTML**
Add toolbar button to `index.html`:
```html
<button id="add-mynewnode"><i class="fas fa-icon-name"></i> My Node</button>
```

Add script tag to `index.html`:
```html
<script src="js/nodes/sensors/MyNewNode.js"></script>
```

**6. Update Documentation**
- Update node count in README.md
- Add node description to feature list
- Update project structure diagram

### Best Practices

**Node Design**
- Extend `BaseNode` for common functionality
- Use descriptive titles and property names
- Choose appropriate colors for visual grouping
- Implement `onPropertyChanged()` for dynamic updates
- Check `simulationRunning` flag for data generation nodes

**Property Panel**
- Provide clear labels and helpful descriptions
- Use appropriate input types (text, number, select, checkbox)
- Include validation and error handling
- Show real-time status information when relevant

**Visual Design**
- Use consistent color schemes by category
- Implement `onDrawForeground()` for custom displays
- Show current values, status indicators, and mini-visualizations
- Use the `drawText()` and `drawIndicator()` helper methods

**Error Handling**
- Handle undefined inputs gracefully
- Provide meaningful error messages
- Use try-catch blocks for external connections (MQTT, WebSocket)
- Implement cleanup in `onRemoved()` when necessary

## Code Patterns

**Node Registration**: All custom nodes extend `BaseNode` and are registered with `NodeRegistry.register()`

**Simulation Control**: Check `simulationRunning` before generating new data in `onExecute()` methods

**Property Updates**: Use the centralized `PropertyPanel` system for consistent UI generation

**Visual Feedback**: Use `ToolbarHelpers.flashToolbarButton()` for user interaction feedback

**Data Flow**: Use `getInputData()` and `setOutputData()` for node connections

**Type Safety**: Support both numeric and boolean signal types with proper connection handling