import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import userProfileService from "../services/userProfileService";

const useGetUserProfileById = (userId) => {
	const [isLoading, setIsLoading] = useState(false);
	const [userProfile, setUserProfile] = useState(null);

	const showToast = useShowToast();

	useEffect(() => {
		const getUserProfile = async () => {
			if (!userId) {
				setIsLoading(false);
				setUserProfile(null);
				return;
			}

			setIsLoading(true);
			setUserProfile(null);

			try {
				const user = await userProfileService.getUserProfileById(userId);
				setUserProfile(user);
			} catch (error) {
				console.error('Error fetching user profile:', error);
				// Don't show toast for 404 errors (user not found)
				if (error.message !== 'User not found') {
					showToast("Error", "Failed to load user profile", "error");
				}
			} finally {
				setIsLoading(false);
			}
		};

		getUserProfile();
	}, [userId, showToast]);

	return { isLoading, userProfile, setUserProfile };
};

export default useGetUserProfileById;
