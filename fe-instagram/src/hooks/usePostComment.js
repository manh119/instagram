import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import useUserProfileStore from "../store/userProfileStore";
import { addCommentMock } from "../services/mockData";

const usePostComment = () => {
	const [isCommenting, setIsCommenting] = useState(false);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { posts, setPosts } = usePostStore();
	const { userProfile, setUserProfile } = useUserProfileStore();
	const addComment = usePostStore((state) => state.addComment);

	const handlePostComment = async (postId, comment) => {
		if (isCommenting) return;
		if (!authUser) return showToast("Error", "You must be logged in to comment", "error");
		setIsCommenting(true);
		const newComment = {
			comment,
			createdAt: Date.now(),
			createdBy: authUser.uid,
			postId,
		};
		try {
			addCommentMock(postId, newComment);
			addComment(postId, newComment);
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsCommenting(false);
		}
	};

	return { isCommenting, handlePostComment };
};

export default usePostComment;
