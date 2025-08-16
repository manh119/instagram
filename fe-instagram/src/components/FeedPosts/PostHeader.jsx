import React from "react";
import { Box, Flex, Text, Avatar, Button } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../../contexts/AuthContext";
import ProfileHoverTrigger from "../ProfilePreview/ProfileHoverTrigger";
import ConfirmDialog from "../Common/ConfirmDialog";
import usePostStore from "../../store/postStore";
import postService from "../../services/postService";
import useShowToast from "../../hooks/useShowToast";

const PostHeader = ({ post, creatorProfile }) => {
	const { user: authUser } = useAuth();
	const { posts, setPosts } = usePostStore();
	const showToast = useShowToast();
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

	const canDeletePost = authUser && (
		authUser.uid === post.createdBy?.userId ||
		authUser.uid === post.createdBy?.username ||
		authUser.id === post.createdBy?.id
	);

	const handleDeletePost = async () => {
		if (isDeleting) return;

		setIsDeleting(true);
		try {
			await postService.deletePost(post.id);

			// Remove post from store
			const updatedPosts = posts.filter(p => p.id !== post.id);
			setPosts(updatedPosts);

			showToast("Success", "Post deleted successfully", "success");
			setShowDeleteConfirm(false);
		} catch (error) {
			console.error("Error deleting post:", error);
			showToast("Error", error.message || "Failed to delete post", "error");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Flex justifyContent="space-between" alignItems="center" w="full" p={3}>
			<Flex alignItems="center" gap={2}>
				<ProfileHoverTrigger profile={creatorProfile} linkTo={`/profiles/${creatorProfile?.id}`}>
					<Flex alignItems="center" gap={2}>
						<Avatar
							size="sm"
							name={creatorProfile?.username || post.createdBy?.username}
							src={creatorProfile?.profileImageUrl || post.createdBy?.profileImageUrl}
							cursor="pointer"
							_hover={{ transform: "scale(1.05)" }}
							transition="transform 0.2s"
						/>

						<Box>
							<Link to={`/profiles/${creatorProfile?.id || post.createdBy?.id}`}>
								<Text
									fontWeight="bold"
									fontSize="sm"
									cursor="pointer"
									_hover={{ color: "blue.500" }}
									transition="color 0.2s"
								>
									{creatorProfile?.username || post.createdBy?.username}
								</Text>
							</Link>

							{post.createdAt && (
								<Text fontSize="xs" color="gray.500">
									{new Date(post.createdAt).toLocaleDateString()}
								</Text>
							)}
						</Box>
					</Flex>
				</ProfileHoverTrigger>
			</Flex>

			{/* Delete Button */}
			{canDeletePost && (
				<Button
					size="sm"
					colorScheme="red"
					variant="ghost"
					onClick={() => setShowDeleteConfirm(true)}
					isLoading={isDeleting}
					_hover={{
						bg: "red.50",
						transform: "scale(1.05)",
					}}
					_active={{
						transform: "scale(0.95)",
					}}
					transition="all 0.2s"
				>
					<DeleteIcon />
				</Button>
			)}

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDeletePost}
				title="Delete Post"
				message="Are you sure you want to delete this post? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				confirmColorScheme="red"
				isLoading={isDeleting}
			/>
		</Flex>
	);
};

export default PostHeader;
