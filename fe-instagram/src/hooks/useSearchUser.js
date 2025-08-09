import { useState } from "react";
import useShowToast from "./useShowToast";
import { findUserByUsername } from "../services/mockData";

const useSearchUser = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState(null);
	const showToast = useShowToast();

	const getUserProfile = async (username) => {
		setIsLoading(true);
		setUser(null);
		try {
			const u = findUserByUsername(username);
			if (!u) return showToast("Error", "User not found", "error");
			setUser(u);
		} catch (error) {
			showToast("Error", error.message, "error");
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, getUserProfile, user, setUser };
};

export default useSearchUser;
