import { Avatar, Flex, Skeleton, SkeletonCircle, Text, IconButton, Tooltip, Box, useColorModeValue } from "@chakra-ui/react";
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
	const bgHover = useColorModeValue("gray.50", "gray.700");
	const borderColor = useColorModeValue("gray.200", "gray.600");

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
			borderRadius="md"
			border="1px solid"
			borderColor={borderColor}
			bg="transparent"
			_hover={{ bg: bgHover }}
			transition="all 0.2s"
		>
			<Flex gap={4} align="start" w="full">
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

				<Flex direction="column" flex={1} minW={0}>
					<Flex gap={2} alignItems="center" justify="space-between">
						<Flex gap={2} alignItems="center" minW={0} flex={1}>
							<ProfileHoverTrigger profile={userProfile} linkTo={`/profiles/${createdById}`}>
								<Text
									fontWeight="bold"
									fontSize="sm"
									cursor="pointer"
									_hover={{
										textDecoration: "underline",
										color: "blue.500"
									}}
									transition="all 0.2s"
									color="blue.400"
								>
									{createdByUsername}
								</Text>
							</ProfileHoverTrigger>
							<Text fontSize="sm" flex={1} wordBreak="break-word" lineHeight="1.4">
								{commentText}
							</Text>
						</Flex>

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
									opacity={0.7}
									_hover={{
										opacity: 1,
										bg: "red.50",
										transform: "scale(1.1)"
									}}
									transition="all 0.2s"
								/>
							</Tooltip>
						)}
					</Flex>

					<Text fontSize="xs" color="gray.500" mt={2}>
						{comment.createdAt ? timeAgo(comment.createdAt) : 'Just now'}
					</Text>
				</Flex>
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
	return (
		<Box p={3} borderRadius="md" border="1px solid" borderColor="gray.200">
			<Flex gap={4} w="full" alignItems="center">
				<SkeletonCircle h={8} w={8} />
				<Flex gap={2} flexDir="column" flex={1}>
					<Skeleton height={3} width={120} />
					<Skeleton height={3} width={80} />
				</Flex>
			</Flex>
		</Box>
	);
};
