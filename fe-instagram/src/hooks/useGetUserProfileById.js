import { useEffect, useState } from "react";
import useShowToast from "./useShowToast";
import userProfileService from "../services/userProfileService";

const useGetUserProfileById = (userIdOrUsername) => {
	const [isLoading, setIsLoading] = useState(false);
	const [userProfile, setUserProfile] = useState(null);

	const showToast = useShowToast();

	useEffect(() => {
		const getUserProfile = async () => {
			if (!userIdOrUsername) {
				setIsLoading(false);
				setUserProfile(null);
				return;
			}

			setIsLoading(true);
			setUserProfile(null);

			try {
				let user;
				// Check if userIdOrUsername is a number (ID) or string (username)
				if (typeof userIdOrUsername === 'number' || !isNaN(parseInt(userIdOrUsername))) {
					// It's a numeric ID, use getUserProfileById
					user = await userProfileService.getUserProfileById(userIdOrUsername);
				} else {
					// It's a username string, use getUserProfileByUsername
					user = await userProfileService.getUserProfileByUsername(userIdOrUsername);
				}
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
	}, [userIdOrUsername, showToast]);

	return { isLoading, userProfile, setUserProfile };
};

export default useGetUserProfileById;
