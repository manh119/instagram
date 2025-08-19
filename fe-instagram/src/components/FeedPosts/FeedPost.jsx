import { Box, Image, Text, VStack } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useVideoAutoPlay from "../../hooks/useVideoAutoPlay";
import videoConfig from "../../config/videoConfig";
import ResponsiveVideoContainer from "../Common/ResponsiveVideoContainer";
import { useState } from "react";

const FeedPost = ({ post }) => {
	const [videoError, setVideoError] = useState(false);
	const [videoLoading, setVideoLoading] = useState(true);

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
	const { userProfile: fetchedProfile } = useGetUserProfileById(profileId);

	// Use the complete profile from post if available, otherwise use the fetched one
	const finalCreatorProfile = creatorProfile || fetchedProfile;

	// Use the custom video auto-play hook with configuration
	const {
		videoRef,
		containerRef,
		handleVideoLoad,
		handleVideoPlay,
		handleVideoPause,
		handleVideoEnded
	} = useVideoAutoPlay(post.videoUrl, {
		visibilityThreshold: videoConfig.autoPlay.visibilityThreshold,
		pauseThreshold: videoConfig.autoPlay.pauseThreshold,
		rootMargin: videoConfig.autoPlay.rootMargin,
		enableAutoPlay: videoConfig.autoPlay.enabled
	});

	const handleVideoError = (e) => {
		setVideoError(true);
		setVideoLoading(false);
		if (videoConfig.debug.consoleLogs) {
			console.error('Video failed to load:', post.videoUrl, e);
		}
	};

	const renderMedia = () => {
		if (post.videoUrl) {
			return (
				<VStack spacing={2} w="100%">
					{videoLoading && (
						<Text fontSize="sm" color="gray.500">
							Loading video...
						</Text>
					)}
					{videoError && (
						<Text fontSize="sm" color="red.500">
							Failed to load video
						</Text>
					)}
					<ResponsiveVideoContainer variant="feed">
						<video
							ref={videoRef}
							src={post.videoUrl}
							controls={videoConfig.behavior.controls}
							muted={videoConfig.behavior.muted}
							loop={videoConfig.behavior.loop}
							playsInline={videoConfig.behavior.playsInline}
							preload={videoConfig.autoPlay.preload}
							onLoadStart={() => setVideoLoading(true)}
							onLoadedData={handleVideoLoad}
							onError={handleVideoError}
							onPlay={handleVideoPlay}
							onPause={handleVideoPause}
							onEnded={handleVideoEnded}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: videoError ? 'none' : 'block'
							}}
						/>
					</ResponsiveVideoContainer>
				</VStack>
			);
		} else if (post.imageUrl) {
			return (
				<Image src={post.imageUrl} alt={"FEED POST IMG"} />
			);
		}
		return null;
	};

	return (
		<div ref={containerRef}>
			<PostHeader post={post} creatorProfile={finalCreatorProfile} />
			<Box my={2} borderRadius={4} overflow={"hidden"}>
				{renderMedia()}
			</Box>
			<PostFooter post={post} creatorProfile={finalCreatorProfile} />
		</div>
	);
};

export default FeedPost;
