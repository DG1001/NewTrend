// MQTT Send Node - Sends float values to MQTT broker
class MQTTSendNode extends BaseNode {
    constructor() {
        super();
        this.title = 'MQTT Send';
        this.addInput('value', 'number');
        this.properties = {
            brokerIP: 'localhost',
            wsPort: 1884,
            topic: 'sensors/output',
            name: 'MQTT Send 1',
            sendOnChange: true,
            sendInterval: 1000
        };
        this.size = [140, 80];
        this.color = "#E67E22";
        
        // MQTT connection state
        this.client = null;
        this.connected = false;
        this.lastValue = null;
        this.lastMessage = '';
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.sendTimer = null;
        this.lastSentTime = 0;
        
        // Try to connect on creation
        this.connectToMQTT();
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: this.connected ? "Disconnect" : "Connect",
                callback: () => {
                    if (this.connected) {
                        this.disconnect();
                    } else {
                        this.connectToMQTT();
                    }
                }
            },
            {
                content: "Reset Connection",
                callback: () => {
                    this.disconnect();
                    this.connectionAttempts = 0;
                    setTimeout(() => this.connectToMQTT(), 1000);
                }
            },
            {
                content: "Send Now",
                callback: () => {
                    if (this.connected && this.lastValue !== null) {
                        this.sendValue(this.lastValue);
                    }
                }
            }
        ];
    }
    
    connectToMQTT() {
        // Check if MQTT library is available
        if (typeof mqtt === 'undefined') {
            console.error('MQTT library not loaded');
            this.lastMessage = 'MQTT library missing';
            return;
        }
        
        // Don't try to connect if already connected or too many attempts
        if (this.connected || this.connectionAttempts >= this.maxRetries) {
            return;
        }
        
        this.connectionAttempts++;
        this.lastMessage = 'Connecting...';
        
        try {
            // Create MQTT client using dedicated WebSocket port
            const brokerUrl = `ws://${this.properties.brokerIP}:${this.properties.wsPort}`;
            this.client = mqtt.connect(brokerUrl, {
                clientId: `trendows_send_${Math.random().toString(16).substr(2, 8)}`,
                clean: true,
                connectTimeout: 5000,
                reconnectPeriod: 0 // Disable automatic reconnection
            });
            
            // Connection successful
            this.client.on('connect', () => {
                this.connected = true;
                this.lastMessage = 'Connected';
                this.connectionAttempts = 0;
                
                // Start interval sending if enabled
                this.setupSendTimer();
            });
            
            // Handle connection errors
            this.client.on('error', (error) => {
                console.error('MQTT connection error:', error);
                this.connected = false;
                this.lastMessage = 'Connection failed';
                this.client = null;
                this.clearSendTimer();
            });
            
            // Handle disconnection
            this.client.on('close', () => {
                this.connected = false;
                this.lastMessage = 'Disconnected';
                this.clearSendTimer();
            });
            
        } catch (error) {
            console.error('MQTT setup error:', error);
            this.lastMessage = 'Setup failed';
            this.connected = false;
        }
    }
    
    disconnect() {
        if (this.client) {
            this.client.end();
            this.client = null;
        }
        this.connected = false;
        this.lastMessage = 'Disconnected';
        this.clearSendTimer();
    }
    
    setupSendTimer() {
        this.clearSendTimer();
        if (!this.properties.sendOnChange && this.properties.sendInterval > 0) {
            this.sendTimer = setInterval(() => {
                if (this.connected && this.lastValue !== null) {
                    this.sendValue(this.lastValue);
                }
            }, this.properties.sendInterval);
        }
    }
    
    clearSendTimer() {
        if (this.sendTimer) {
            clearInterval(this.sendTimer);
            this.sendTimer = null;
        }
    }
    
    sendValue(value) {
        if (!this.connected || !this.client) {
            return;
        }
        
        try {
            const message = value.toString();
            this.client.publish(this.properties.topic, message, { qos: 0 }, (error) => {
                if (error) {
                    console.error('MQTT publish error:', error);
                    this.lastMessage = 'Send failed';
                } else {
                    this.lastMessage = `Sent: ${value}`;
                    this.lastSentTime = Date.now();
                }
            });
        } catch (error) {
            console.error('MQTT send error:', error);
            this.lastMessage = 'Send error';
        }
    }
    
    onExecute() {
        const inputValue = this.getInputData(0);
        
        if (inputValue !== undefined && inputValue !== this.lastValue) {
            this.lastValue = inputValue;
            
            // Send immediately if sendOnChange is enabled
            if (this.properties.sendOnChange && this.connected) {
                this.sendValue(inputValue);
            }
        }
    }
    
    onPropertyChanged(name, value) {
        if (name === 'brokerIP') {
            this.properties.brokerIP = value;
            this.reconnectWithNewSettings();
        } else if (name === 'wsPort') {
            this.properties.wsPort = parseInt(value);
            this.reconnectWithNewSettings();
        } else if (name === 'topic') {
            this.properties.topic = value;
        } else if (name === 'sendOnChange') {
            this.properties.sendOnChange = value;
            this.setupSendTimer();
        } else if (name === 'sendInterval') {
            this.properties.sendInterval = parseInt(value);
            this.setupSendTimer();
        }
    }
    
    reconnectIfConnected() {
        if (this.connected) {
            this.disconnect();
            setTimeout(() => {
                this.connectionAttempts = 0;
                this.connectToMQTT();
            }, 1000);
        }
    }
    
    reconnectWithNewSettings() {
        // Always try to reconnect with new settings, regardless of current state
        this.disconnect();
        setTimeout(() => {
            this.connectionAttempts = 0;
            this.connectToMQTT();
        }, 1000);
    }
    
    onDrawForeground(ctx) {
        // Connection status indicator
        const statusColor = this.connected ? "#2ECC71" : "#E74C3C";
        this.drawIndicator(ctx, this.size[0] - 12, 12, 4, statusColor, true);
        
        // Display last value
        const displayValue = this.lastValue !== null ? this.lastValue.toFixed(2) : "---";
        this.drawText(ctx, displayValue, this.size[0] * 0.5, this.size[1] * 0.4, {
            font: "12px Arial",
            color: "#ECF0F1"
        });
        
        // Display connection status
        this.drawText(ctx, this.lastMessage, this.size[0] * 0.5, this.size[1] * 0.7, {
            font: "9px Arial",
            color: "#BDC3C7"
        });
        
        // Send indicator (flash when sending)
        if (this.connected && Date.now() - this.lastSentTime < 200) {
            this.drawIndicator(ctx, this.size[0] - 12, this.size[1] - 12, 4, "#F39C12", true);
        }
    }
    
    onRemoved() {
        // Clean up connection and timer when node is removed
        this.disconnect();
        this.clearSendTimer();
    }
}

// Make MQTTSendNode available globally
window.MQTTSendNode = MQTTSendNode;