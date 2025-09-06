import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import postService from "../services/postService";

const useGetFeedPosts = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [hasMore, setHasMore] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const { posts, setPosts, addPosts } = usePostStore();
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();
	const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL;

	const loadMorePosts = async (page = 0, append = false) => {
		if (!authUser) return;

		try {
			const response = await postService.getFeedPosts(page, 20);
			console.log('Feed response for page', page, ':', response);

			if (response && response.posts) {
				// Debug: Log each post's imageUrl
				response.posts.forEach((post, index) => {
					console.log(`Post ${index}:`, {
						id: post.id,
						caption: post.caption,
						imageUrl: post.imageUrl,
						imageURL: post.imageURL, // Check if backend is using different case
						createdBy: post.createdBy,
						fullImageUrl: post.imageUrl ? MEDIA_BASE_URL + `${post.imageUrl}` : 'No image'
					});
				});

				// Ensure all posts have the required fields with defaults
				const safePosts = response.posts.map(post => ({
					...post,
					comments: post.comments || [],
					userLikes: post.userLikes || [],
					createdBy: post.createdBy || {}
				}));

				if (append) {
					addPosts(safePosts);
				} else {
					setPosts(safePosts);
				}

				// Check if there are more pages
				setHasMore(page < response.totalPage - 1);
				setCurrentPage(page);

				console.log(`Loaded ${safePosts.length} posts. Page ${page + 1} of ${response.totalPage}. Has more: ${page < response.totalPage - 1}`);
			} else {
				console.log('No posts in response:', response);
				if (!append) {
					setPosts([]);
				}
				setHasMore(false);
			}
		} catch (error) {
			console.error('Error fetching feed posts:', error);
			showToast("Error", "Failed to load feed posts", "error");
			if (!append) {
				setPosts([]);
			}
		}
	};

	useEffect(() => {
		const getFeedPosts = async () => {
			setIsLoading(true);
			if (!authUser) {
				setIsLoading(false);
				setPosts([]);
				return;
			}

			await loadMorePosts(0, false);
			setIsLoading(false);
		};

		if (authUser) getFeedPosts();
	}, [authUser, showToast, setPosts, setUserProfile]);

	return {
		isLoading,
		posts,
		hasMore,
		currentPage,
		loadMorePosts: () => loadMorePosts(currentPage + 1, true),
		refreshPosts: () => loadMorePosts(0, false)
	};
};

export default useGetFeedPosts;
