import { create } from "zustand";
import { shallow } from "zustand/shallow";

const useUserProfileStore = create((set, get) => ({
	userProfile: null,
	setUserProfile: (userProfile) => {
		// Only update if the profile actually changed
		const currentProfile = get().userProfile;
		if (currentProfile !== userProfile) {
			set({ userProfile });
		}
	},
	// this is used to update the number of posts in the profile page
	addPost: (post) =>
		set((state) => ({
			userProfile: { ...state.userProfile, posts: [post.id, ...state.userProfile.posts] },
		})),
	deletePost: (postId) =>
		set((state) => ({
			userProfile: {
				...state.userProfile,
				posts: state.userProfile.posts.filter((id) => id !== postId),
			},
		})),
}));

// Export a hook that uses shallow comparison to prevent unnecessary re-renders
export const useUserProfileStoreShallow = (selector) =>
	useUserProfileStore(selector, shallow);

export default useUserProfileStore;
