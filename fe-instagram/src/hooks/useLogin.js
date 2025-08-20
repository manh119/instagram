import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import config from "../config/api";

const useLogin = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();

	const error = null;

	const handleLogin = async (inputs) => {
		if (!inputs.username || !inputs.password) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: inputs.username,
					password: inputs.password
				})
			});

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Invalid username or password");
				}
				throw new Error("Login failed. Please try again.");
			}

			const data = await response.json();

			// Create user object for frontend compatibility
			const user = {
				uid: data.username, // Use username as uid for now
				username: data.username,
				email: inputs.username, // Fallback for compatibility
				displayName: data.username,
				following: [], // Initialize empty following array
				followers: []  // Initialize empty followers array
			};

			localStorage.setItem("user-info", JSON.stringify(user));
			localStorage.setItem("jwt-token", data.token);
			await login(user, data.token);
			showToast("Success", "Login successful", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, error, login: handleLogin };
};

export default useLogin;
