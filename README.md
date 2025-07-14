# Trendows Web Prototype

A web-based visual node editor for creating sensor monitoring and data processing flows. Built for Kirsten Controls to simulate industrial monitoring scenarios with real-time data visualization.

## Features

- **Visual Node Editor**: Drag-and-drop interface powered by LiteGraph.js
- **Real-time Simulation**: Live sensor data generation and processing
- **Comprehensive Node Library** (14 node types):
  
  **Data Sources & Display:**
  - 🌡️ **Sensor Nodes**: Temperature, humidity, pressure, flow, and custom ranges
  - 📊 **Display Nodes**: Real-time values with optional mini-graphs
  - 🔢 **Constant Nodes**: Fixed value sources for calculations
  
  **Processing & Analysis:**
  - 🔍 **Filter Nodes**: Moving average, median, and low-pass filtering
  - 📈 **Statistics Nodes**: Real-time min/max/average calculations
  - 🧮 **Formula Nodes**: Mathematical operations and custom JavaScript formulas
  
  **Logic & Control:**
  - ⚡ **Logic Gates**: AND, OR, NOT gates with expandable inputs
  - ⚖️ **Comparator Nodes**: Three-output comparison (greater, equal, less)
  - 🔢 **Counter Nodes**: Edge-triggered counting with overflow detection
  
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

1. **Add a Sensor**: Click "Sensor hinzufügen" to create a data source
2. **Add a Display**: Click "Anzeige hinzufügen" to visualize the data
3. **Connect Them**: Drag from the sensor's output port to the display's input port
4. **Configure**: Select each node to customize properties
5. **Simulate**: Click "Simulation starten" to see live data

### Advanced Features

- **Custom Formulas**: Use JavaScript expressions like `a * b + 10` or `Math.sin(a)`
- **Logic Gate Operations**: Expandable inputs for complex boolean logic
- **PID Control**: Proportional-Integral-Derivative control with tunable parameters
- **Statistical Analysis**: Real-time data filtering and statistical calculations
- **Event Counting**: Edge-triggered counters with configurable thresholds
- **Multi-output Comparison**: Three-way comparisons with tolerance settings
- **Timer Operations**: Interval-based and timeout control systems
- **Custom Sensor Ranges**: Define min/max values for realistic simulations
- **Graph Visualization**: Enable mini-graphs in display nodes for trend analysis

## Project Structure

```
├── index.html      # Main application layout
├── app.js          # Core logic and node implementations
├── styles.css      # Complete styling and visual design
├── CLAUDE.md       # Development guidance
└── README.md       # This file
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Node Editor**: [LiteGraph.js](https://github.com/jagenjo/litegraph.js) v0.7.14
- **Icons**: Font Awesome v5.15.4
- **No Build System**: Direct browser execution

## Development

This is a client-side only application with no backend dependencies. All simulation data is generated in the browser using JavaScript.

### Key Components

- **Node System**: Custom node types extending LiteGraph.LGraphNode
- **Simulation Engine**: 100ms interval-based real-time updates
- **Property Management**: Dynamic UI generation based on node selection
- **Visual Feedback**: Animated buttons and status indicators

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## License

Proprietary - Kirsten Controls

## Contact

For questions or support regarding this prototype, please contact the Kirsten Controls development team.