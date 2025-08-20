import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import config from "../config/api";

const useSignUpWithEmailAndPassword = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const showToast = useShowToast();

	const signup = async (inputs) => {
		if (!inputs.password || !inputs.username || !inputs.fullName) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`${config.api.baseUrl}${config.api.endpoints.auth}/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: inputs.username,
					password: inputs.password,
					name: inputs.fullName
				})
			});

			if (!response.ok) {
				if (response.status === 400) {
					throw new Error("Username already exists or invalid input");
				}
				throw new Error("Registration failed. Please try again.");
			}

			const data = await response.json();

			// Create user object for frontend compatibility
			const user = {
				uid: data.username, // Use username as uid for now
				username: data.username,
				email: inputs.username, // Fallback for compatibility
				displayName: inputs.fullName,
				following: [], // Initialize empty following array
				followers: []  // Initialize empty followers array
			};

			localStorage.setItem("user-info", JSON.stringify(user));
			localStorage.setItem("jwt-token", data.token);
			await login(user, data.token);
			showToast("Success", "Account created successfully", "success");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, signup };
};

export default useSignUpWithEmailAndPassword;
