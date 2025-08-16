import { Avatar, Button, Flex, Text, VStack } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";
import ProfileHoverTrigger from "../ProfilePreview/ProfileHoverTrigger";

const SuggestedUser = ({ user }) => {
	const { handleFollowUser, isFollowing, isUpdating } = useFollowUser(user.id);

	return (
		<Flex gap={4} alignItems={"center"} justifyContent={"space-between"} w={"full"}>
			<Flex gap={4} alignItems={"center"} flex={1}>
				<ProfileHoverTrigger profile={user} linkTo={`/profiles/${user.id}`}>
					<Avatar src={user.profilePicURL} size={"md"} cursor={"pointer"} />
				</ProfileHoverTrigger>
				<VStack alignItems={"start"} gap={1} flex={1}>
					<ProfileHoverTrigger profile={user} linkTo={`/profiles/${user.id}`}>
						<Text fontSize={12} fontWeight={"bold"} cursor={"pointer"}>
							{user.username}
						</Text>
					</ProfileHoverTrigger>
					<Text fontSize={11} color={"gray.light"}>
						{user.fullName}
					</Text>
				</VStack>
			</Flex>
			<Button
				size={"xs"}
				bg={"transparent"}
				color={"blue.500"}
				fontWeight={"bold"}
				_hover={{
					color: "white",
				}}
				transition={"0.2s ease-in-out"}
				onClick={handleFollowUser}
				isLoading={isUpdating}
			>
				{isFollowing ? "Unfollow" : "Follow"}
			</Button>
		</Flex>
	);
};

export default SuggestedUser;
