import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import postService from "../services/postService";

const useLikePost = (post) => {
	const [likes, setLikes] = useState(post?.userLikes || []);
	const [isLiked, setIsLiked] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const { user: authUser, logout } = useAuth();
	const showToast = useShowToast();
	const { posts, setPosts } = usePostStore();

	// Initialize like state
	useEffect(() => {
		if (authUser && post?.userLikes) {
			const userHasLiked = post.userLikes.some(
				(like) =>
					like.id === authUser.id ||
					like.userId === authUser.uid ||
					like.username === authUser.username
			);
			setIsLiked(userHasLiked);
			setLikes(post.userLikes);
		}
	}, [authUser, post?.userLikes]);

	// Update local state when post changes
	useEffect(() => {
		if (post?.userLikes) {
			setLikes(post.userLikes);
			if (authUser) {
				const userHasLiked = post.userLikes.some(
					(like) =>
						like.id === authUser.id ||
						like.userId === authUser.uid ||
						like.username === authUser.username
				);
				setIsLiked(userHasLiked);
			}
		}
	}, [post?.userLikes, authUser]);

	const handleLikePost = useCallback(async () => {
		if (!authUser || isUpdating) {
			return;
		}

		setIsUpdating(true);

		// Optimistic update for better UX
		const previousLikes = [...likes];
		const previousIsLiked = isLiked;

		try {
			// Optimistically update UI
			if (isLiked) {
				// Remove like optimistically
				setIsLiked(false);
				setLikes(prev => prev.filter(user =>
					user.id !== authUser.id &&
					user.uid !== authUser.uid &&
					user.userId !== authUser.uid
				));
			} else {
				// Add like optimistically
				setIsLiked(true);
				const userProfile = {
					id: authUser.id,
					userId: authUser.uid,
					username: authUser.username,
					profileImageUrl: authUser.picture
				};
				setLikes(prev => [...prev, userProfile]);
			}

			// Make API call
			let response;
			if (isLiked) {
				response = await postService.unlikePost(post.id);
				showToast("Success", "Post unliked", "success");
			} else {
				response = await postService.likePost(post.id);
				showToast("Success", "Post liked", "success");
			}

			// Update with actual server response
			if (response && response.post) {
				setLikes(response.post.userLikes || []);
				setIsLiked(response.post.userLikes?.some(
					(like) =>
						like.id === authUser.id ||
						like.userId === authUser.uid ||
						like.username === authUser.username
				) || false);
			}

			// Update posts store
			const updatedPosts = posts.map(p => {
				if (p.id === post.id) {
					return {
						...p,
						userLikes: response?.post?.userLikes || likes
					};
				}
				return p;
			});
			setPosts(updatedPosts);

		} catch (error) {
			console.error("Error toggling like:", error);

			// Revert optimistic update on error
			setIsLiked(previousIsLiked);
			setLikes(previousLikes);

			// Handle authentication errors
			if (error.message.includes('Authentication failed') ||
				error.message.includes('expired') ||
				error.message.includes('log in again')) {
				showToast("Authentication Error", "Your session has expired. Please log in again.", "error");
				setTimeout(() => {
					logout();
					window.location.href = '/auth';
				}, 2000);
			} else {
				showToast("Error", error.message || "Failed to update like", "error");
			}
		} finally {
			setIsUpdating(false);
		}
	}, [isLiked, likes, isUpdating, authUser, post?.id, posts, setPosts, showToast, logout]);

	return {
		isLiked,
		likes,
		handleLikePost,
		isUpdating,
		likeCount: Array.isArray(likes) ? likes.length : 0,
		// Additional UX helpers
		likeButtonText: isLiked ? "Unlike" : "Like",
		likeButtonColor: isLiked ? "red" : "gray",
		likeButtonIcon: isLiked ? "❤️" : "🤍"
	};
};

export default useLikePost;
