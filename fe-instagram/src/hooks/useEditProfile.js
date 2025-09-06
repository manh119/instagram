import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
// In mock-only build, we skip Firebase storage entirely.

const useEditProfile = () => {
	const [isUpdating, setIsUpdating] = useState(false);
	const { user: authUser, updateUser: setAuthUser } = useAuth();
	const showToast = useShowToast();
	const { userProfile, setUserProfile } = useUserProfileStore();

	const editProfile = async (inputs, selectedFile) => {
		if (isUpdating || !authUser) return;
		setIsUpdating(true);

		// storage/userDoc refs removed in mock-only mode

		let URL = "";
		try {
			if (selectedFile) {
				// use data URL directly
				URL = selectedFile;
			}

			const updatedUser = {
				...authUser,
				fullName: inputs.fullName || authUser.fullName,
				username: inputs.username || authUser.username,
				bio: inputs.bio || authUser.bio,
				profilePicURL: URL || authUser.profilePicURL,
			};

			localStorage.setItem("user-info", JSON.stringify(updatedUser));
			setAuthUser(updatedUser);
			setUserProfile(updatedUser);
			showToast("Success", "Profile updated successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { editProfile, isUpdating };
};

export default useEditProfile;
