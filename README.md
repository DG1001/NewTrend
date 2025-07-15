# Trendows Web Technical Preview

A web-based visual node editor for creating sensor monitoring and data processing flows. This is a **technical preview prototype** of the Trendows standard software, built for Kirsten Controls to demonstrate industrial monitoring scenarios with real-time data visualization.

For more information about the full Trendows software suite, visit: https://www.kirsten-controls.de/kirsten-wp/trendows2/

## Features

- **Visual Node Editor**: Drag-and-drop interface powered by LiteGraph.js
- **Real-time Simulation**: Live sensor data generation and processing
- **Comprehensive Node Library** (23 node types):
  
  **Data Sources & Display:**
  - 🌡️ **Sensor Nodes**: Temperature, humidity, pressure, flow, and custom ranges
  - 📊 **Display Nodes**: Real-time values with optional mini-graphs
  - 🔢 **Constant Nodes**: Fixed value sources for calculations
  - 🖱️ **Button Nodes**: Interactive buttons for triggering events (boolean output)
  - 🎛️ **Switch Nodes**: Toggle switches for persistent on/off states (boolean output)
  - 📊 **Slider Nodes**: Adjustable sliders for numeric input with configurable ranges
  - 📡 **MQTT Nodes**: Real-time data from MQTT brokers (WebSocket connection, float values)
  
  **Processing & Analysis:**
  - 🔍 **Filter Nodes**: Moving average, median, and low-pass filtering
  - 📈 **Statistics Nodes**: Real-time min/max/average calculations
  - 🧮 **Formula Nodes**: Mathematical operations and custom JavaScript formulas
  - 📊 **FFT Nodes**: Fast Fourier Transform for frequency domain analysis with windowing
  - 🧠 **Compute Nodes**: Visual programming with Blockly for complex logic and calculations
  
  **Enhanced Visualization:**
  - 📊 **Gauge Nodes**: Analog-style circular gauges with color-coded warning zones
  - 📈 **Chart Nodes**: Time-series line charts with multi-trace support and auto-scaling
  - 💡 **LED Indicators**: Multi-state visual status indicators with blinking effects (supports both numeric and boolean inputs)
  
  **Logic & Control:**
  - ⚡ **Logic Gates**: AND, OR, NOT gates with expandable inputs
  - ⚖️ **Comparator Nodes**: Three-output comparison (greater, equal, less)
  - 🔢 **Counter Nodes**: Edge-triggered counting with overflow detection (supports boolean triggers)
  
  **Automation & Monitoring:**
  - ⏱️ **Timer Nodes**: Interval and timeout-based operations
  - 🎛️ **PID Controller**: Full industrial automation control
  - 🚨 **Alarm Nodes**: Threshold-based alerting system

- **Interactive Properties Panel**: Configure node settings in real-time
- **Simulation Controls**: Start/stop data generation with timing display

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required
- For MQTT connectivity: Access to an MQTT broker with WebSocket support

### Running the Application

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start creating your monitoring flow:
   - Click toolbar buttons to add nodes
   - Connect nodes by dragging from output to input ports
   - Select nodes to edit properties in the right panel
   - Use "Simulation starten" to begin real-time data flow

### Development Setup

For development and extending the node library:

1. **File Structure**: All nodes are organized in `js/nodes/` by category
2. **No Build Process**: Direct file editing - changes are immediately visible on page refresh
3. **Browser DevTools**: Use F12 for debugging and console output
4. **Local Development**: Serve via local HTTP server for full functionality (due to CORS restrictions)

## Usage

### Creating a Basic Flow

1. **Add a Sensor**: Click "Sensor" to create a data source
2. **Add Visualization**: Click "Gauge", "Chart", or "Anzeige" to visualize the data
3. **Connect Them**: Drag from the sensor's output port to the visualization's input port
4. **Configure**: Select each node to customize properties in the right panel
5. **Simulate**: Click "Simulation starten" to see live data with real-time updates

### Interactive Control Elements

