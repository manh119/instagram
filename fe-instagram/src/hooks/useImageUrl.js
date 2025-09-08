import { useState, useEffect } from 'react';
import imageUrlService from '../services/imageUrlService';

/**
 * Hook for managing image URLs with pre-signed URL conversion
 * @param {string} imageUrl - The original image URL or object key
 * @returns {object} - { url, loading, error }
 */
export const useImageUrl = (imageUrl) => {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!imageUrl) {
            setUrl(null);
            setLoading(false);
            setError(null);
            return;
        }

        const loadImageUrl = async () => {
            setLoading(true);
            setError(null);

            try {
                const presignedUrl = await imageUrlService.getImageUrl(imageUrl);
                setUrl(presignedUrl);
            } catch (err) {
                console.error('Failed to load image URL:', err);
                setError(err.message);
                // Fallback to original URL
                setUrl(imageUrl);
            } finally {
                setLoading(false);
            }
        };

        loadImageUrl();
    }, [imageUrl]);

    return { url, loading, error };
};

/**
 * Hook for managing multiple image URLs
 * @param {string[]} imageUrls - Array of image URLs
 * @returns {object} - { urls, loading, error }
 */
export const useImageUrls = (imageUrls) => {
    const [urls, setUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!imageUrls || imageUrls.length === 0) {
            setUrls([]);
            setLoading(false);
            setError(null);
            return;
        }

        const loadImageUrls = async () => {
            setLoading(true);
            setError(null);

            try {
                const presignedUrls = await Promise.all(
                    imageUrls.map(url => imageUrlService.getImageUrl(url))
                );
                setUrls(presignedUrls);
            } catch (err) {
                console.error('Failed to load image URLs:', err);
                setError(err.message);
                // Fallback to original URLs
                setUrls(imageUrls);
            } finally {
                setLoading(false);
            }
        };

        loadImageUrls();
    }, [imageUrls]);

    return { urls, loading, error };
};

export default useImageUrl;

