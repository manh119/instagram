import { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import postService from "../services/postService";

const usePostComment = () => {
	const [isCommenting, setIsCommenting] = useState(false);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { posts, setPosts } = usePostStore();

	const handlePostComment = useCallback(async (postId, commentText) => {
		if (isCommenting) return;
		if (!authUser) return showToast("Error", "You must be logged in to comment", "error");
		if (!commentText.trim()) return;

		setIsCommenting(true);

		try {
			// Create optimistic comment for better UX
			const optimisticComment = {
				id: `temp-${Date.now()}`, // Temporary ID
				content: commentText, // Use 'content' for frontend compatibility
				comment: commentText, // Use 'comment' for backend compatibility
				createdAt: new Date().toISOString(),
				createdBy: {
					id: authUser.id || authUser.uid,
					userId: authUser.uid,
					username: authUser.username,
					profilePicURL: authUser.picture
				}
			};

			// Optimistically add comment to UI
			const updatedPosts = posts.map(post => {
				if (post.id === postId) {
					return {
						...post,
						comments: [...(post.comments || []), optimisticComment]
					};
				}
				return post;
			});
			setPosts(updatedPosts);

			// Send comment to server
			const response = await postService.createComment(postId, commentText);

			if (response && response.post) {
				// Update with actual server response
				const finalUpdatedPosts = posts.map(post =>
					post.id === postId ? response.post : post
				);
				setPosts(finalUpdatedPosts);

				showToast("Success", "Comment posted successfully", "success");
			} else {
				throw new Error("Failed to post comment");
			}
		} catch (error) {
			console.error('Error posting comment:', error);

			// Revert optimistic update on error
			const revertedPosts = posts.map(post => {
				if (post.id === postId) {
					return {
						...post,
						comments: (post.comments || []).filter(comment =>
							comment.id !== `temp-${Date.now() - 1000}` // Remove temp comment
						)
					};
				}
				return post;
			});
			setPosts(revertedPosts);

			// Handle specific error types
			if (error.message.includes('Authentication failed') ||
				error.message.includes('expired') ||
				error.message.includes('log in again')) {
				showToast("Authentication Error", "Your session has expired. Please log in again.", "error");
			} else if (error.message.includes('Post not found')) {
				showToast("Error", "Post not found. It may have been deleted.", "error");
			} else {
				showToast("Error", error.message || "Failed to post comment", "error");
			}
		} finally {
			setIsCommenting(false);
		}
	}, [isCommenting, authUser, posts, setPosts, showToast]);

	return { isCommenting, handlePostComment };
};

export default usePostComment;
