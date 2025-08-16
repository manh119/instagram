import { Avatar, Button, Flex, Text } from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import ProfileHoverTrigger from "../ProfilePreview/ProfileHoverTrigger";
import { useAuth } from "../../contexts/AuthContext";
import useShowToast from "../../hooks/useShowToast";
import { useState } from "react";
import usePostStore from "../../store/postStore";
import postService from "../../services/postService";
import ConfirmDialog from "../Common/ConfirmDialog";

const PostHeader = ({ post, creatorProfile }) => {
	const { user: authUser } = useAuth();
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const deletePost = usePostStore((state) => state.deletePost);

	if (!creatorProfile) return null;

	// Check if current user can delete this post
	const canDeletePost = authUser && (
		// User can delete if they created the post
		// Check multiple possible field mappings
		(authUser.uid === post?.createdBy?.userId) ||        // Email matches userId
		(authUser.uid === post?.createdBy?.username) ||      // Email matches username
		(authUser.id === post?.createdBy?.id) ||             // ID matches (if exists)
		(authUser.uid === post?.createdBy?.id)               // UID matches ID (if exists)
	);

	// Debug logging for delete button visibility
	console.log('PostHeader - Delete button debug:', {
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
			console.log('PostHeader - Deleting post:', post.id);

			// Call the real API to delete the post
			await postService.deletePost(post.id);

			// Update local state
			deletePost(post.id);

			showToast("Success", "Post deleted successfully", "success");
		} catch (error) {
			console.error('PostHeader - Error deleting post:', error);
			showToast("Error", error.message || "Failed to delete post", "error");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<Flex justifyContent={"space-between"} alignItems={"center"} w={"full"} py={2} px={4}>
				<Flex gap={4} alignItems={"center"}>
					<ProfileHoverTrigger profile={creatorProfile} linkTo={`/profiles/${creatorProfile.id}`}>
						<Avatar src={creatorProfile.profilePicURL} size={"sm"} cursor={"pointer"} />
					</ProfileHoverTrigger>
					<ProfileHoverTrigger profile={creatorProfile} linkTo={`/profiles/${creatorProfile.id}`}>
						<Text fontWeight={"bold"} fontSize={12} cursor={"pointer"}>
							{creatorProfile.username}
						</Text>
					</ProfileHoverTrigger>
				</Flex>

				{/* Delete button for post owner */}
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

export default PostHeader;
