import { Flex, Image, Text } from "@chakra-ui/react";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import { findUserByUid, createUserMock } from "../../services/mockData";

const GoogleAuth = ({ prefix }) => {
	const error = null;
	const showToast = useShowToast();
	const loginUser = useAuthStore((state) => state.login);

	const handleGoogleAuth = async () => {
		try {
			const cred = createUserMock({
				email: "mock.google.user@example.com",
				password: "google",
				username: "mockgoogle",
				fullName: "Mock Google User",
			});
			const user = findUserByUid(cred.user.uid);
			localStorage.setItem("user-info", JSON.stringify(user));
			loginUser(user);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"} onClick={handleGoogleAuth}>
			<Image src='/google.png' w={5} alt='Google logo' />
			<Text mx='2' color={"blue.500"}>
				{prefix} with Google
			</Text>
		</Flex>
	);
};

export default GoogleAuth;
