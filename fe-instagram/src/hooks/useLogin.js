import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import useUserProfileStore from "../store/userProfileStore";
import { signInWithEmailAndPasswordMock, findUserByUid } from "../services/mockData";

const useLogin = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const showToast = useShowToast();
	const { setUserProfile } = useUserProfileStore();

	const error = null;

	const handleLogin = async (inputs) => {
		if (!inputs.email || !inputs.password) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		setIsLoading(true);

		try {
			const cred = signInWithEmailAndPasswordMock(inputs.email, inputs.password);
			const user = findUserByUid(cred.user.uid);
			const mockToken = "mock.jwt.token.for.testing";
			localStorage.setItem("user-info", JSON.stringify(user));
			await login(user, mockToken);
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
