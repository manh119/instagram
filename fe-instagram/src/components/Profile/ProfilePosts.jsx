import { Box, Flex, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import ProfilePost from "./ProfilePost";
import useGetUserPosts from "../../hooks/useGetUserPosts";

const ProfilePosts = ({ profile }) => {
	const { isLoading, posts } = useGetUserPosts(profile);

	// Debug logging to see what data we're receiving
	console.log('ProfilePosts - Debug Info:', {
		profile,
		isLoading,
		posts,
		postsCount: posts?.length || 0,
		firstPost: posts?.[0],
		hasPosts: Array.isArray(posts) && posts.length > 0
	});

	// Additional debugging for first post structure
	if (posts && posts.length > 0) {
		const firstPost = posts[0];
		console.log('ProfilePosts - First post detailed structure:', {
			id: firstPost.id,
			imageUrl: firstPost.imageUrl,
			caption: firstPost.caption,
			createdAt: firstPost.createdAt,
			createdBy: firstPost.createdBy,
			createdByType: typeof firstPost.createdBy,
			createdById: firstPost.createdBy?.id,
			createdByUsername: firstPost.createdBy?.username,
			comments: firstPost.comments,
			userLikes: firstPost.userLikes,
			allKeys: Object.keys(firstPost)
		});
	}

	const noPostsFound = !isLoading && posts.length === 0;
	if (noPostsFound) return <NoPostsFound />;

	return (
		<Grid
			templateColumns={{
				sm: "repeat(1, 1fr)",
				md: "repeat(3, 1fr)",
			}}
			gap={1}
			columnGap={1}
		>
			{isLoading &&
				[0, 1, 2].map((_, idx) => (
					<VStack key={idx} alignItems={"flex-start"} gap={4}>
						<Skeleton w={"full"}>
							<Box h='300px'>contents wrapped</Box>
						</Skeleton>
					</VStack>
				))}

			{!isLoading && (
				<>
					{posts.map((post) => (
						<ProfilePost post={post} key={post.id} />
					))}
				</>
			)}
		</Grid>
	);
};

export default ProfilePosts;

const NoPostsFound = () => {
	return (
		<Flex flexDir='column' textAlign={"center"} mx={"auto"} mt={10}>
			<Text fontSize={"2xl"}>No Posts Found🤔</Text>
		</Flex>
	);
};
