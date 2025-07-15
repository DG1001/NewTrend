// MQTT Node - Receives float values from MQTT broker
class MQTTNode extends BaseNode {
    constructor() {
        super();
        this.title = 'MQTT';
        this.addOutput('value', 'number');
        this.properties = {
            brokerIP: 'localhost',
            wsPort: 1884,
            topic: 'sensors/temperature',
            name: 'MQTT 1'
        };
        this.size = [140, 80];
        this.color = "#FF6B35";
        
        // MQTT connection state
        this.client = null;
        this.connected = false;
        this.lastValue = 0;
        this.lastMessage = '';
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        
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
                clientId: `trendows_${Math.random().toString(16).substr(2, 8)}`,
                clean: true,
                connectTimeout: 5000,
                reconnectPeriod: 0 // Disable automatic reconnection
            });
            
            // Connection successful
            this.client.on('connect', () => {
                this.connected = true;
                this.lastMessage = 'Connected';
                this.connectionAttempts = 0;
                
                // Subscribe to topic
                this.client.subscribe(this.properties.topic, (err) => {
                    if (err) {
                        console.error('MQTT subscribe error:', err);
                        this.lastMessage = 'Subscribe failed';
                    } else {
                        this.lastMessage = `Subscribed to ${this.properties.topic}`;
                    }
                });
            });
            
            // Handle incoming messages
            this.client.on('message', (topic, message) => {
                if (topic === this.properties.topic) {
                    try {
                        // Parse message as float
                        const value = parseFloat(message.toString());
                        if (!isNaN(value)) {
                            this.lastValue = value;
                            this.lastMessage = `Received: ${value}`;
                        } else {
                            this.lastMessage = 'Invalid number format';
                        }
                    } catch (error) {
                        console.error('MQTT message parsing error:', error);
                        this.lastMessage = 'Parse error';
                    }
                }
            });
            
            // Handle connection errors
            this.client.on('error', (error) => {
                console.error('MQTT connection error:', error);
                this.connected = false;
                this.lastMessage = 'Connection failed';
                this.client = null;
            });
            
            // Handle disconnection
            this.client.on('close', () => {
                this.connected = false;
                this.lastMessage = 'Disconnected';
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
    }
    
    onExecute() {
        // Output the last received value
        this.setOutputData(0, this.lastValue);
    }
    
    onPropertyChanged(name, value) {
        if (name === 'brokerIP') {
            this.properties.brokerIP = value;
            this.reconnectWithNewSettings();
        } else if (name === 'wsPort') {
            this.properties.wsPort = parseInt(value);
            this.reconnectWithNewSettings();
        } else if (name === 'topic') {
            // Unsubscribe from old topic
            if (this.client && this.connected) {
                this.client.unsubscribe(this.properties.topic);
            }
            this.properties.topic = value;
            // Subscribe to new topic
            if (this.client && this.connected) {
                this.client.subscribe(value, (err) => {
                    if (!err) {
                        this.lastMessage = `Subscribed to ${value}`;
                    }
                });
            }
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
        this.drawText(ctx, this.lastValue.toFixed(2), this.size[0] * 0.5, this.size[1] * 0.4, {
            font: "12px Arial",
            color: "#ECF0F1"
        });
        
        // Display connection status
        this.drawText(ctx, this.lastMessage, this.size[0] * 0.5, this.size[1] * 0.7, {
            font: "9px Arial",
            color: "#BDC3C7"
        });
    }
    
    onRemoved() {
        // Clean up connection when node is removed
        this.disconnect();
    }
}

// Make MQTTNode available globally
window.MQTTNode = MQTTNode;