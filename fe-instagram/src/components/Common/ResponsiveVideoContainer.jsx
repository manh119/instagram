import React from 'react';
import { Box, useBreakpointValue } from '@chakra-ui/react';
import videoConfig from '../../config/videoConfig';
import './VideoStyles.css';

const ResponsiveVideoContainer = ({ children, variant = 'feed' }) => {
    // Get responsive sizing based on screen size
    const responsiveSizing = useBreakpointValue({
        base: videoConfig.performance.responsiveBreakpoints.mobile,
        md: videoConfig.performance.responsiveBreakpoints.tablet,
        lg: videoConfig.performance.responsiveBreakpoints.desktop,
    });

    // Get container classes based on variant
    const getContainerClasses = () => {
        switch (variant) {
            case 'feed':
                return 'video-container';
            case 'grid':
                return 'video-grid-container';
            case 'modal':
                return 'video-modal-container';
            default:
                return 'video-container';
        }
    };

    // Get container styles based on variant
    const getContainerStyles = () => {
        switch (variant) {
            case 'feed':
                return {
                    maxHeight: responsiveSizing?.maxHeight || videoConfig.performance.maxHeight,
                    minHeight: responsiveSizing?.minHeight || videoConfig.performance.minHeight,
                    aspectRatio: responsiveSizing?.aspectRatio || videoConfig.performance.aspectRatio,
                    width: '100%',
                };
            case 'grid':
                return {
                    width: '100%',
                    height: '100%',
                    aspectRatio: '9/16',
                };
            case 'modal':
                return {
                    width: '100%',
                    height: '100%',
                    aspectRatio: '9/16',
                };
            default:
                return {
                    maxHeight: videoConfig.performance.maxHeight,
                    aspectRatio: videoConfig.performance.aspectRatio,
                    width: '100%',
                };
        }
    };

    return (
        <Box
            className={getContainerClasses()}
            {...getContainerStyles()}
        >
            {children}
        </Box>
    );
};

export default ResponsiveVideoContainer;
