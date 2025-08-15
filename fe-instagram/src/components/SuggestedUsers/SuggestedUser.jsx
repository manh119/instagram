import { Avatar, Box, Button, Flex, VStack } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const SuggestedUser = ({ user, updateUser, removeUser }) => {
	const { isFollowing, isUpdating, handleFollowUser } = useFollowUser(user.id); // Use profile.id instead of uid
	const { user: authUser } = useAuth();

	const onFollowUser = async () => {
		try {
			await handleFollowUser();

			if (isFollowing) {
				// Unfollowed - update follower count
				updateUser(user.id, {
					followersCount: user.followersCount - 1
				});
			} else {
				// Followed - remove from suggestions and update follower count
				updateUser(user.id, {
					followersCount: user.followersCount + 1
				});
				// Optionally remove from suggestions after following
				// removeUser(user.id);
			}
		} catch (error) {
			console.error('Error in follow/unfollow:', error);
		}
	};

	return (
		<Flex justifyContent={"space-between"} alignItems={"center"} w={"full"}>
			<Flex alignItems={"center"} gap={2}>
				<Link to={`/${user.username}`}>
					<Avatar src={user.profilePicURL} size={"md"} />
				</Link>
				<VStack spacing={2} alignItems={"flex-start"}>
					<Link to={`/${user.username}`}>
						<Box fontSize={12} fontWeight={"bold"}>
							{user.fullName}
						</Box>
					</Link>
					<Box fontSize={11} color={"gray.500"}>
						{user.followersCount} followers
					</Box>
				</VStack>
			</Flex>
			{authUser.uid !== user.uid && (
				<Button
					fontSize={13}
					bg={"transparent"}
					p={0}
					h={"max-content"}
					fontWeight={"medium"}
					color={"blue.400"}
					cursor={"pointer"}
					_hover={{ color: "white" }}
					onClick={onFollowUser}
					isLoading={isUpdating}
				>
					{isFollowing ? "Unfollow" : "Follow"}
				</Button>
			)}
		</Flex>
	);
};

export default SuggestedUser;
