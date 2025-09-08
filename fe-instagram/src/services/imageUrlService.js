import presignedUrlService from './presignedUrlService';

/**
 * Service for managing image URLs with pre-signed URL caching
 * This service handles the conversion from object keys to pre-signed URLs
 * and caches them to avoid unnecessary API calls
 */
class ImageUrlService {
    constructor() {
        // Cache for pre-signed URLs
        // Key: objectKey, Value: { url, expiresAt }
        this.urlCache = new Map();

        // Cache duration (5 days, pre-signed URLs expire in 7 days)
        this.cacheDuration = 5 * 24 * 60 * 60 * 1000; // 5 days in milliseconds
    }

    /**
     * Get a pre-signed URL for an image
     * @param {string} imageUrl - The image URL (could be direct MinIO URL or object key)
     * @returns {Promise<string>} - The pre-signed URL
     */
    async getImageUrl(imageUrl) {
        if (!imageUrl) {
            return null;
        }

        // If it's already a pre-signed URL, return it
        if (this.isPresignedUrl(imageUrl)) {
            return imageUrl;
        }

        // Extract object key from the URL
        const objectKey = this.extractObjectKey(imageUrl);
        if (!objectKey) {
            console.warn('Could not extract object key from URL:', imageUrl);
            return imageUrl; // Return original URL as fallback
        }

        // Check cache first
        const cached = this.urlCache.get(objectKey);
        if (cached && cached.expiresAt > Date.now()) {
            console.log('Using cached pre-signed URL for:', objectKey);
            return cached.url;
        }

        try {
            // Get new pre-signed URL
            console.log('Generating new pre-signed URL for:', objectKey);
            const response = await presignedUrlService.getImageViewUrl(objectKey);

            // Cache the URL
            this.urlCache.set(objectKey, {
                url: response.uploadUrl, // uploadUrl field contains the view URL
                expiresAt: Date.now() + this.cacheDuration
            });

            return response.uploadUrl;

        } catch (error) {
            console.error('Failed to get pre-signed URL for:', objectKey, error);
            return imageUrl; // Return original URL as fallback
        }
    }

    /**
     * Check if a URL is already a pre-signed URL
     * @param {string} url - The URL to check
     * @returns {boolean} - True if it's a pre-signed URL
     */
    isPresignedUrl(url) {
        return url && (
            url.includes('X-Amz-Algorithm') ||
            url.includes('X-Amz-Credential') ||
            url.includes('X-Amz-Signature')
        );
    }

    /**
     * Extract object key from various URL formats
     * @param {string} url - The URL to extract from
     * @returns {string|null} - The object key or null if not found
     */
    extractObjectKey(url) {
        if (!url) return null;

        // Handle direct MinIO URLs: http://localhost:9000/bucket-name/posts/filename.png
        const minioMatch = url.match(/\/[^\/]+\/(posts\/[^\/\?]+)/);
        if (minioMatch) {
            return minioMatch[1];
        }

        // Handle backend proxy URLs: http://localhost:8080/images/filename.png
        const backendMatch = url.match(/\/images\/([^\/\?]+)/);
        if (backendMatch) {
            return `posts/${backendMatch[1]}`;
        }

        // Handle object key directly: posts/filename.png
        if (url.startsWith('posts/')) {
            return url;
        }

        // Handle filename only: filename.png
        if (url.match(/^[^\/]+\.(jpg|jpeg|png|gif|webp)$/i)) {
            return `posts/${url}`;
        }

        return null;
    }

    /**
     * Clear the URL cache
     */
    clearCache() {
        this.urlCache.clear();
        console.log('Image URL cache cleared');
    }

    /**
     * Get cache statistics
     * @returns {object} - Cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        const valid = Array.from(this.urlCache.values()).filter(item => item.expiresAt > now).length;
        const expired = this.urlCache.size - valid;

        return {
            total: this.urlCache.size,
            valid,
            expired,
            hitRate: valid / Math.max(this.urlCache.size, 1)
        };
    }

    /**
     * Clean up expired cache entries
     */
    cleanupExpired() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of this.urlCache.entries()) {
            if (value.expiresAt <= now) {
                this.urlCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} expired cache entries`);
        }

        return cleaned;
    }
}

// Create singleton instance
const imageUrlService = new ImageUrlService();

// Clean up expired entries every hour
setInterval(() => {
    imageUrlService.cleanupExpired();
}, 60 * 60 * 1000);

export default imageUrlService;

