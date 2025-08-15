import { Box, Flex, Link, Text, VStack } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import SuggestedHeader from "./SuggestedHeader";
import SuggestedUser from "./SuggestedUser";
import useGetSuggestedUsers from "../../hooks/useGetSuggestedUsers";

const SuggestedUsers = () => {
	const { isLoading, suggestedUsers, refreshUsers } = useGetSuggestedUsers();
	const [users, setUsers] = useState([]);

	// Update local state when suggestedUsers change
	useEffect(() => {
		setUsers(suggestedUsers);
	}, [suggestedUsers]);

	// Function to update a specific user (e.g., after follow/unfollow)
	const updateUser = useCallback((userId, updates) => {
		setUsers(prevUsers =>
			prevUsers.map(user =>
				user.id === userId ? { ...user, ...updates } : user
			)
		);
	}, []);

	// Function to remove a user from suggestions (e.g., after following)
	const removeUser = useCallback((userId) => {
		setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
	}, []);

	// optional: render loading skeleton
	if (isLoading) return null;

	return (
		<VStack py={8} px={6} gap={4}>
			<SuggestedHeader />

			{users.length !== 0 && (
				<Flex alignItems={"center"} justifyContent={"space-between"} w={"full"}>
					<Text fontSize={12} fontWeight={"bold"} color={"gray.500"}>
						Suggested for you
					</Text>
					<Text fontSize={12} fontWeight={"bold"} _hover={{ color: "gray.400" }} cursor={"pointer"}>
						See All
					</Text>
				</Flex>
			)}

			{users.map((user) => (
				<SuggestedUser
					key={user.id}
					user={user}
					updateUser={updateUser}
					removeUser={removeUser}
				/>
			))}

			<Box fontSize={12} color={"gray.500"} mt={5} alignSelf={"start"}>
				© 2023 Built By{" "}
				<Link href='https://www.youtube.com/@asaprogrammer_' target='_blank' color='blue.500' fontSize={14}>
					As a Programmer
				</Link>
			</Box>
		</VStack>
	);
};

export default SuggestedUsers;
