// Video Auto-Play Configuration
const videoConfig = {
    // Auto-play configuration
    autoPlay: {
        enabled: true,
        visibilityThreshold: 0.5, // 50% of video must be visible
        pauseThreshold: 0.3, // Pause when less than 30% visible
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before video enters viewport
        preload: 'metadata' // Preload video metadata for faster start
    },

    // Video behavior settings
    behavior: {
        controls: true, // Show video controls
        muted: true, // Muted for auto-play compatibility
        loop: true, // Loop videos for continuous viewing
        playsInline: true // Play inline on mobile devices
    },

    // Performance and sizing configuration
    performance: {
        maxHeight: '600px', // Maximum height for feed videos
        maxWidth: '100%', // Full width of container
        objectFit: 'contain', // Maintain aspect ratio without cropping
        aspectRatio: '16/9', // Preferred aspect ratio
        minHeight: '300px', // Minimum height for better visibility
        responsiveBreakpoints: {
            mobile: { maxHeight: '400px', minHeight: '250px' },
            tablet: { maxHeight: '500px', minHeight: '300px' },
            desktop: { maxHeight: '600px', minHeight: '350px' }
        }
    },

    // Quality and format settings
    quality: {
        preferredFormats: ['mp4', 'webm', 'mov'],
        fallbackQuality: 'auto',
        adaptiveBitrate: true
    },

    // Debug and development options
    debug: {
        showDebugPanel: false,
        showAutoPlayIndicator: false,
        consoleLogs: false,
        performanceMetrics: false
    }
};

export default videoConfig;
