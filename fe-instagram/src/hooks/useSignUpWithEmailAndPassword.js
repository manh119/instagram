import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import { createUserMock, findUserByUid } from "../services/mockData";

const useSignUpWithEmailAndPassword = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const showToast = useShowToast();

	const signup = async (inputs) => {
		if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		setIsLoading(true);

		try {
			const cred = createUserMock(inputs);
			const user = findUserByUid(cred.user.uid);
			const mockToken = "mock.jwt.token.for.testing";
			localStorage.setItem("user-info", JSON.stringify(user));
			await login(user, mockToken);
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
