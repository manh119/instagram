import {
	Button,
	Flex,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Text,
	VStack,
	HStack,
	IconButton,
	Tooltip,
	useToast,
	Box,
	useColorModeValue,
	Divider,
	Badge,
	Image,
	Avatar,
	Grid,
	GridItem,
} from "@chakra-ui/react";
import Comment from "../Comment/Comment";
import usePostComment from "../../hooks/usePostComment";
import useDeleteComment from "../../hooks/useDeleteComment";
import useLikePost from "../../hooks/useLikePost";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import postService from "../../services/postService";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";
import { timeAgo } from "../../utils/timeAgo";

const CommentsModal = ({ isOpen, onClose, post, creatorProfile }) => {
	const { handlePostComment, isCommenting } = usePostComment();
	const { handleDeleteComment, isDeleting } = useDeleteComment();
	const { handleLikePost, isLiked, isUpdating } = useLikePost(post);
	const commentRef = useRef(null);
	const commentsContainerRef = useRef(null);
	const [comment, setComment] = useState("");
	const { user: authUser } = useAuth();
	const toast = useToast();

	// Color scheme for better UX
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const inputBg = useColorModeValue("gray.50", "gray.700");
	const likeBg = useColorModeValue("red.50", "red.900");
	const likeBorder = useColorModeValue("red.200", "red.700");
	const cardBg = useColorModeValue("gray.50", "gray.700");

	const handleSubmitComment = async (e) => {
		e.preventDefault();
		if (!comment.trim()) return;

		try {
			await handlePostComment(post.id, comment);
			setComment("");
			// Focus back to input for quick commenting
			setTimeout(() => commentRef.current?.focus(), 100);
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to post comment",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmitComment(e);
		}
	};

	useEffect(() => {
		const scrollToBottom = () => {
			if (commentsContainerRef.current) {
				commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
			}
		};
		if (isOpen) {
			setTimeout(() => {
				scrollToBottom();
			}, 100);
		}
	}, [isOpen, post.comments?.length]);

	// Auto-focus comment input when modal opens
	useEffect(() => {
		if (isOpen && commentRef.current) {
			setTimeout(() => commentRef.current.focus(), 100);
		}
	}, [isOpen]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (!isOpen) return;


		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	// Clear comment when modal closes
	useEffect(() => {
		if (!isOpen) {
			setComment("");
		}
	}, [isOpen]);

	const commentCount = post.comments?.length || 0;
	const likeCount = post.userLikes?.length || 0;

	return (
		<Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom" size="6xl">
			<ModalOverlay backdropFilter="blur(10px)" />
			<ModalContent bg={bgColor} border="1px solid" borderColor={borderColor} maxW="1200px" mx={4}>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<Grid templateColumns={{ base: "1fr", lg: "1fr 450px" }} gap={6}>
						{/* Left Side - Post Image/Video */}
						<GridItem>
							<Box borderRadius="lg" overflow="hidden" boxShadow="lg" w="full">
								{post.imageUrl && (
									<Image
										src={post.imageUrl}
										alt="Post image"
										w="full"
										h="auto"
										objectFit="cover"
										maxH="700px"
									/>
								)}
								{post.videoUrl && (
									<Box as="video"
										src={post.videoUrl}
										controls
										w="full"
										maxH="700px"
										objectFit="cover"
									/>
								)}
							</Box>
						</GridItem>

						{/* Right Side - Content and Comments */}
						<GridItem>
							<Flex direction="column" h="700px" maxH="80vh">
								{/* Post Header */}
								<Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor} flexShrink={0}>
									<HStack spacing={3} mb={3}>
										<Avatar
											size="sm"
											name={creatorProfile?.username || post.createdBy?.username}
											src={creatorProfile?.profileImageUrl || post.createdBy?.profileImageUrl}
										/>
										<VStack spacing={0} align="start" flex={1}>
											<Text fontWeight="bold" fontSize="sm">
												{creatorProfile?.username || post.createdBy?.username}
											</Text>
											<Text fontSize="xs" color="gray.500">
												{timeAgo(post.createdAt)}
											</Text>
										</VStack>
									</HStack>

									{/* Caption */}
									{post.caption && (
										<Text fontSize="sm" lineHeight="1.5" color={useColorModeValue("gray.700", "gray.300")} mb={3}>
											{post.caption}
										</Text>
									)}

									{/* Post Stats */}
									<HStack justify="space-between" align="center" pt={2}>
										<HStack spacing={4}>
											<HStack spacing={2}>
												<IconButton
													icon={isLiked ? <UnlikeLogo /> : <NotificationsLogo />}
													onClick={handleLikePost}
													isLoading={isUpdating}
													colorScheme={isLiked ? "red" : "gray"}
													variant="ghost"
													size="sm"
													_hover={{
														bg: useColorModeValue("red.100", "red.800"),
														transform: "scale(1.05)",
													}}
													transition="all 0.2s"
													aria-label={isLiked ? "Unlike post" : "Like post"}
												/>
												<Text fontSize="sm" fontWeight="medium">
													{likeCount} {likeCount === 1 ? 'like' : 'likes'}
												</Text>
											</HStack>
											<Text fontSize="sm" fontWeight="medium" color="blue.500">
												{commentCount} {commentCount === 1 ? 'comment' : 'comments'}
											</Text>
										</HStack>
									</HStack>
								</Box>

								{/* Comments Section */}
								<Box flex={1} minH={0} display="flex" flexDirection="column">


									{/* Comments list */}
									<Box
										flex={1}
										overflowY="auto"
										overflowX="hidden"
										ref={commentsContainerRef}
										pr={2}
										minH={0}
										sx={{
											'&::-webkit-scrollbar': {
												width: '6px',
											},
											'&::-webkit-scrollbar-track': {
												background: 'transparent',
											},
											'&::-webkit-scrollbar-thumb': {
												background: useColorModeValue('gray.300', 'gray.600'),
												borderRadius: '3px',
											},
											'&::-webkit-scrollbar-thumb:hover': {
												background: useColorModeValue('gray.400', 'gray.500'),
											},
										}}
									>
										{commentCount > 0 ? (
											<VStack spacing={3} align="stretch" pb={2}>
												{post.comments.map((comment, idx) => (
													<Comment
														key={comment.id || idx}
														comment={comment}
														post={post}
														onDelete={handleDeleteComment}
														isDeleting={isDeleting}
														canDelete={authUser && (
															comment.createdBy?.id === authUser.id ||
															comment.createdBy?.userId === authUser.uid ||
															post.createdBy?.id === authUser.id ||
															post.createdBy?.userId === authUser.uid
														)}
													/>
												))}
											</VStack>
										) : (
											<Box textAlign="center" py={8}>
												<Text color="gray.500" fontSize="md" mb={2}>
													No comments yet
												</Text>
												<Text color="gray.400" fontSize="sm">
													Be the first to share your thoughts!
												</Text>
											</Box>
										)}
									</Box>
								</Box>



								{/* Comment Input - Positioned at Bottom */}
								{authUser && (
									<Box p={3} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor} flexShrink={0}>

										<form onSubmit={handleSubmitComment}>
											<VStack spacing={3}>
												<Input
													placeholder="Add a comment..."
													size="md"
													ref={commentRef}
													value={comment}
													onChange={(e) => setComment(e.target.value)}
													onKeyPress={handleKeyPress}
													disabled={isCommenting}
													bg={inputBg}
													border="1px solid"
													borderColor={borderColor}
													_focus={{
														borderColor: "blue.400",
														boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
														bg: bgColor
													}}
													_hover={{
														borderColor: "blue.300"
													}}
													transition="all 0.2s"
												/>

											</VStack>
										</form>
									</Box>
								)}
							</Flex>
						</GridItem>
					</Grid>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default CommentsModal;
