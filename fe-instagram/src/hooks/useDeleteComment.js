import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import useShowToast from "./useShowToast";
import usePostStore from "../store/postStore";
import postService from "../services/postService";

const useDeleteComment = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const { user: authUser } = useAuth();
    const showToast = useShowToast();
    const { posts, setPosts } = usePostStore();

    const handleDeleteComment = async (commentId, postId) => {
        if (isDeleting) return;
        if (!authUser) return showToast("Error", "You must be logged in to delete comments", "error");

        setIsDeleting(true);

        try {
            await postService.deleteComment(commentId);

            // Update the post in the store to remove the deleted comment
            const updatedPosts = posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: post.comments.filter(comment => comment.id !== commentId)
                    };
                }
                return post;
            });

            setPosts(updatedPosts);
            showToast("Success", "Comment deleted successfully", "success");
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast("Error", error.message || "Failed to delete comment", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return { handleDeleteComment, isDeleting };
};

export default useDeleteComment;
