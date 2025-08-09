import useShowToast from "./useShowToast";
import useAuthStore from "../store/authStore";
import { signInWithEmailAndPasswordMock, findUserByUid } from "../services/mockData";

const useLogin = () => {
	const showToast = useShowToast();
	const loading = false;
	const error = null;
	const loginUser = useAuthStore((state) => state.login);

	const login = async (inputs) => {
		if (!inputs.email || !inputs.password) {
			return showToast("Error", "Please fill all the fields", "error");
		}
		try {
			const cred = signInWithEmailAndPasswordMock(inputs.email, inputs.password);
			const user = findUserByUid(cred.user.uid);
			localStorage.setItem("user-info", JSON.stringify(user));
			loginUser(user);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return { loading, error, login };
};

export default useLogin;
