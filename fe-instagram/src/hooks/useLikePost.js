import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import postService from "../services/postService";

const useLikePost = (post) => {
	const [likes, setLikes] = useState(post.userLikes || []);
	const [isLiked, setIsLiked] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { posts, setPosts } = usePostStore();

	// Initialize isLiked state based on whether the current user has liked the post
	useEffect(() => {
		if (authUser && post.userLikes) {
			// Check if current user has liked the post
			// Backend uses Profile objects with 'id' field, frontend might use 'uid'
			setIsLiked(post.userLikes.some(user =>
				user.id === authUser.id ||
				user.id === authUser.uid ||
				user.userId === authUser.uid
			));
			setLikes(post.userLikes || []);
		}
	}, [authUser, post.userLikes]);

	const handleLikePost = async () => {
		if (isUpdating) return;
		if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");
		setIsUpdating(true);

		try {
			const response = await postService.toggleLike(post.id, isLiked);

			if (response && response.post) {
				// Update the local state
				setIsLiked(!isLiked);
				setLikes(response.post.userLikes || []);

				// Update the post in the store
				const updatedPosts = posts.map(p =>
					p.id === post.id ? response.post : p
				);
				setPosts(updatedPosts);
			}
		} catch (error) {
			console.error('Error toggling like:', error);
			showToast("Error", error.message || "Failed to update like", "error");
		} finally {
			setIsUpdating(false);
		}
	};

	return { isLiked, likes, handleLikePost, isUpdating };
};

export default useLikePost;
