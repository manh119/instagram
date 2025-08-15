import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import postService from "../services/postService";

const useGetSuggestedUsers = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [suggestedUsers, setSuggestedUsers] = useState([]);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();

	const getSuggestedUsers = async () => {
		setIsLoading(true);
		try {
			const users = await postService.getSuggestedUsers(3); // Get 3 suggested users
			console.log('Suggested users from API:', users);
			setSuggestedUsers(users);
		} catch (error) {
			console.error('Error getting suggested users:', error);
			showToast("Error", "Failed to load suggested users", "error");
			setSuggestedUsers([]); // Set empty array on error
		} finally {
			setIsLoading(false);
		}
	};

	const refreshUsers = async () => {
		await getSuggestedUsers();
	};

	useEffect(() => {
		if (authUser) getSuggestedUsers();
	}, [authUser, showToast]);

	return { isLoading, suggestedUsers, refreshUsers };
};

export default useGetSuggestedUsers;
