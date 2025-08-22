import { useState, useEffect } from 'react';
import postService from '../services/postService';

const useGetLikedPosts = (profile) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLikedPosts = async () => {
            if (!profile?.id) return;

            setIsLoading(true);
            setError(null);

            try {
                // Extract user ID from profile
                const userId = profile.id || profile.uid;

                if (!userId) {
                    console.error('useGetLikedPosts: No user ID found in profile:', profile);
                    return;
                }

                console.log('useGetLikedPosts: Fetching liked posts for user:', userId);

                const response = await postService.getLikedPosts(userId);
                const likedPosts = response.posts || [];

                console.log('useGetLikedPosts: Liked posts fetched:', likedPosts);
                setPosts(likedPosts);
            } catch (error) {
                console.error('useGetLikedPosts: Error fetching liked posts:', error);
                setError(error.message);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedPosts();
    }, [profile?.id, profile?.uid]);

    return { posts, isLoading, error };
};

export default useGetLikedPosts;
