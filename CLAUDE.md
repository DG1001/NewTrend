# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Trendows Web Prototype - a web-based visual node editor for creating sensor monitoring and data processing flows. It's built for Kirsten Controls and simulates industrial monitoring scenarios with sensors, displays, formulas, and alarms.

## Architecture

The application consists of three main files:

- `index.html` - Main HTML structure with toolbar and canvas layout
- `app.js` - Core application logic implementing the LiteGraph.js-based node editor
- `styles.css` - Complete styling including node type-specific visual elements

### Key Components

**Node System (app.js:73-299)**
- `SensorNode` - Generates simulated sensor data (temperature, humidity, pressure, flow, or custom ranges)
- `DisplayNode` - Shows real-time values with optional mini-graphs
- `FormulaNode` - Performs calculations using basic operations or custom JavaScript formulas
- `AlarmNode` - Triggers alerts based on threshold conditions

**Simulation Engine (app.js:653-774)**
- Global simulation state controlled by `simulationRunning` flag
- Nodes only generate/process data when simulation is active
- Real-time updates via 100ms intervals with visual feedback

**Properties Panel (app.js:365-643)**
- Dynamic property editor that adapts to selected node type
- Live preview for formula operations and alarm conditions
- Immediate updates with visual confirmation

## Development

This is a vanilla JavaScript application using:
- LiteGraph.js (v0.7.14) for the visual node editor
- Font Awesome (v5.15.4) for icons
- No build system or package manager

To run: Open `index.html` in a web browser.

## Code Patterns

**Node Registration**: All custom nodes extend `LiteGraph.LGraphNode` and are registered with `LiteGraph.registerNodeType()`

**Simulation Control**: Check `simulationRunning` before generating new data in `onExecute()` methods

**Property Updates**: Use the centralized `showNodeProperties()` function for consistent property panel generation

**Visual Feedback**: The `flashToolbarButton()` helper provides consistent user feedback for all interactions