import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Flex,
    Image,
    Text,
    VStack,
    HStack,
    Avatar,
    Button,
    IconButton,
    useToast,
    Spinner,
    Center
} from '@chakra-ui/react';
import { FaHeart, FaComment, FaShare, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import postService from '../../services/postService';
import useShowToast from '../../hooks/useShowToast';
import Comment from '../Comment/Comment';
import PostFooter from '../FeedPosts/PostFooter';
import { useImageUrl } from '../../hooks/useImageUrl';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const showToast = useShowToast();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use pre-signed URL for image display
    const { url: imageUrl, loading: imageLoading, error: imageError } = useImageUrl(post?.imageUrl);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await postService.getPostById(postId);
                setPost(response.post);
            } catch (err) {
                setError(err.message);
                showToast("Error", "Failed to load post", "error");
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId, showToast]);

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" />
            </Center>
        );
    }

    if (error || !post) {
        return (
            <Center h="100vh">
                <VStack spacing={4}>
                    <Text fontSize="xl" color="red.500">
                        {error || "Post not found"}
                    </Text>
                    <Button onClick={() => navigate('/')}>
                        Go Back Home
                    </Button>
                </VStack>
            </Center>
        );
    }

    return (
        <Box minH="100vh" bg="gray.50" py={8}>
            <Flex justify="center">
                <Box maxW="4xl" w="full" bg="white" borderRadius="lg" shadow="lg" overflow="hidden">
                    {/* Header */}
                    <Flex p={4} borderBottom="1px" borderColor="gray.200" align="center">
                        <IconButton
                            icon={<FaArrowLeft />}
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            mr={3}
                        />
                        <Text fontSize="lg" fontWeight="semibold">
                            Post by {post.createdBy?.displayName || post.createdBy?.username}
                        </Text>
                    </Flex>

                    {/* Post Content */}
                    <Flex direction={{ base: "column", lg: "row" }}>
                        {/* Media Section */}
                        <Box flex="1" bg="black">
                            {post.imageUrl ? (
                                <VStack spacing={2} w="100%">
                                    {imageLoading && (
                                        <Center h="400px">
                                            <VStack>
                                                <Spinner size="lg" />
                                                <Text>Loading image...</Text>
                                            </VStack>
                                        </Center>
                                    )}
                                    {imageError && (
                                        <Center h="400px" color="red.400">
                                            <Text>Failed to load image</Text>
                                        </Center>
                                    )}
                                    {imageUrl && (
                                        <Image
                                            src={imageUrl}
                                            alt="Post"
                                            w="full"
                                            h="auto"
                                            objectFit="contain"
                                        />
                                    )}
                                </VStack>
                            ) : post.videoUrl ? (
                                <video
                                    src={post.videoUrl}
                                    controls
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            ) : (
                                <Center h="400px" color="gray.400">
                                    <Text>No media content</Text>
                                </Center>
                            )}
                        </Box>

                        {/* Details Section */}
                        <Box flex="1" p={6}>
                            {/* User Info */}
                            <HStack mb={4}>
                                <Avatar
                                    size="sm"
                                    src={post.createdBy?.profileImageUrl}
                                    name={post.createdBy?.displayName || post.createdBy?.username}
                                />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="semibold">
                                        {post.createdBy?.displayName || post.createdBy?.username}
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </Text>
                                </VStack>
                            </HStack>

                            {/* Caption */}
                            {post.caption && (
                                <Text mb={4} fontSize="md">
                                    {post.caption}
                                </Text>
                            )}

                            {/* Post Footer */}
                            <PostFooter post={post} />

                            {/* Comments Section */}
                            <Box mt={6}>
                                <Text fontSize="lg" fontWeight="semibold" mb={4}>
                                    Comments ({post.comments?.length || 0})
                                </Text>

                                {post.comments && post.comments.length > 0 ? (
                                    <VStack spacing={3} align="stretch">
                                        {post.comments.map((comment) => (
                                            <Comment key={comment.id} comment={comment} />
                                        ))}
                                    </VStack>
                                ) : (
                                    <Text color="gray.500" textAlign="center" py={8}>
                                        No comments yet. Be the first to comment!
                                    </Text>
                                )}
                            </Box>
                        </Box>
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
};

export default PostDetail;
