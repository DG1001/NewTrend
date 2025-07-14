// Simulation engine for managing data generation and timing
const SimulationEngine = {
    // Simulation state
    running: false,
    interval: null,
    startTime: null,
    
    // Start the simulation
    start() {
        if (this.running) return;
        
        this.running = true;
        this.startTime = Date.now();
        
        // Update UI
        this.updateUI(true);
        
        // Start the simulation interval
        this.interval = setInterval(() => {
            if (window.graph) {
                graph.runStep();
            }
        }, 100);
        
        // Show simulation info
        this.showSimulationInfo(true);
        
        // Visual feedback
        if (window.ToolbarHelpers) {
            ToolbarHelpers.flashToolbarButton("start-sim");
        }
        
        console.log("Simulation started - generating sensor data");
    },
    
    // Stop the simulation
    stop() {
        if (!this.running) return;
        
        this.running = false;
        
        // Clear the interval
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        // Update UI
        this.updateUI(false);
        
        // Hide simulation info
        this.showSimulationInfo(false);
        
        // Visual feedback
        if (window.ToolbarHelpers) {
            ToolbarHelpers.flashToolbarButton("stop-sim");
        }
        
        console.log("Simulation stopped");
    },
    
    // Update UI buttons based on simulation state
    updateUI(running) {
        const startButton = document.getElementById("start-sim");
        const stopButton = document.getElementById("stop-sim");
        
        if (startButton) {
            if (running) {
                startButton.style.backgroundColor = "#27AE60";
                startButton.innerHTML = '<i class="fas fa-play"></i> Simulation läuft...';
            } else {
                startButton.style.backgroundColor = "";
                startButton.innerHTML = '<i class="fas fa-play"></i> Simulation starten';
            }
        }
        
        if (stopButton) {
            if (running) {
                stopButton.style.backgroundColor = "#E74C3C";
            } else {
                stopButton.style.backgroundColor = "";
            }
        }
    },
    
    // Show/hide simulation info overlay
    showSimulationInfo(show) {
        let infoElement = document.querySelector('.simulation-info');
        
        if (show && this.running) {
            if (!infoElement) {
                infoElement = document.createElement('div');
                infoElement.className = 'simulation-info';
                infoElement.innerHTML = `
                    <div class="sim-status">
                        <i class="fas fa-play-circle"></i>
                        <span>Simulation aktiv</span>
                    </div>
                    <div class="sim-time">
                        Laufzeit: <span id="sim-time-value">0s</span>
                    </div>
                `;
                
                const container = document.getElementById('canvas-container');
                if (container) {
                    container.appendChild(infoElement);
                }
            }
            
            infoElement.style.display = 'block';
            
            // Update time display
            this.updateTimeDisplay();
            this.timeUpdateInterval = setInterval(() => {
                this.updateTimeDisplay();
            }, 1000);
            
        } else {
            if (infoElement) {
                infoElement.style.display = 'none';
            }
            
            if (this.timeUpdateInterval) {
                clearInterval(this.timeUpdateInterval);
                this.timeUpdateInterval = null;
            }
        }
    },
    
    // Update the simulation time display
    updateTimeDisplay() {
        const timeElement = document.getElementById('sim-time-value');
        if (timeElement && this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            timeElement.textContent = `${elapsed}s`;
        }
    },
    
    // Get current simulation state
    isRunning() {
        return this.running;
    },
    
    // Get simulation start time
    getStartTime() {
        return this.startTime;
    },
    
    // Get elapsed time in milliseconds
    getElapsedTime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }
};

// Make SimulationEngine available globally
window.SimulationEngine = SimulationEngine;

// Also expose the running state globally for backward compatibility
Object.defineProperty(window, 'simulationRunning', {
    get() {
        return SimulationEngine.running;
    }
});