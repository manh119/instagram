import { useState, useCallback } from 'react';
import presignedUrlService from '../services/presignedUrlService';
import { useToast } from '@chakra-ui/react';

export const useImageUpload = (uploadType = 'post') => {
    const [uploads, setUploads] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const toast = useToast();

    /**
     * Add a new file to upload queue
     */
    const addFile = useCallback((file) => {
        // Validate file
        if (!file) {
            toast({
                title: 'No file selected',
                description: 'Please select a file to upload',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return null;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid file type',
                description: 'Please select an image file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return null;
        }

        // Validate file size (10MB for posts, 5MB for profiles)
        const maxSize = uploadType === 'post' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                title: 'File too large',
                description: `Maximum file size is ${maxSize / 1024 / 1024}MB`,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return null;
        }

        // Create upload object
        const uploadId = Date.now() + Math.random();
        const upload = {
            id: uploadId,
            file,
            progress: 0,
            status: 'preparing',
            error: null,
            objectKey: null,
            bucketName: null
        };

        setUploads(prev => [...prev, upload]);
        return uploadId;
    }, [uploadType, toast]);

    /**
     * Start upload for a specific file
     */
    const startUpload = useCallback(async (uploadId) => {
        const uploadIndex = uploads.findIndex(u => u.id === uploadId);
        if (uploadIndex === -1) return;

        setUploads(prev => prev.map((u, i) =>
            i === uploadIndex ? { ...u, status: 'uploading' } : u
        ));

        setIsUploading(true);

        try {
            const upload = uploads[uploadIndex];

            // Update progress callback
            const onProgress = (progress) => {
                setUploads(prev => prev.map((u, i) =>
                    i === uploadIndex ? { ...u, progress } : u
                ));
            };

            // Start upload based on type
            let result;
            if (uploadType === 'post') {
                result = await presignedUrlService.uploadPostImage(upload.file, onProgress);
            } else {
                result = await presignedUrlService.uploadProfileImage(upload.file, onProgress);
            }

            // Update upload with success
            setUploads(prev => prev.map((u, i) =>
                i === uploadIndex ? {
                    ...u,
                    status: 'success',
                    progress: 100,
                    objectKey: result.objectKey,
                    bucketName: result.bucketName
                } : u
            ));

            toast({
                title: 'Upload Successful',
                description: `${upload.file.name} uploaded successfully`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

        } catch (error) {
            console.error('Upload failed:', error);

            // Update upload with error
            setUploads(prev => prev.map((u, i) =>
                i === uploadIndex ? {
                    ...u,
                    status: 'error',
                    error: error.message
                } : u
            ));

            toast({
                title: 'Upload Failed',
                description: error.message || 'Failed to upload file',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUploading(false);
        }
    }, [uploads, uploadType, toast]);

    /**
     * Cancel an upload
     */
    const cancelUpload = useCallback((uploadId) => {
        setUploads(prev => prev.map(u =>
            u.id === uploadId ? { ...u, status: 'cancelled' } : u
        ));
    }, []);

    /**
     * Retry a failed upload
     */
    const retryUpload = useCallback((uploadId) => {
        startUpload(uploadId);
    }, [startUpload]);

    /**
     * Remove an upload from the list
     */
    const removeUpload = useCallback((uploadId) => {
        setUploads(prev => prev.filter(u => u.id !== uploadId));
    }, []);

    /**
     * Clear all uploads
     */
    const clearUploads = useCallback(() => {
        setUploads([]);
    }, []);

    /**
     * Get successful uploads
     */
    const getSuccessfulUploads = useCallback(() => {
        return uploads.filter(u => u.status === 'success');
    }, [uploads]);

    /**
     * Get uploads with errors
     */
    const getFailedUploads = useCallback(() => {
        return uploads.filter(u => u.status === 'error');
    }, [uploads]);

    /**
     * Get currently uploading files
     */
    const getUploadingFiles = useCallback(() => {
        return uploads.filter(u => u.status === 'uploading');
    }, [uploads]);

    /**
     * Check if any uploads are in progress
     */
    const hasActiveUploads = useCallback(() => {
        return uploads.some(u => u.status === 'uploading');
    }, [uploads]);

    /**
     * Get total upload count
     */
    const getTotalUploads = useCallback(() => {
        return uploads.length;
    }, [uploads]);

    /**
     * Get successful upload count
     */
    const getSuccessfulCount = useCallback(() => {
        return uploads.filter(u => u.status === 'success').length;
    }, [uploads]);

    /**
     * Get failed upload count
     */
    const getFailedCount = useCallback(() => {
        return uploads.filter(u => u.status === 'error').length;
    }, [uploads]);

    return {
        // State
        uploads,
        isUploading,

        // Actions
        addFile,
        startUpload,
        cancelUpload,
        retryUpload,
        removeUpload,
        clearUploads,

        // Getters
        getSuccessfulUploads,
        getFailedUploads,
        getUploadingFiles,
        hasActiveUploads,
        getTotalUploads,
        getSuccessfulCount,
        getFailedCount,

        // Utility
        uploadType
    };
};
