# Trendows Web Prototype

A web-based visual node editor for creating sensor monitoring and data processing flows. Built for Kirsten Controls to simulate industrial monitoring scenarios with real-time data visualization.

## Features

- **Visual Node Editor**: Drag-and-drop interface powered by LiteGraph.js
- **Real-time Simulation**: Live sensor data generation and processing
- **Comprehensive Node Library** (20 node types):
  
  **Data Sources & Display:**
  - 🌡️ **Sensor Nodes**: Temperature, humidity, pressure, flow, and custom ranges
  - 📊 **Display Nodes**: Real-time values with optional mini-graphs
  - 🔢 **Constant Nodes**: Fixed value sources for calculations
  - 🖱️ **Button Nodes**: Interactive buttons for triggering events (boolean output)
  - 🎛️ **Switch Nodes**: Toggle switches for persistent on/off states (boolean output)
  - 📊 **Slider Nodes**: Adjustable sliders for numeric input with configurable ranges
  
  **Processing & Analysis:**
  - 🔍 **Filter Nodes**: Moving average, median, and low-pass filtering
  - 📈 **Statistics Nodes**: Real-time min/max/average calculations
  - 🧮 **Formula Nodes**: Mathematical operations and custom JavaScript formulas
  
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

### Running the Application

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Start creating your monitoring flow:
   - Click toolbar buttons to add nodes
   - Connect nodes by dragging from output to input ports
   - Select nodes to edit properties in the right panel
   - Use "Simulation starten" to begin real-time data flow

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

### Building Advanced Monitoring Systems

1. **Industrial Dashboard**: Combine Gauge nodes for pressure/temperature monitoring
2. **Trend Analysis**: Use Chart nodes to track multiple sensors over time
3. **Alarm Systems**: Connect LED indicators to Comparator nodes for visual alerts
4. **Process Control**: Implement PID controllers with real-time feedback loops
5. **Data Processing**: Chain Filter and Statistics nodes for signal conditioning

### Advanced Features

- **Custom Formulas**: Use JavaScript expressions like `a * b + 10` or `Math.sin(a)`
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
│   │   │   ├── FilterNode.js
│   │   │   ├── FormulaNode.js
│   │   │   └── StatisticsNode.js
│   │   ├── sensors/
│   │   │   ├── ButtonNode.js
│   │   │   ├── ConstantNode.js
│   │   │   ├── DisplayNode.js
│   │   │   ├── SensorNode.js
│   │   │   ├── SliderNode.js
│   │   │   └── SwitchNode.js
│   │   └── visualization/
│   │       ├── ChartNode.js
│   │       ├── GaugeNode.js
│   │       └── LedIndicatorNode.js
│   └── utils/                # Utility functions and classes
│       ├── SensorData.js       # Manages historical data for sensors
│       └── ToolbarHelpers.js   # Helper functions for creating toolbar buttons
├── AGENTS.md               # Guidance for AI agents working on this project
├── CLAUDE.md               # AI development guidance (legacy)
└── README.md               # This file
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Node Editor**: [LiteGraph.js](https://github.com/jagenjo/litegraph.js) v0.7.14
- **Icons**: Font Awesome v5.15.4
- **No Build System**: Direct browser execution

## Development

This is a client-side only application with no backend dependencies. All simulation data is generated in the browser using JavaScript.

### Key Components

- **Node System**: 20 custom node types extending LiteGraph.LGraphNode
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

Proprietary - Kirsten Controls

## Contact

For questions or support regarding this prototype, please contact the Kirsten Controls development team.
