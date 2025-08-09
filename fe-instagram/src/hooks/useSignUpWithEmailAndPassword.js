import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { createUserMock, findUserByUid, findUserByUsername } from "../services/mockData";

const useSignUpWithEmailAndPassword = () => {
	const loading = false;
	const error = null;
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const signup = async (inputs) => {
		if (!inputs.email || !inputs.password || !inputs.username || !inputs.fullName) {
			showToast("Error", "Please fill all the fields", "error");
			return;
		}

		const existing = findUserByUsername(inputs.username);
		if (existing) {
			showToast("Error", "Username already exists", "error");
			return;
		}

		try {
			const cred = createUserMock({
				email: inputs.email,
				password: inputs.password,
				username: inputs.username,
				fullName: inputs.fullName,
			});
			const user = findUserByUid(cred.user.uid);
			localStorage.setItem("user-info", JSON.stringify(user));
			loginUser(user);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { loading, error, signup };
};

export default useSignUpWithEmailAndPassword;