1. **Button Controls**: Add Button nodes for manual triggering of events
2. **Switch Controls**: Use Switch nodes for persistent on/off states
3. **Slider Controls**: Add Slider nodes for adjustable numeric inputs
4. **Boolean Logic**: Connect buttons/switches to Counter nodes or LED indicators for interactive control
5. **Manual Override**: Use interactive nodes to manually control automation systems
6. **MQTT Integration**: Connect to MQTT brokers to receive real-time sensor data from IoT devices

### Building Advanced Monitoring Systems

1. **Industrial Dashboard**: Combine Gauge nodes for pressure/temperature monitoring
2. **Trend Analysis**: Use Chart nodes to track multiple sensors over time
3. **Alarm Systems**: Connect LED indicators to Comparator nodes for visual alerts
4. **Process Control**: Implement PID controllers with real-time feedback loops
5. **Data Processing**: Chain Filter and Statistics nodes for signal conditioning
6. **Spectral Analysis**: Use FFT nodes for vibration monitoring and frequency analysis
7. **IoT Integration**: Connect MQTT nodes to receive live data from IoT sensors and devices
8. **Interactive Control**: Use Button, Switch, and Slider nodes for manual system control
9. **Real-time Analytics**: Combine FFT, Statistics, and Filter nodes for signal analysis
10. **Multi-signal Processing**: Mix numeric and boolean signals in complex logic flows
11. **Visual Programming**: Use Compute nodes with Blockly for complex logic without writing code
12. **Custom Algorithms**: Create sophisticated data processing pipelines with visual programming blocks

### Advanced Features

- **Custom Formulas**: Use JavaScript expressions like `a * b + 10` or `Math.sin(a)`
- **Visual Programming**: Create complex logic with Blockly drag-and-drop programming interface
- **Logic Gate Operations**: Expandable inputs for complex boolean logic
- **PID Control**: Proportional-Integral-Derivative control with tunable parameters
- **Statistical Analysis**: Real-time data filtering and statistical calculations
- **Event Counting**: Edge-triggered counters with configurable thresholds
- **Multi-output Comparison**: Three-way comparisons with tolerance settings
- **Timer Operations**: Interval-based and timeout control systems
- **Professional Visualization**: Industrial-grade gauges, real-time charts, and status indicators
- **Time-series Analysis**: Configurable time windows with automatic data history management
- **Visual Status Feedback**: Color-coded indicators with blinking alarms and smooth animations
- **Custom Sensor Ranges**: Define min/max values for realistic simulations
- **Graph Visualization**: Enable mini-graphs in display nodes for trend analysis
- **Interactive Controls**: Button, switch, and slider nodes for manual system control
- **Boolean Signal Processing**: Direct boolean connections for logic operations and event triggering
- **Mixed Signal Types**: Seamless integration of numeric and boolean signals in the same flow
- **Frequency Domain Analysis**: FFT processing with configurable window functions and sizes
- **Spectral Monitoring**: Real-time peak frequency detection and magnitude analysis
- **IoT Connectivity**: MQTT integration for receiving real-time data from IoT devices and sensors
- **Real-time Data Streaming**: WebSocket-based MQTT connections for live data visualization
- **Visual Programming**: Blockly-based drag-and-drop programming for complex logic without coding
- **Dynamic Code Generation**: Automatic JavaScript code generation from visual blocks with real-time execution

## Project Structure

