import { useState, useRef } from "react";
import {
	Box,
	HStack,
	Text,
	Input,
	Button,
	IconButton,
	Tooltip,
	useDisclosure,
	VStack,
	Flex,
	useColorModeValue,
	ScaleFade,
	SlideFade,
} from "@chakra-ui/react";
import { NotificationsLogo, UnlikeLogo, CommentLogo } from "../../assets/constants";
import useLikePost from "../../hooks/useLikePost";
import usePostComment from "../../hooks/usePostComment";
import CommentsModal from "../Modals/CommentsModal";

const PostFooter = ({ post, creatorProfile }) => {
	const [comment, setComment] = useState("");
	const commentRef = useRef();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { handleLikePost, isLiked, likes, isUpdating } = useLikePost(post);
	const { handlePostComment, isCommenting } = usePostComment();

	// Color scheme for better UX
	const likeColor = useColorModeValue("red.500", "red.400");
	const bgHover = useColorModeValue("gray.100", "gray.700");

	const handleSubmitComment = async () => {
		if (!comment.trim()) return;

		try {
			await handlePostComment(post.id, comment);
			setComment("");
			commentRef.current?.focus();
		} catch (error) {
			console.error("Error posting comment:", error);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmitComment();
		}
	};

	const handleLikeClick = () => {
		if (!isUpdating) {
			handleLikePost();
		}
	};

	const likeCount = Array.isArray(likes) ? likes.length : 0;
	const commentCount = post.comments?.length || 0;

	return (
		<Box>
			{/* Like and Comment Actions */}
			<HStack spacing={4} mb={3}>
				<Tooltip label={isLiked ? "Unlike" : "Like"} placement="top">
					<IconButton
						icon={isLiked ? <UnlikeLogo /> : <NotificationsLogo />}
						onClick={handleLikeClick}
						isLoading={isUpdating}
						colorScheme={isLiked ? "red" : "gray"}
						variant="ghost"
						size="lg"
						_hover={{
							bg: bgHover,
							transform: "scale(1.1)",
						}}
						_active={{
							transform: "scale(0.95)",
						}}
						transition="all 0.2s"
						aria-label={isLiked ? "Unlike post" : "Like post"}
					/>
				</Tooltip>

				<Tooltip label="View Comments" placement="top">
					<IconButton
						icon={<CommentLogo />}
						onClick={onOpen}
						variant="ghost"
						size="lg"
						_hover={{
							bg: bgHover,
							transform: "scale(1.1)",
						}}
						_active={{
							transform: "scale(0.95)",
						}}
						transition="all 0.2s"
						aria-label="View comments"
					/>
				</Tooltip>
			</HStack>

			{/* Like Count - Clickable to show who liked */}
			{likeCount > 0 && (
				<ScaleFade in={true} initialScale={0.8}>
					<Text
						fontWeight="semibold"
						fontSize="sm"
						mb={2}
						cursor="pointer"
						onClick={onOpen}
						_hover={{ color: likeColor }}
						transition="color 0.2s"
					>
						{likeCount} {likeCount === 1 ? "like" : "likes"}
					</Text>
				</ScaleFade>
			)}

			{/* Caption */}
			{post.caption && (
				<SlideFade in={true} offsetY="20px">
					<Text fontSize="sm" mb={3} lineHeight="1.4">
						<Text as="span" fontWeight="semibold" mr={2}>
							{creatorProfile?.username || post.createdBy?.username}
						</Text>
						{post.caption}
					</Text>
				</SlideFade>
			)}

			{/* Comments Preview */}
			{commentCount > 0 && (
				<SlideFade in={true} offsetY="20px">
					<VStack align="stretch" spacing={2} mb={3}>
						{/* Show first 2 comments */}
						{post.comments.slice(0, 1).map((comment) => (
							<Text key={comment.id} fontSize="sm" lineHeight="1.4">
								<Text as="span" fontWeight="semibold" mr={2}>
									{comment.createdBy?.username || "Unknown User"}
								</Text>
								{comment.content || comment.comment || "Comment text not available"}
							</Text>
						))}

						{/* View All Comments Button */}
						{commentCount > 2 && (
							<Button
								variant="ghost"

								size="sm"
								color="gray.500"
								onClick={onOpen}
								_hover={{
									color: "blue.500",
									bg: "blue.50"
								}}
								transition="all 0.2s"

							>
								View all {commentCount} comments
							</Button>
						)}
					</VStack>
				</SlideFade>
			)}

			{/* Comment Input */}
			<SlideFade in={true} offsetY="20px">
				<Flex gap={2} mt={3}>
					<Input
						ref={commentRef}
						placeholder="Add a comment..."
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isCommenting}
						size="sm"
						borderRadius="full"
						_focus={{
							borderColor: "blue.800",
							boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
						}}
						_placeholder={{ color: "gray.500" }}
						transition="all 0.2s"
					/>

				</Flex>
			</SlideFade>

			{/* Comments Modal */}
			<CommentsModal
				isOpen={isOpen}
				onClose={onClose}
				post={post}
				creatorProfile={creatorProfile}
			/>
		</Box>
	);
};

export default PostFooter;
