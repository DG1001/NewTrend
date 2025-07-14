// PID Controller Node - Full industrial automation control
class PidControllerNode extends BaseNode {
    constructor() {
        super();
        this.title = "PID Regler";
        this.addInput("Setpoint", "number");
        this.addInput("Process", "number");
        this.addInput("Reset", "boolean");
        this.addOutput("Output", "number");
        this.addOutput("Error", "number");
        this.properties = {
            kp: 1.0,
            ki: 0.1,
            kd: 0.01,
            outputMin: 0,
            outputMax: 100,
            name: "PID Regler 1"
        };
        this.size = [160, 100];
        this.color = "#2C3E50";
        this.lastError = 0;
        this.integral = 0;
        this.output = 0;
        this.lastTime = null;
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Reset PID",
                callback: () => {
                    this.lastError = 0;
                    this.integral = 0;
                    this.output = 0;
                    this.lastTime = null;
                }
            },
            {
                content: "Auto-tune",
                callback: () => {
                    // Simple auto-tuning - basic Ziegler-Nichols method
                    this.properties.kp = 0.6;
                    this.properties.ki = 0.12;
                    this.properties.kd = 0.075;
                }
            }
        ];
    }
    
    onExecute() {
        const setpoint = this.getInputData(0) || 0;
        const processValue = this.getInputData(1) || 0;
        const reset = this.getInputData(2);
        
        if (reset) {
            this.lastError = 0;
            this.integral = 0;
            this.output = 0;
            this.lastTime = null;
        }
        
        if (!simulationRunning) return;
        
        const currentTime = Date.now();
        if (this.lastTime === null) {
            this.lastTime = currentTime;
            return;
        }
        
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        if (deltaTime <= 0) return;
        
        // PID calculation
        const error = setpoint - processValue;
        
        // Proportional term
        const proportional = this.properties.kp * error;
        
        // Integral term with windup prevention
        this.integral += error * deltaTime;
        const maxIntegral = (this.properties.outputMax - this.properties.outputMin) / this.properties.ki;
        this.integral = Math.max(-maxIntegral, Math.min(maxIntegral, this.integral));
        const integral = this.properties.ki * this.integral;
        
        // Derivative term
        const derivative = this.properties.kd * (error - this.lastError) / deltaTime;
        
        // Calculate output
        this.output = proportional + integral + derivative;
        
        // Clamp output to limits
        this.output = Math.max(this.properties.outputMin, 
                              Math.min(this.properties.outputMax, this.output));
        
        // Store for next iteration
        this.lastError = error;
        this.lastTime = currentTime;
        
        // Set outputs
        this.setOutputData(0, this.output);
        this.setOutputData(1, error);
    }
    
    onDrawForeground(ctx) {
        // Display PID parameters
        ctx.font = "10px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "left";
        
        ctx.fillText(`Out: ${this.output.toFixed(1)}`, 10, 25);
        ctx.fillText(`Err: ${this.lastError.toFixed(1)}`, 90, 25);
        
        ctx.fillText(`P:${this.properties.kp.toFixed(2)}`, 10, 70);
        ctx.fillText(`I:${this.properties.ki.toFixed(2)}`, 60, 70);
        ctx.fillText(`D:${this.properties.kd.toFixed(3)}`, 110, 70);
    }
}

// Make PidControllerNode available globally  
window.PidControllerNode = PidControllerNode;