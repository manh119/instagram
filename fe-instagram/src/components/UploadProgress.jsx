import React from 'react';
import {
    Box,
    Progress,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
    useToast
} from '@chakra-ui/react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

const UploadProgress = ({
    file,
    progress,
    status,
    onCancel,
    onRetry,
    error
}) => {
    const toast = useToast();

    const getStatusColor = () => {
        switch (status) {
            case 'uploading':
                return 'blue';
            case 'success':
                return 'green';
            case 'error':
                return 'red';
            case 'cancelled':
                return 'gray';
            default:
                return 'blue';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'uploading':
                return null;
            case 'success':
                return FiCheck;
            case 'error':
                return FiAlertCircle;
            case 'cancelled':
                return FiX;
            default:
                return null;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'uploading':
                return 'Uploading...';
            case 'success':
                return 'Upload Complete';
            case 'error':
                return 'Upload Failed';
            case 'cancelled':
                return 'Upload Cancelled';
            default:
                return 'Preparing...';
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
            toast({
                title: 'Upload Cancelled',
                description: `${file.name} upload was cancelled`,
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
            toast({
                title: 'Retrying Upload',
                description: `Retrying upload for ${file.name}`,
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bg="white"
            boxShadow="sm"
            position="relative"
        >
            <VStack spacing={3} align="stretch">
                {/* File Info */}
                <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1} flex={1}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                            {file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                    </VStack>

                    {/* Status Icon */}
                    {getStatusIcon() && (
                        <Icon
                            as={getStatusIcon()}
                            color={`${getStatusColor()}.500`}
                            boxSize={5}
                        />
                    )}

                    {/* Action Buttons */}
                    <HStack spacing={2}>
                        {status === 'uploading' && onCancel && (
                            <IconButton
                                icon={<FiX />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={handleCancel}
                                aria-label="Cancel upload"
                            />
                        )}

                        {status === 'error' && onRetry && (
                            <IconButton
                                icon={<FiAlertCircle />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={handleRetry}
                                aria-label="Retry upload"
                            />
                        )}
                    </HStack>
                </HStack>

                {/* Progress Bar */}
                {status === 'uploading' && (
                    <Box>
                        <Progress
                            value={progress}
                            colorScheme={getStatusColor()}
                            size="sm"
                            borderRadius="full"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
                            {Math.round(progress)}%
                        </Text>
                    </Box>
                )}

                {/* Status Text */}
                <Text
                    fontSize="sm"
                    color={`${getStatusColor()}.600`}
                    fontWeight="medium"
                    textAlign="center"
                >
                    {getStatusText()}
                </Text>

                {/* Error Message */}
                {error && (
                    <Text fontSize="xs" color="red.500" textAlign="center">
                        {error}
                    </Text>
                )}
            </VStack>
        </Box>
    );
};

export default UploadProgress;
