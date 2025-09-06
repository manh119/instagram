// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Media Configuration
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

export const config = {
    api: {
        baseUrl: API_BASE_URL,
        endpoints: {
            posts: '/posts',
            users: '/users',
            auth: '/auth',
            images: '/images',
            videos: '/videos'
        }
    },
    media: {
        baseUrl: MEDIA_BASE_URL,
        images: `${MEDIA_BASE_URL}/images`,
        videos: `${MEDIA_BASE_URL}/videos`
    }
};

export default config;
