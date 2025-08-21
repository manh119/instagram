import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    VStack,
    HStack,
    Text,
    Button,
    Spinner,
    useToast,
    useColorModeValue,
    Flex,
    Badge
} from '@chakra-ui/react';
import { ArrowBackIcon, ChatIcon, StarIcon } from '@chakra-ui/icons';
import postService from '../../services/postService';
import FeedPost from '../../components/FeedPosts/FeedPost';
import CommentsModal from '../../components/Modals/CommentsModal';
import { timeAgo } from '../../utils/timeAgo';

const PostDetailPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

    // Color scheme
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const cardBg = useColorModeValue('gray.50', 'gray.700');

    // Fetch post details
    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await postService.getPostWithRelationships(parseInt(postId));
                setPost(response.post);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err.message || 'Failed to load post');
                toast({
                    title: "Error",
                    description: "Failed to load post details",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [postId, toast]);

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Handle comment modal open
    const handleOpenComments = () => {
        setIsCommentsModalOpen(true);
    };

    if (isLoading) {
        return (
            <Container maxW="container.md" py={8}>
                <Flex justify="center" align="center" minH="400px">
                    <Spinner size="xl" />
                </Flex>
            </Container>
        );
    }

    if (error || !post) {
        return (
            <Container maxW="container.md" py={8}>
                <VStack spacing={6}>
                    <Text fontSize="xl" color="red.500">
                        {error || 'Post not found'}
                    </Text>
                    <Button onClick={handleBack} leftIcon={<ArrowBackIcon />}>
                        Go Back
                    </Button>
                </VStack>
            </Container>
        );
    }

    const commentCount = post.comments?.length || 0;
    const likeCount = post.userLikes?.length || 0;

    return (
        <Container maxW="container.md" py={4}>
            <VStack spacing={4} align="stretch">


                {/* Post content - like feed but single post */}
                <Box
                    bg={bgColor}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                    maxH="85vh"
                >
                    <FeedPost post={post} isDetailPage={true} />
                </Box>


            </VStack>

            {/* Comments Modal */}
            <CommentsModal
                isOpen={isCommentsModalOpen}
                onClose={() => setIsCommentsModalOpen(false)}
                post={post}
            />
        </Container>
    );
};

export default PostDetailPage;