```
├── index.html              # Main application layout and HTML structure
├── styles.css              # All CSS styles for the application
├── js/                       # Modular JavaScript source code
│   ├── main.js             # Main entry point, initializes the application
│   ├── core/               # Core application components
│   │   ├── Application.js      # Main application class, manages the graph and simulation
│   │   ├── NodeRegistry.js     # Manages registration of all node types
│   │   ├── PropertyPanel.js    # Handles the dynamic property panel for nodes
│   │   └── SimulationEngine.js # Controls the real-time data simulation
│   ├── nodes/                # All custom node definitions, categorized by function
│   │   ├── automation/
│   │   │   ├── AlarmNode.js
│   │   │   ├── PidControllerNode.js
│   │   │   └── TimerNode.js
│   │   ├── base/
│   │   │   └── BaseNode.js       # Base class for all custom nodes
│   │   ├── logic/
│   │   │   ├── AndGateNode.js
│   │   │   ├── ComparatorNode.js
│   │   │   ├── CounterNode.js
│   │   │   ├── NotGateNode.js
│   │   │   └── OrGateNode.js
│   │   ├── processing/
│   │   │   ├── ComputeNode.js
│   │   │   ├── FilterNode.js
│   │   │   ├── FormulaNode.js
│   │   │   ├── FFTNode.js
│   │   │   └── StatisticsNode.js
│   │   ├── sensors/
│   │   │   ├── ButtonNode.js
│   │   │   ├── ConstantNode.js
│   │   │   ├── DisplayNode.js
│   │   │   ├── MQTTNode.js
│   │   │   ├── SensorNode.js
│   │   │   ├── SliderNode.js
│   │   │   └── SwitchNode.js
│   │   └── visualization/
│   │       ├── ChartNode.js
│   │       ├── GaugeNode.js
│   │       └── LedIndicatorNode.js
│   └── utils/                # Utility functions and classes
│       ├── SensorData.js       # Manages historical data for sensors
│       ├── ToolbarHelpers.js   # Helper functions for creating toolbar buttons
│       ├── FFTHelper.js        # FFT algorithms and windowing functions
│       └── BlocklyHelper.js    # Blockly visual programming integration
├── AGENTS.md               # Guidance for AI agents working on this project
├── CLAUDE.md               # AI development guidance (legacy)
└── README.md               # This file
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Node Editor**: [LiteGraph.js](https://github.com/jagenjo/litegraph.js) v0.7.14
- **Icons**: Font Awesome v5.15.4
- **MQTT**: [MQTT.js](https://github.com/mqttjs/MQTT.js) for WebSocket connections
- **No Build System**: Direct browser execution

## Development

This is a client-side only application with no backend dependencies. All simulation data is generated in the browser using JavaScript.

### Extending the Node Library

The application is designed for easy extension with new node types. See `CLAUDE.md` for comprehensive development guidelines.

#### Quick Start: Adding a New Node

1. **Create Node Class**: Add a new file in `js/nodes/[category]/` extending `BaseNode`
2. **Register Node**: Add registration in `js/core/NodeRegistry.js`
3. **Add Properties**: Implement property panel support in `js/core/PropertyPanel.js`
4. **Add Toolbar**: Create toolbar button and helper in `js/utils/ToolbarHelpers.js`
5. **Update HTML**: Add script tag and toolbar button to `index.html`
6. **Update Docs**: Increment node count and add feature description

#### Node Categories

- **sensors/**: Data input nodes (sensors, manual controls, external data)
- **processing/**: Data transformation nodes (filters, math, analysis)
- **visualization/**: Display nodes (charts, gauges, indicators)
- **logic/**: Boolean logic and control flow nodes
- **automation/**: Control systems and automation nodes

#### Development Best Practices

- Follow the existing naming conventions and file structure
- Use consistent visual styling (colors, fonts, layouts)
- Implement proper error handling and input validation
- Add comprehensive property panels for configuration
- Include visual feedback and status indicators
- Document new features in both README.md and CLAUDE.md

### Key Components

- **Node System**: 23 custom node types extending LiteGraph.LGraphNode
- **Simulation Engine**: 100ms interval-based real-time updates with time tracking
- **Property Management**: Dynamic UI generation with color-coded panels
- **Visualization Engine**: Canvas-based rendering for gauges, charts, and indicators
- **Data Management**: Efficient time-series storage with automatic cleanup
- **Visual Feedback**: Smooth animations, blinking effects, and status indicators

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

This project is licensed under the Kirsten Controls Non-Commercial License. 

**Non-Commercial Use**: You are free to use, modify, and distribute this software for personal, educational, research, and other non-commercial purposes.

**Commercial Use**: All commercial rights are reserved by Kirsten Controlsystems. Commercial use requires a separate commercial license. Please contact Kirsten Controlsystems for commercial licensing inquiries.

See the [LICENSE](LICENSE) file for full license terms.

## Contact

For questions or support regarding this technical preview prototype, please contact the Kirsten Controls development team.

For information about the full Trendows software suite and commercial licensing, visit: https://www.kirsten-controls.de/kirsten-wp/trendows2/
