import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";

const useLogout = () => {
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const { logout } = useAuth();
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			// Assuming signOutMock is no longer needed or replaced
			// localStorage.removeItem("user-info"); // This line was removed as per the new_code
			logout();
			setUserProfile(null); // Assuming setUserProfile is the new way to clear user profile
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoggingOut(false);
		}
	};

	return { handleLogout, isLoggingOut, error: null }; // error is no longer managed by useAuthStore
};

export default useLogout;
