import React, { useState } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	useDisclosure,
	GridItem,
	Image,
	Text,
	Button,
	Box,
	IconButton,
	Avatar,
	Divider,
	Flex,
	Grid,
	VStack,
	HStack
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { AiFillHeart } from "react-icons/ai";
import { FaComment } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import ResponsiveVideoContainer from "../Common/ResponsiveVideoContainer";
import Comment from "../Comment/Comment";
import PostFooter from "../FeedPosts/PostFooter";
import useUserProfileStore from "../../store/userProfileStore";
import { useAuth } from "../../contexts/AuthContext";
import useShowToast from "../../hooks/useShowToast";
import usePostStore from "../../store/postStore";
import Caption from "../Comment/Caption";
import postService from "../../services/postService";
import ConfirmDialog from "../Common/ConfirmDialog";

const ProfilePost = ({ post }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const deletePost = usePostStore((state) => state.deletePost);
	const decrementPostsCount = useUserProfileStore((state) => state.deletePost);

	// Debug logging to see post data
	console.log('ProfilePost - post data:', post);
	console.log('ProfilePost - authUser:', authUser);
	console.log('ProfilePost - userProfile:', userProfile);

	// Safely get likes and comments with fallbacks
	const likesCount = post?.userLikes?.length || post?.likes?.length || 0;
	const commentsCount = post?.comments?.length || 0;
	const hasComments = Array.isArray(post?.comments) && post.comments.length > 0;

	// Check if current user can delete this post
	const canDeletePost = authUser && (
		// User can delete if they created the post
		// Check multiple possible field mappings
		(authUser.uid === post?.createdBy?.userId) ||        // Email matches userId
		(authUser.uid === post?.createdBy?.username) ||      // Email matches username
		(authUser.id === post?.createdBy?.id) ||             // ID matches (if exists)
		(authUser.uid === post?.createdBy?.id) ||            // UID matches ID (if exists)
		// Or if they're viewing their own profile and the post belongs to them
		(userProfile && (
			(authUser.uid === userProfile.userId) ||          // Email matches profile userId
			(authUser.uid === userProfile.username) ||        // Email matches profile username
			(authUser.id === userProfile.id) ||               // ID matches (if exists)
			(authUser.uid === userProfile.id)                 // UID matches ID (if exists)
		))
	);

	// Debug logging for delete button visibility
	console.log('ProfilePost - Delete button debug:', {
		postId: post?.id,
		authUserUid: authUser?.uid,
		postCreatedByUserId: post?.createdBy?.userId,
		postCreatedByUsername: post?.createdBy?.username,
		canDeletePost
	});

	const handleDeleteClick = () => {
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		setShowDeleteConfirm(false);
		if (isDeleting) return;

		setIsDeleting(true);

		try {
			console.log('ProfilePost - Deleting post:', post.id);

			// Call the real API to delete the post
			await postService.deletePost(post.id);

			// Update local state
			deletePost(post.id);
			decrementPostsCount(post.id);

			// Close the modal
			onClose();

			showToast("Success", "Post deleted successfully", "success");
		} catch (error) {
			console.error('ProfilePost - Error deleting post:', error);
			showToast("Error", error.message || "Failed to delete post", "error");
		} finally {
			setIsDeleting(false);
		}
	};

	// Don't render if post is missing required data
	if (!post || (!post.imageUrl && !post.videoUrl)) {
		console.warn('ProfilePost - Missing required post data:', post);
		return null;
	}

	const renderMedia = (isGrid = false) => {
		if (post.videoUrl) {
			if (isGrid) {
				// For grid view, show a video thumbnail with play icon and auto-play
				return (
					<ResponsiveVideoContainer variant="grid">
						<video
							src={post.videoUrl}
							muted
							loop
							preload="metadata"
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover"
							}}
							onMouseEnter={(e) => {
								// Auto-play on hover for grid view
								e.target.play().catch(() => {
									// Auto-play might fail due to browser policies
									console.log('Grid video hover play failed');
								});
							}}
							onMouseLeave={(e) => {
								// Pause when not hovering
								e.target.pause();
							}}
						/>
						<Box
							className="play-button-overlay"
							position="absolute"
							top="50%"
							left="50%"
							transform="translate(-50%, -50%)"
						>
							<Box className="play-icon" />
						</Box>
					</ResponsiveVideoContainer>
				);
			} else {
				// For modal view, show video with controls and auto-play
				return (
					<ResponsiveVideoContainer variant="modal">
						<video
							src={post.videoUrl}
							controls
							muted
							loop
							autoPlay
							preload="metadata"
							style={{
								maxHeight: "100%",
								maxWidth: "100%",
								objectFit: "contain"
							}}
						/>
					</ResponsiveVideoContainer>
				);
			}
		} else if (post.imageUrl) {
			return (
				<Image
					src={post.imageUrl}
					alt='profile post'
					w={"100%"}
					h={"100%"}
					objectFit={isGrid ? "cover" : "contain"}
				/>
			);
		}
		return null;
	};

	return (
		<>
			<GridItem
				cursor={"pointer"}
				borderRadius={4}
				overflow={"hidden"}
				border={"1px solid"}
				borderColor={"whiteAlpha.300"}
				position={"relative"}
				aspectRatio={1 / 1}
				onClick={onOpen}
			>
				{/* Delete button overlay for grid view */}
				{canDeletePost && (
					<Box
						position="absolute"
						top={2}
						right={2}
						zIndex={2}
						onClick={(e) => {
							e.stopPropagation(); // Prevent opening modal when clicking delete
							handleDeleteClick();
						}}
					>
						<Button
							size="sm"
							bg="red.500"
							color="white"
							_hover={{ bg: "red.600" }}
							borderRadius="full"
							p={2}
							minW="auto"
							isLoading={isDeleting}
							title="Delete post"
						>
							<MdDelete size={16} />
						</Button>
					</Box>
				)}

				<Flex
					opacity={0}
					_hover={{ opacity: 1 }}
					position={"absolute"}
					top={0}
					left={0}
					right={0}
					bottom={0}
					bg={"blackAlpha.700"}
					transition={"all 0.3s ease"}
					zIndex={1}
					justifyContent={"center"}
				>
					<Flex alignItems={"center"} justifyContent={"center"} gap={50}>
						<Flex>
							<AiFillHeart size={20} />
							<Text fontWeight={"bold"} ml={2}>
								{likesCount}
							</Text>
						</Flex>

						<Flex>
							<FaComment size={20} />
							<Text fontWeight={"bold"} ml={2}>
								{commentsCount}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				{renderMedia(true)}
			</GridItem>

			<Modal isOpen={isOpen} onClose={onClose} isCentered={true} size={{ base: "3xl", md: "5xl" }}>
				<ModalOverlay />
				<ModalContent>
					<ModalCloseButton />
					<ModalBody bg={"black"} pb={5}>
						<Flex
							gap='4'
							w={{ base: "90%", sm: "70%", md: "full" }}
							mx={"auto"}
							maxH={"90vh"}
							minH={"50vh"}
						>
							<Flex
								borderRadius={4}
								overflow={"hidden"}
								border={"1px solid"}
								borderColor={"whiteAlpha.300"}
								flex={1.5}
								justifyContent={"center"}
								alignItems={"center"}
							>
								{renderMedia(false)}
							</Flex>
							<Flex flex={1} flexDir={"column"} px={10} display={{ base: "none", md: "flex" }}>
								<Flex alignItems={"center"} justifyContent={"space-between"}>
									<Flex alignItems={"center"} gap={4}>
										<Avatar src={userProfile?.profilePicURL} size={"sm"} name={userProfile?.username || 'User'} />
										<Text fontWeight={"bold"} fontSize={12}>
											{userProfile?.username || 'Unknown User'}
										</Text>
									</Flex>

									{canDeletePost && (
										<Button
											size={"sm"}
											bg={"transparent"}
											_hover={{ bg: "whiteAlpha.300", color: "red.600" }}
											borderRadius={4}
											p={1}
											onClick={handleDeleteClick}
											isLoading={isDeleting}
											title="Delete post"
										>
											<MdDelete size={20} cursor='pointer' />
										</Button>
									)}
								</Flex>
								<Divider my={4} bg={"gray.500"} />

								<VStack w='full' alignItems={"start"} maxH={"350px"} overflowY={"auto"}>
									{/* CAPTION */}
									{post.caption && <Caption post={post} />}
									{/* COMMENTS */}
									{hasComments && post.comments.map((comment) => (
										<Comment key={comment.id} comment={comment} />
									))}
								</VStack>
								<Divider my={4} bg={"gray.8000"} />

								<PostFooter isProfilePage={true} post={post} />
							</Flex>
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete Post"
				message="Are you sure you want to delete this post? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				confirmColor="red"
				isLoading={isDeleting}
			/>
		</>
	);
};

export default ProfilePost;
