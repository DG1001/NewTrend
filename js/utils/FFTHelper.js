// FFT Helper - Lightweight FFT implementation and windowing functions
class FFTHelper {
    // Compute FFT using Cooley-Tukey algorithm
    static fft(signal) {
        const N = signal.length;
        if (N <= 1) return signal;
        
        // Ensure power of 2
        if ((N & (N - 1)) !== 0) {
            throw new Error('FFT input size must be a power of 2');
        }
        
        // Divide
        const even = [];
        const odd = [];
        for (let i = 0; i < N; i += 2) {
            even.push(signal[i]);
            if (i + 1 < N) odd.push(signal[i + 1]);
        }
        
        // Conquer
        const evenFFT = this.fft(even);
        const oddFFT = this.fft(odd);
        
        // Combine
        const result = new Array(N);
        for (let k = 0; k < N / 2; k++) {
            const t = this.complexMultiply(
                { real: Math.cos(-2 * Math.PI * k / N), imag: Math.sin(-2 * Math.PI * k / N) },
                oddFFT[k] || { real: 0, imag: 0 }
            );
            
            result[k] = this.complexAdd(evenFFT[k] || { real: 0, imag: 0 }, t);
            result[k + N / 2] = this.complexSubtract(evenFFT[k] || { real: 0, imag: 0 }, t);
        }
        
        return result;
    }
    
    // Convert real signal to complex
    static realToComplex(realSignal) {
        return realSignal.map(val => ({ real: val, imag: 0 }));
    }
    
    // Calculate magnitude spectrum
    static getMagnitudeSpectrum(fftResult) {
        return fftResult.map(complex => 
            Math.sqrt(complex.real * complex.real + complex.imag * complex.imag)
        );
    }
    
    // Calculate phase spectrum
    static getPhaseSpectrum(fftResult) {
        return fftResult.map(complex => 
            Math.atan2(complex.imag, complex.real)
        );
    }
    
    // Find peak frequency
    static findPeakFrequency(magnitudeSpectrum, sampleRate) {
        let maxMagnitude = 0;
        let peakBin = 0;
        
        // Only check first half (positive frequencies)
        for (let i = 0; i < magnitudeSpectrum.length / 2; i++) {
            if (magnitudeSpectrum[i] > maxMagnitude) {
                maxMagnitude = magnitudeSpectrum[i];
                peakBin = i;
            }
        }
        
        return peakBin * sampleRate / magnitudeSpectrum.length;
    }
    
    // Complex number operations
    static complexAdd(a, b) {
        return { real: a.real + b.real, imag: a.imag + b.imag };
    }
    
    static complexSubtract(a, b) {
        return { real: a.real - b.real, imag: a.imag - b.imag };
    }
    
    static complexMultiply(a, b) {
        return {
            real: a.real * b.real - a.imag * b.imag,
            imag: a.real * b.imag + a.imag * b.real
        };
    }
    
    // Window functions
    static applyWindow(signal, windowType) {
        const N = signal.length;
        const windowed = new Array(N);
        
        for (let i = 0; i < N; i++) {
            let windowValue = 1;
            
            switch (windowType) {
                case 'hann':
                    windowValue = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
                    break;
                case 'hamming':
                    windowValue = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
                    break;
                case 'blackman':
                    windowValue = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)) + 
                                 0.08 * Math.cos(4 * Math.PI * i / (N - 1));
                    break;
                case 'rectangular':
                default:
                    windowValue = 1;
                    break;
            }
            
            windowed[i] = signal[i] * windowValue;
        }
        
        return windowed;
    }
    
    // Pad signal to next power of 2
    static padToPowerOf2(signal) {
        const N = signal.length;
        const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(N)));
        
        if (N === nextPowerOf2) return signal;
        
        const padded = new Array(nextPowerOf2).fill(0);
        for (let i = 0; i < N; i++) {
            padded[i] = signal[i];
        }
        
        return padded;
    }
    
    // Generate frequency bins for plotting
    static getFrequencyBins(fftSize, sampleRate) {
        const bins = [];
        for (let i = 0; i < fftSize / 2; i++) {
            bins.push(i * sampleRate / fftSize);
        }
        return bins;
    }
}

// Make FFTHelper available globally
window.FFTHelper = FFTHelper;