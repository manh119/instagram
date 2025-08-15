import { Flex, Image, Text } from "@chakra-ui/react";
import useShowToast from "../../hooks/useShowToast";
import { useAuth } from "../../contexts/AuthContext";
import { findUserByUid, createUserMock } from "../../services/mockData";

const GoogleAuth = ({ prefix }) => {
	const error = null;
	const showToast = useShowToast();
	const { login } = useAuth();

	const handleGoogleAuth = async () => {
		try {
			const cred = createUserMock({
				email: "mock.google.user@example.com",
				password: "google",
				username: "mockgoogle",
				fullName: "Mock Google User",
			});
			const user = findUserByUid(cred.user.uid);
			const mockToken = "mock.jwt.token.for.testing";
			localStorage.setItem("user-info", JSON.stringify(user));
			await login(user, mockToken);
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
