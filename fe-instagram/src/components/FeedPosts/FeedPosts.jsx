import { Box, Container, Flex, Skeleton, SkeletonCircle, Text, VStack, Button, Center } from "@chakra-ui/react";
import FeedPost from "./FeedPost";
import useGetFeedPosts from "../../hooks/useGetFeedPosts";

const FeedPosts = () => {
	const { isLoading, posts, hasMore, loadMorePosts, refreshPosts } = useGetFeedPosts();

	return (
		<Container maxW={"container.sm"} py={10} px={2}>
			{isLoading &&
				[0, 1, 2].map((_, idx) => (
					<VStack key={idx} gap={4} alignItems={"flex-start"} mb={10}>
						<Flex gap='2'>
							<SkeletonCircle size='10' />
							<VStack gap={2} alignItems={"flex-start"}>
								<Skeleton height='10px' w={"200px"} />
								<Skeleton height='10px' w={"200px"} />
							</VStack>
						</Flex>
						<Skeleton w={"full"}>
							<Box h={"400px"}>contents wrapped</Box>
						</Skeleton>
					</VStack>
				))}

			{!isLoading && posts.length > 0 && (
				<>
					{posts.map((post) => <FeedPost key={post.id} post={post} />)}

					{hasMore && (
						<Center mt={6}>
							<Button
								onClick={loadMorePosts}
								colorScheme="blue"
								variant="outline"
								size="lg"
							>
								Load More Posts
							</Button>
						</Center>
					)}

					{!hasMore && posts.length > 0 && (
						<Center mt={6}>
							<Text color="gray.500" fontSize="sm">
								You've reached the end of your feed! 🎉
							</Text>
						</Center>
					)}
				</>
			)}

			{!isLoading && posts.length === 0 && (
				<Center py={20}>
					<VStack spacing={4}>
						<Text fontSize={"xl"} color={"gray.500"} textAlign="center">
							Welcome to your feed! 📱
						</Text>
						<Text color={"gray.400"} textAlign="center">
							{posts.length === 0 ?
								"It's time to stop coding and make new friends! 😄" :
								"No posts to show right now."
							}
						</Text>
						<Button onClick={refreshPosts} colorScheme="blue" variant="ghost">
							Refresh Feed
						</Button>
					</VStack>
				</Center>
			)}
		</Container>
	);
};

export default FeedPosts;
