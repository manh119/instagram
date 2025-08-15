import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { listPostsByCreators } from "../services/mockData";

const useGetFeedPosts = () => {
	const [isLoading, setIsLoading] = useState(true);
	const { posts, setPosts } = usePostStore();
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();

	useEffect(() => {
		const getFeedPosts = async () => {
			setIsLoading(true);
			if (!authUser || authUser.following.length === 0) {
				setIsLoading(false);
				setPosts([]);
				return;
			}
			try {
				const feedPosts = listPostsByCreators(authUser.following);
				setPosts(feedPosts);
			} catch (error) {
				showToast("Error", error.message, "error");
			} finally {
				setIsLoading(false);
			}
		};

		if (authUser) getFeedPosts();
	}, [authUser, showToast, setPosts, setUserProfile]);

	return { isLoading, posts };
};

export default useGetFeedPosts;
