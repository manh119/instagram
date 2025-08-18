import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for video auto-play functionality
 * @param {string} videoUrl - The video URL
 * @param {Object} options - Configuration options
 * @param {number} options.visibilityThreshold - Threshold for when to auto-play (0.5 = 50% visible)
 * @param {number} options.pauseThreshold - Threshold for when to pause (0.3 = 30% visible)
 * @param {string} options.rootMargin - Root margin for intersection observer
 * @param {boolean} options.enableAutoPlay - Whether to enable auto-play (default: true)
 * @returns {Object} - Video refs and state
 */
const useVideoAutoPlay = (videoUrl, options = {}) => {
    const {
        visibilityThreshold = 0.5,
        pauseThreshold = 0.3,
        rootMargin = '0px 0px -100px 0px',
        enableAutoPlay = true
    } = options;

    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    // Auto-play functionality using Intersection Observer
    useEffect(() => {
        if (!videoUrl || !videoRef.current || !enableAutoPlay) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > visibilityThreshold) {
                        // Video is visible enough, auto-play
                        if (videoRef.current && !isVideoPlaying && isVideoLoaded) {
                            videoRef.current.play().then(() => {
                                setIsVideoPlaying(true);
                                console.log('Video auto-played:', videoUrl);
                            }).catch((error) => {
                                console.log('Auto-play failed (user interaction required):', error);
                            });
                        }
                    } else if (!entry.isIntersecting || entry.intersectionRatio < pauseThreshold) {
                        // Video is not visible enough, pause
                        if (videoRef.current && isVideoPlaying) {
                            videoRef.current.pause();
                            setIsVideoPlaying(false);
                            console.log('Video paused (out of view):', videoUrl);
                        }
                    }
                });
            },
            {
                threshold: [0, pauseThreshold, visibilityThreshold, 0.8, 1.0],
                rootMargin
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [videoUrl, isVideoPlaying, isVideoLoaded, visibilityThreshold, pauseThreshold, rootMargin, enableAutoPlay]);

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
    };

    const handleVideoPlay = () => {
        setIsVideoPlaying(true);
    };

    const handleVideoPause = () => {
        setIsVideoPlaying(false);
    };

    const handleVideoEnded = () => {
        setIsVideoPlaying(false);
    };

    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play().then(() => {
                setIsVideoPlaying(true);
            }).catch(console.error);
        }
    };

    const pauseVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            setIsVideoPlaying(false);
        }
    };

    return {
        videoRef,
        containerRef,
        isVideoPlaying,
        isVideoLoaded,
        handleVideoLoad,
        handleVideoPlay,
        handleVideoPause,
        handleVideoEnded,
        playVideo,
        pauseVideo
    };
};

export default useVideoAutoPlay;
