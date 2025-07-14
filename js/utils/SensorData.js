// Sensor data simulation utilities
const SensorData = {
    // Standard sensor data generators
    generators: {
        temperature: () => 20 + Math.random() * 10,
        humidity: () => 40 + Math.random() * 30,
        pressure: () => 1000 + Math.random() * 20,
        flow: () => Math.random() * 100,
        custom: (min, max) => min + Math.random() * (max - min)
    },
    
    // Generate data based on sensor type and properties
    generate(type, properties = {}) {
        if (type === "custom" && properties.useCustomRange) {
            return this.generators.custom(properties.min || 0, properties.max || 100);
        }
        
        if (this.generators[type]) {
            return this.generators[type]();
        }
        
        // Fallback to temperature if type not found
        return this.generators.temperature();
    },
    
    // Get unit for sensor type
    getUnit(type) {
        const units = {
            temperature: "°C",
            humidity: "%",
            pressure: "hPa",
            flow: "L/min",
            custom: ""
        };
        return units[type] || "";
    },
    
    // Get display name for sensor type
    getDisplayName(type) {
        const names = {
            temperature: "Temperatur",
            humidity: "Luftfeuchtigkeit", 
            pressure: "Druck",
            flow: "Durchfluss",
            custom: "Benutzerdefiniert"
        };
        return names[type] || type;
    }
};

// Make SensorData available globally
window.SensorData = SensorData;