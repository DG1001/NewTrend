# Trendows Web Prototype Development Guidelines

## Project Setup
- No build system or package manager
- Run: Open `index.html` directly in browser
- Test: Manual browser interaction

## Code Style
- Language: Vanilla JavaScript (ES6+)
- Indentation: 2 spaces
- Naming:
  - `camelCase` for variables/functions
  - `PascalCase` for classes/node types
- Imports: Inline script tags in `index.html`

## Node Development
- Extend `BaseNode` for custom nodes
- Register with `LiteGraph.registerNodeType()`
- Check `simulationRunning` before data generation
- Use `getInputData()` and `setOutputData()` for connections

## Error Handling
- Inline error checks
- Console warnings for non-critical issues
- Gracefully handle undefined inputs
- Avoid throwing errors that interrupt simulation

## Performance
- Optimize `onExecute()` methods
- Limit data generation to 100ms intervals
- Minimize DOM manipulations

## Dependencies
- LiteGraph.js (v0.7.14)
- Font Awesome (v5.15.4)
- No external libraries beyond these

## Testing
- Browser-based manual testing
- Verify node behaviors
- Test edge cases in complex configurations