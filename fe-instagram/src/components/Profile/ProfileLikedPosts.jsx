import { Box, Flex, Grid, Skeleton, Text, VStack } from "@chakra-ui/react";
import ProfilePost from "./ProfilePost";
import useGetLikedPosts from "../../hooks/useGetLikedPosts";

const ProfileLikedPosts = ({ profile }) => {
    const { isLoading, posts, error } = useGetLikedPosts(profile);

    // Debug logging to see what data we're receiving
    console.log('ProfileLikedPosts - Debug Info:', {
        profile,
        isLoading,
        posts,
        postsCount: posts?.length || 0,
        firstPost: posts?.[0],
        hasPosts: Array.isArray(posts) && posts.length > 0,
        error
    });

    // Show error if there's an issue
    if (error) {
        return (
            <Flex flexDir='column' textAlign={"center"} mx={"auto"} mt={10}>
                <Text fontSize={"2xl"} color="red.500">Error loading liked posts 😔</Text>
                <Text fontSize={"md"} color="gray.500" mt={2}>{error}</Text>
            </Flex>
        );
    }

    const noPostsFound = !isLoading && posts.length === 0;
    if (noPostsFound) return <NoLikedPostsFound />;

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

export default ProfileLikedPosts;

const NoLikedPostsFound = () => {
    return (
        <Flex flexDir='column' textAlign={"center"} mx={"auto"} mt={10}>
            <Text fontSize={"2xl"}>No Liked Posts Found 🤔</Text>
            <Text fontSize={"md"} color="gray.500" mt={2}>
                Posts you like will appear here
            </Text>
        </Flex>
    );
};
