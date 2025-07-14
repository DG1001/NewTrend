// Main entry point for the modular Trendows application
(function() {
    'use strict';
    
    // Initialize the application when DOM is loaded
    function init() {
        console.log('Initializing Trendows Web Prototype...');
        
        // Check for required dependencies
        if (typeof LiteGraph === 'undefined') {
            console.error('LiteGraph library not found!');
            return;
        }
        
        // Initialize core application
        if (window.Application) {
            Application.init();
        } else {
            console.error('Application module not found!');
        }
        
        console.log('Trendows Web Prototype initialized successfully!');
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose global initialization function for backward compatibility
    window.initTrendows = init;
})();