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
} from "@chakra-ui/react";
import Comment from "../Comment/Comment";
import usePostComment from "../../hooks/usePostComment";
import useDeleteComment from "../../hooks/useDeleteComment";
import useLikePost from "../../hooks/useLikePost";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import postService from "../../services/postService";
import { NotificationsLogo, UnlikeLogo } from "../../assets/constants";

const CommentsModal = ({ isOpen, onClose, post }) => {
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

			// Press 'C' to focus comment input
			if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
				e.preventDefault();
				commentRef.current?.focus();
			}
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

	return (
		<Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom" size="5xl">
			<ModalOverlay backdropFilter="blur(10px)" />
			<ModalContent bg={bgColor} border="1px solid" borderColor={borderColor} maxW="1100px" mx={4}>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<Flex gap={4} direction={{ base: "column", md: "row" }}>
						{/* Left Side - Post Image Only (Bigger for Modal) */}
						<Box flex="1" minW="450px" maxW="550px">
							{post.imageUrl && (
								<Box borderRadius="lg" overflow="hidden" boxShadow="lg" w="full">
									<Image
										src={post.imageUrl}
										alt="Post image"
										w="full"
										h="auto"
										objectFit="cover"
										maxH="600px"
									/>
								</Box>
							)}
						</Box>

						{/* Right Side - Caption, Likes, and Comments */}
						<Box flex="1" minW="250px">
							<VStack spacing={3} align="stretch">
								{/* Post Caption - Top Right (Compact) */}
								{post.caption && (
									<Box p={3} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("gray.200", "gray.600")}>
										<Flex alignItems="center" gap={2} mb={2}>
											<Avatar
												size="xs"
												name={post.createdBy?.username}
												src={post.createdBy?.profileImageUrl}
											/>
											<Text fontWeight="bold" fontSize="sm">
												{post.createdBy?.username}
											</Text>
										</Flex>
										<Text fontSize="sm" lineHeight="1.4">
											{post.caption}
										</Text>
									</Box>
								)}

								{/* Likes Section - Inline Style (Like Post Footer) */}
								<Flex alignItems="center" justify="space-between" py={2}>
									<Flex alignItems="center" gap={3}>
										{/* Like/Unlike Button */}
										{authUser && (
											<Tooltip label={isLiked ? "Unlike" : "Like"} placement="top">
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
											</Tooltip>
										)}

										{/* Like Count Display */}
										{post.userLikes && post.userLikes.length > 0 ? (
											<Text fontSize="sm" color="gray.600" fontWeight="medium">
												{post.userLikes.length} {post.userLikes.length === 1 ? 'like' : 'likes'}
											</Text>
										) : (
											<Text fontSize="sm" color="gray.500" fontStyle="italic">
												No likes yet
											</Text>
										)}
									</Flex>
								</Flex>

								<Divider />

								{/* Comments Section - Compact */}
								<Box>
									<Text fontSize="md" fontWeight="bold" mb={2} color={useColorModeValue("gray.700", "gray.300")}>
										Comments ({commentCount})
									</Text>

									{/* Comments list - Reduced Height */}
									<Box
										maxH="250px"
										overflowY="auto"
										ref={commentsContainerRef}
										px={2}
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
											<VStack spacing={2} align="stretch">
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
											<Box textAlign="center" py={6}>
												<Text color="gray.500" fontSize="md" mb={1}>
													No comments yet
												</Text>
												<Text color="gray.400" fontSize="sm">
													Be the first to share your thoughts!
												</Text>
											</Box>
										)}
									</Box>
								</Box>

								<Divider />

								{/* Comment input - Compact */}
								{authUser && (
									<Box>
										<Text fontSize="xs" color="gray.500" mb={2} textAlign="center">
											💡 Press <Text as="span" fontWeight="bold">C</Text> to focus comment input
										</Text>
										<form onSubmit={handleSubmitComment}>
											<VStack spacing={2}>
												<Input
													placeholder="Add a comment..."
													size="sm"
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
												<Button
													type="submit"
													colorScheme="blue"
													size="sm"
													isLoading={isCommenting}
													disabled={!comment.trim()}
													px={6}
													borderRadius="full"
													_hover={{
														transform: comment.trim() ? "translateY(-1px)" : "none",
														boxShadow: comment.trim() ? "lg" : "none",
													}}
													transition="all 0.2s"
												>
													Post Comment
												</Button>
											</VStack>
										</form>
									</Box>
								)}
							</VStack>
						</Box>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default CommentsModal;
