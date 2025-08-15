import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import useUserProfileStore from "../store/userProfileStore";
import postService from "../services/postService";

const usePostComment = () => {
	const [isCommenting, setIsCommenting] = useState(false);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { posts, setPosts } = usePostStore();
	const { userProfile, setUserProfile } = useUserProfileStore();

	const handlePostComment = async (postId, comment) => {
		if (isCommenting) return;
		if (!authUser) return showToast("Error", "You must be logged in to comment", "error");
		setIsCommenting(true);

		try {
			const response = await postService.createComment(postId, comment);

			if (response && response.post) {
				// Update the post in the store
				const updatedPosts = posts.map(p =>
					p.id === postId ? response.post : p
				);
				setPosts(updatedPosts);

				showToast("Success", "Comment posted successfully", "success");
			} else {
				throw new Error("Failed to post comment");
			}
		} catch (error) {
			console.error('Error posting comment:', error);
			showToast("Error", error.message || "Failed to post comment", "error");
		} finally {
			setIsCommenting(false);
		}
	};

	return { isCommenting, handlePostComment };
};

export default usePostComment;
