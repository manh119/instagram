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
        objectFit: 'cover', // Cover container for mobile-optimized look
        aspectRatio: '9/16', // Mobile portrait aspect ratio (Instagram-style)
        minHeight: '400px', // Minimum height for mobile videos
        responsiveBreakpoints: {
            mobile: { maxHeight: '500px', minHeight: '400px', aspectRatio: '9/16' },
            tablet: { maxHeight: '550px', minHeight: '450px', aspectRatio: '9/16' },
            desktop: { maxHeight: '600px', minHeight: '500px', aspectRatio: '9/16' }
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
