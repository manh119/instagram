import { Avatar, Flex, Skeleton, SkeletonCircle, Text, IconButton, Tooltip, Box, useColorModeValue, HStack, VStack } from "@chakra-ui/react";
import { useState } from "react";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import ProfileHoverTrigger from "../ProfilePreview/ProfileHoverTrigger";
import { timeAgo } from "../../utils/timeAgo";
import { DeleteIcon } from "@chakra-ui/icons";
import ConfirmDialog from "../Common/ConfirmDialog";

const Comment = ({ comment, post, onDelete, isDeleting, canDelete }) => {
	// Add null checks for comment.createdBy
	const hasCreatedBy = comment?.createdBy && typeof comment.createdBy === 'object';
	const createdById = hasCreatedBy ? (comment.createdBy.id || comment.createdBy.userId) : null;
	const createdByUsername = hasCreatedBy ? comment.createdBy.username : 'Unknown User';
	const { userProfile, isLoading } = useGetUserProfileById(createdById);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Color scheme for better UX
	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const hoverBg = useColorModeValue("gray.50", "gray.700");
	const usernameColor = useColorModeValue("blue.600", "blue.400");
	const timeColor = useColorModeValue("gray.500", "gray.400");

	// Show skeleton while loading or if no createdBy data
	if (isLoading || !hasCreatedBy) {
		return <CommentSkeleton />;
	}

	const handleDeleteClick = () => {
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		if (onDelete && post) {
			await onDelete(comment.id, post.id);
		}
		setShowDeleteConfirm(false);
	};

	// Handle both field names for compatibility
	const commentText = comment.content || comment.comment || "Comment text not available";

	return (
		<Box
			p={3}
			borderRadius="lg"
			border="1px solid"
			borderColor={borderColor}
			bg={bgColor}
			_hover={{
				bg: hoverBg,
				transform: 'translateY(-1px)',
				boxShadow: 'sm',
				borderColor: useColorModeValue('gray.300', 'gray.500')
			}}
			transition="all 0.2s ease-in-out"
		>
			<Flex gap={3} align="start" w="full">
				<ProfileHoverTrigger profile={userProfile} linkTo={`/profiles/${createdById}`}>
					<Avatar
						src={userProfile?.profilePicURL}
						name={createdByUsername}
						size="sm"
						cursor="pointer"
						_hover={{
							opacity: 0.8,
							transform: "scale(1.05)"
						}}
						transition="all 0.2s"
					/>
				</ProfileHoverTrigger>

				<Box flex={1} minW={0}>
					<VStack spacing={2} align="stretch">
						{/* Username and timestamp row */}
						<HStack justify="space-between" align="center">
							<ProfileHoverTrigger profile={userProfile} linkTo={`/profiles/${createdById}`}>
								<Text
									fontWeight="bold"
									fontSize="sm"
									cursor="pointer"
									color={usernameColor}
									_hover={{
										textDecoration: "underline",
										color: useColorModeValue("blue.700", "blue.300")
									}}
									transition="all 0.2s"
								>
									{createdByUsername}
								</Text>
							</ProfileHoverTrigger>

							{canDelete && (
								<Tooltip label="Delete comment" placement="top">
									<IconButton
										icon={<DeleteIcon />}
										size="xs"
										variant="ghost"
										colorScheme="red"
										onClick={handleDeleteClick}
										isLoading={isDeleting}
										aria-label="Delete comment"
										opacity={0.6}
										_hover={{
											opacity: 1,
											bg: "red.50",
											transform: "scale(1.1)"
										}}
										transition="all 0.2s"
									/>
								</Tooltip>
							)}
						</HStack>

						{/* Comment text */}
						<Text
							fontSize="sm"
							lineHeight="1.5"
							color={useColorModeValue("gray.700", "gray.300")}
							wordBreak="break-word"
						>
							{commentText}
						</Text>

						{/* Timestamp */}
						<Text
							fontSize="xs"
							color={timeColor}
							fontStyle="italic"
						>
							{comment.createdAt ? timeAgo(comment.createdAt) : 'Just now'}
						</Text>
					</VStack>
				</Box>
			</Flex>

			{/* Delete confirmation dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete Comment"
				message="Are you sure you want to delete this comment? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				confirmColorScheme="red"
				isLoading={isDeleting}
			/>
		</Box>
	);
};

export default Comment;

const CommentSkeleton = () => {
	const borderColor = useColorModeValue("gray.200", "gray.600");

	return (
		<Box p={3} borderRadius="lg" border="1px solid" borderColor={borderColor}>
			<Flex gap={3} w="full" alignItems="start">
				<SkeletonCircle h={8} w={8} />
				<VStack spacing={2} flex={1} align="stretch">
					<HStack justify="space-between">
						<Skeleton height={3} width={100} />
						<Skeleton height={3} width={20} />
					</HStack>
					<Skeleton height={3} width="80%" />
					<Skeleton height={3} width="60%" />
					<Skeleton height={2} width={60} />
				</VStack>
			</Flex>
		</Box>
	);
};
