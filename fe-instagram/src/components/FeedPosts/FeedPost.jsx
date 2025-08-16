import { Box, Image } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";

const FeedPost = ({ post }) => {
	// Check if post.createdBy has the necessary profile data for hover functionality
	// We need at least username and profileImageUrl for the hover preview to work properly
	const hasCompleteProfile = post.createdBy &&
		post.createdBy.username &&
		post.createdBy.profileImageUrl &&
		post.createdBy.id;

	// If we have a complete profile object, use it; otherwise fetch by ID
	const creatorProfile = hasCompleteProfile ? post.createdBy : null;
	const profileId = post.createdBy?.id;

	// Always fetch profile data if we don't have complete data
	const { userProfile: fetchedProfile, isLoading } = useGetUserProfileById(profileId);

	// Use the complete profile from post if available, otherwise use the fetched one
	const finalCreatorProfile = creatorProfile || fetchedProfile;

	return (
		<>
			<PostHeader post={post} creatorProfile={finalCreatorProfile} />
			<Box my={2} borderRadius={4} overflow={"hidden"}>
				<Image src={post.imageUrl} alt={"FEED POST IMG"} />
			</Box>
			<PostFooter post={post} creatorProfile={finalCreatorProfile} />
		</>
	);
};

export default FeedPost;
