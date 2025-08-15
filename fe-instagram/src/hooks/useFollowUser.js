import { useEffect, useState } from "react";
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

	const handleFollowUser = async () => {
		setIsUpdating(true);
		try {
			// Call the real API to follow/unfollow
			if (isFollowing) {
				// Unfollow
				await postService.unfollowUser(profileId);
				setAuthUser({
					...authUser,
					following: authUser.following.filter((uid) => uid !== profileId),
				});
				if (userProfile)
					setUserProfile({
						...userProfile,
						followers: userProfile.followers.filter((uid) => uid !== authUser.uid),
					});

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: authUser.following.filter((uid) => uid !== profileId),
					})
				);
				setIsFollowing(false);
				showToast("Success", "Unfollowed successfully", "success");
			} else {
				// Follow
				await postService.followUser(profileId);
				setAuthUser({
					...authUser,
					following: [...authUser.following, profileId],
				});

				if (userProfile)
					setUserProfile({
						...userProfile,
						followers: [...userProfile.followers, authUser.uid],
					});

				localStorage.setItem(
					"user-info",
					JSON.stringify({
						...authUser,
						following: [...authUser.following, profileId],
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
	};

	useEffect(() => {
		if (authUser) {
			const isFollowing = authUser.following.includes(profileId);
			setIsFollowing(isFollowing);
		}
	}, [authUser, profileId]);

	return { isUpdating, isFollowing, handleFollowUser };
};

export default useFollowUser;
