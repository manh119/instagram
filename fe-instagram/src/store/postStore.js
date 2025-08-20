import { create } from "zustand";

const usePostStore = create((set) => ({
	posts: [],
	createPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
	deletePost: (id) => set((state) => ({ posts: state.posts.filter((post) => post.id !== id) })),
	setPosts: (posts) => set({ posts }),
	addPosts: (newPosts) => set((state) => ({
		posts: [...state.posts, ...newPosts]
	})),
	addComment: (postId, comment) =>
		set((state) => ({
			posts: state.posts.map((post) => {
				if (post.id === postId) {
					return {
						...post,
						comments: [...post.comments, comment],
					};
				}
				return post;
			}),
		})),
	updatePost: (postId, updates) =>
		set((state) => {
			console.log('postStore - Updating post:', postId, 'with updates:', updates);
			console.log('postStore - Current posts before update:', state.posts.length);

			const updatedPosts = state.posts.map((post) => {
				if (post.id === postId) {
					const updatedPost = {
						...post,
						...updates,
					};
					console.log('postStore - Updated post:', updatedPost);
					return updatedPost;
				}
				return post;
			});

			console.log('postStore - Posts after update:', updatedPosts.length);
			return { posts: updatedPosts };
		}),
}));

export default usePostStore;
