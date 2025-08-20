import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import useUserProfileStore from "../store/userProfileStore";
import useShowToast from "./useShowToast";
import postService from "../services/postService";

const useFollowUser = (profileId) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [isFollowing, setIsFollowing] = useState(false);
	const { user: authUser, updateUser: setAuthUser } = useAuth();
	const showToast = useShowToast();
	const { userProfile, setUserProfile } = useUserProfileStore();

	const handleFollowUser = useCallback(async () => {
		// Don't do anything if no valid profileId
		if (!profileId || profileId === 0) {
			return;
		}

		setIsUpdating(true);
		try {
			// Call the real API to follow/unfollow
			if (isFollowing) {
				// Unfollow
				await postService.unfollowUser(profileId);
				const currentFollowing = authUser.following || [];
				setAuthUser({
					...authUser,
					following: currentFollowing.filter((uid) => uid !== profileId),
				});
				if (userProfile) {
					const currentFollowers = userProfile.followers || [];
					setUserProfile({
						...userProfile,
						followers: currentFollowers.filter((uid) => uid !== authUser.uid),
					});
				}

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: currentFollowing.filter((uid) => uid !== profileId),
					})
				);
				setIsFollowing(false);
				showToast("Success", "Unfollowed successfully", "success");
			} else {
				// Follow
				await postService.followUser(profileId);
				const currentFollowing = authUser.following || [];
				setAuthUser({
					...authUser,
					following: [...currentFollowing, profileId],
				});

				if (userProfile) {
					const currentFollowers = userProfile.followers || [];
					setUserProfile({
						...userProfile,
						followers: [...currentFollowers, authUser.uid],
					});
				}

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: [...currentFollowing, profileId],
					})
				);
				setIsFollowing(true);
				showToast("Success", "Followed successfully", "success");
			}
		} catch (error) {
			console.error('Error following/unfollowing user:', error);
			showToast("Error", "Failed to follow/unfollow user", "error");
		} finally {
			setIsUpdating(false);
		}
	}, [profileId, isFollowing, authUser, userProfile, setAuthUser, setUserProfile, showToast]);

	useEffect(() => {
		if (authUser && profileId && profileId !== 0) {
			const isFollowing = authUser.following && Array.isArray(authUser.following) ? authUser.following.includes(profileId) : false;
			setIsFollowing(isFollowing);
		} else {
			setIsFollowing(false);
		}
	}, [authUser, profileId]);

	return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
