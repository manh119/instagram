import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import { toggleLikeMock } from "../services/mockData";

const useLikePost = (post) => {
	const [likes, setLikes] = useState(post.likes);
	const [isLiked, setIsLiked] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { posts, setPosts } = usePostStore();

	// Initialize isLiked state based on whether the current user has liked the post
	useEffect(() => {
		if (authUser && post.likes) {
			setIsLiked(post.likes.includes(authUser.uid));
		}
	}, [authUser, post.likes]);

	const handleLikePost = async () => {
		if (isUpdating) return;
		if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");
		setIsUpdating(true);

		try {
			const updatedPost = toggleLikeMock(post.id, authUser.uid);
			setIsLiked(!isLiked);
			setLikes(updatedPost.likes.length);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	return { isLiked, likes, handleLikePost, isUpdating };
};

export default useLikePost;
