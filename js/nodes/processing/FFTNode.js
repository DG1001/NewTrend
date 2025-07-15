// FFT Node - Fast Fourier Transform for frequency domain analysis
class FFTNode extends BaseNode {
    constructor() {
        super();
        this.title = "FFT";
        this.addInput("Signal", "number");
        this.addOutput("Magnitude", "number");
        this.addOutput("Peak Freq", "number");
        this.addOutput("Peak Amplitude", "number");
        this.properties = {
            fftSize: 256,
            windowType: "hann",
            sampleRate: 100, // Hz (simulation rate)
            overlap: 0.5,
            outputMode: "peak",
            name: "FFT 1"
        };
        this.size = [160, 80];
        this.color = "#E74C3C";
        
        // Data buffers
        this.signalBuffer = [];
        this.magnitudeSpectrum = [];
        this.frequencyBins = [];
        this.peakFrequency = 0;
        this.peakAmplitude = 0;
        this.lastProcessTime = 0;
        
        // Initialize frequency bins
        this.updateFrequencyBins();
    }
    
    getMenuOptions() {
        const baseOptions = super.getMenuOptions();
        return [
            ...baseOptions,
            null,
            {
                content: "Clear Buffer",
                callback: () => {
                    this.signalBuffer = [];
                    this.magnitudeSpectrum = [];
                    this.peakFrequency = 0;
                    this.peakAmplitude = 0;
                }
            }
        ];
    }
    
    onExecute() {
        const input = this.getInputData(0);
        if (input === undefined) return;
        
        // Add to signal buffer
        this.signalBuffer.push(input);
        
        // Limit buffer size (keep 2x FFT size for overlap)
        const maxBufferSize = this.properties.fftSize * 2;
        if (this.signalBuffer.length > maxBufferSize) {
            this.signalBuffer.shift();
        }
        
        // Process FFT when we have enough data
        if (this.signalBuffer.length >= this.properties.fftSize) {
            this.processFFT();
        }
        
        // Output results
        this.setOutputData(0, this.peakAmplitude);
        this.setOutputData(1, this.peakFrequency);
        this.setOutputData(2, this.peakAmplitude);
    }
    
    processFFT() {
        try {
            // Get the latest window of data
            const windowSize = this.properties.fftSize;
            const startIndex = Math.max(0, this.signalBuffer.length - windowSize);
            let signal = this.signalBuffer.slice(startIndex, startIndex + windowSize);
            
            // Pad if necessary
            while (signal.length < windowSize) {
                signal.push(0);
            }
            
            // Apply window function
            signal = FFTHelper.applyWindow(signal, this.properties.windowType);
            
            // Pad to power of 2 if needed
            signal = FFTHelper.padToPowerOf2(signal);
            
            // Convert to complex and compute FFT
            const complexSignal = FFTHelper.realToComplex(signal);
            const fftResult = FFTHelper.fft(complexSignal);
            
            // Get magnitude spectrum
            this.magnitudeSpectrum = FFTHelper.getMagnitudeSpectrum(fftResult);
            
            // Update frequency bins if FFT size changed
            if (this.frequencyBins.length !== signal.length) {
                this.updateFrequencyBins();
            }
            
            // Find peak frequency
            this.peakFrequency = FFTHelper.findPeakFrequency(
                this.magnitudeSpectrum, 
                this.properties.sampleRate
            );
            
            // Find peak amplitude
            this.peakAmplitude = Math.max(...this.magnitudeSpectrum.slice(0, this.magnitudeSpectrum.length / 2));
            
        } catch (error) {
            console.error("FFT processing error:", error);
            this.peakFrequency = 0;
            this.peakAmplitude = 0;
        }
    }
    
    updateFrequencyBins() {
        this.frequencyBins = FFTHelper.getFrequencyBins(
            this.properties.fftSize, 
            this.properties.sampleRate
        );
    }
    
    onPropertyChanged(name, value) {
        if (name === 'fftSize') {
            // Ensure power of 2
            const validSizes = [64, 128, 256, 512, 1024, 2048];
            if (validSizes.includes(value)) {
                this.properties.fftSize = value;
                this.updateFrequencyBins();
            }
        } else if (name === 'sampleRate') {
            this.properties.sampleRate = Math.max(1, value);
            this.updateFrequencyBins();
        } else if (name === 'windowType') {
            this.properties.windowType = value;
        } else if (name === 'overlap') {
            this.properties.overlap = Math.max(0, Math.min(0.9, value));
        } else if (name === 'outputMode') {
            this.properties.outputMode = value;
        }
    }
    
    onDrawForeground(ctx) {
        // Display FFT info
        this.drawText(ctx, `${this.properties.fftSize}pt ${this.properties.windowType}`, 
                     this.size[0] * 0.5, this.size[1] * 0.25, {
            font: "9px Arial",
            color: "#666"
        });
        
        // Display peak frequency
        this.drawText(ctx, `${this.peakFrequency.toFixed(1)} Hz`, 
                     this.size[0] * 0.5, this.size[1] * 0.5, {
            font: "11px Arial",
            color: "#333"
        });
        
        // Display peak amplitude
        this.drawText(ctx, `${this.peakAmplitude.toFixed(2)}`, 
                     this.size[0] * 0.5, this.size[1] * 0.75, {
            font: "10px Arial",
            color: "#E74C3C"
        });
        
        // Draw mini spectrum visualization
        if (this.magnitudeSpectrum.length > 0) {
            this.drawMiniSpectrum(ctx);
        }
    }
    
    drawMiniSpectrum(ctx) {
        const startX = 10;
        const startY = this.size[1] - 15;
        const width = this.size[0] - 20;
        const height = 8;
        
        // Only show first half (positive frequencies)
        const spectrum = this.magnitudeSpectrum.slice(0, this.magnitudeSpectrum.length / 2);
        const maxMagnitude = Math.max(...spectrum);
        
        if (maxMagnitude > 0) {
            ctx.strokeStyle = "#E74C3C";
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let i = 0; i < spectrum.length; i++) {
                const x = startX + (i / spectrum.length) * width;
                const y = startY - (spectrum[i] / maxMagnitude) * height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
    }
}

// Make FFTNode available globally
window.FFTNode = FFTNode;