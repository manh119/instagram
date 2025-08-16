import { Avatar, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProfileLink = () => {
	const { user: authUser } = useAuth();

	if (!authUser) return null;

	return (
		<Link to="/profiles/me">
			<Flex alignItems={"center"} gap={4} cursor={"pointer"} p={2} borderRadius={6} _hover={{ bg: "whiteAlpha.400" }}>
				<Avatar src={authUser.profilePicURL} size={"sm"} />
				<Flex direction={"column"} fontSize={12}>
					<Text fontWeight={"bold"}>{authUser.username}</Text>
					<Text color={"gray.light"}>{authUser.fullName}</Text>
				</Flex>
			</Flex>
		</Link>
	);
};

export default ProfileLink;
