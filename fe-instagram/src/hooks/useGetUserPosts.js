import { useEffect, useState } from "react";
import usePostStore from "../store/postStore";
import useShowToast from "./useShowToast";
import postService from "../services/postService";

const useGetUserPosts = (profile) => {
	const [isLoading, setIsLoading] = useState(true);
	const { posts, setPosts } = usePostStore();
	const showToast = useShowToast();

	useEffect(() => {
		const getPosts = async () => {
			if (!profile) {
				setIsLoading(false);
				setPosts([]);
				return;
			}

			setIsLoading(true);
			setPosts([]);

			try {
				// Get user ID from profile (try both id and uid fields)
				const userId = profile.id || profile.uid;
				if (!userId) {
					throw new Error("User ID not found");
				}

				const response = await postService.getUserPosts(userId);
				if (response && response.posts) {
					setPosts(response.posts);
				} else {
					setPosts([]);
				}
			} catch (error) {
				console.error('Error fetching user posts:', error);
				showToast("Error", "Failed to load user posts", "error");
				setPosts([]);
			} finally {
				setIsLoading(false);
			}
		};

		getPosts();
	}, [setPosts, profile, showToast]);

	return { isLoading, posts };
};

export default useGetUserPosts;
