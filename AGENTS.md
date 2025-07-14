# Trendows Web Prototype Development Guidelines

## Project Setup
- No build system or package manager required
- Open `index.html` directly in a web browser to run

## Code Style Guidelines
- Vanilla JavaScript (ES6+)
- Use 2-space indentation
- Prefer `camelCase` for variables and functions
- Use `PascalCase` for class and node type names
- Extend `LiteGraph.LGraphNode` for custom node types
- Register custom nodes with `LiteGraph.registerNodeType()`

## Development Conventions
- Nodes must check `simulationRunning` before generating data
- Use centralized `showNodeProperties()` for property panel updates
- Utilize `flashToolbarButton()` for consistent UI feedback
- Avoid external dependencies beyond LiteGraph.js (v0.7.14)

## Error Handling
- Prefer inline error checks
- Use console warnings for non-critical issues
- Gracefully handle undefined or invalid inputs

## Testing
- Manual testing via browser interaction
- Verify node behavior under different simulation states
- Test edge cases in formula and alarm node configurations

## Performance
- Optimize node `onExecute()` methods
- Limit data generation to 100ms intervals
- Minimize DOM manipulations

## Recommended Tools
- Modern browser with JavaScript console
- LiteGraph.js documentation
- Font Awesome (v5.15.4) for icons