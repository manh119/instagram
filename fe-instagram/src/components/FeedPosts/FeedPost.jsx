import { Box, Image, Text, VStack } from "@chakra-ui/react";
import PostFooter from "./PostFooter";
import PostHeader from "./PostHeader";
import useGetUserProfileById from "../../hooks/useGetUserProfileById";
import useVideoAutoPlay from "../../hooks/useVideoAutoPlay";
import videoConfig from "../../config/videoConfig";
import ResponsiveVideoContainer from "../Common/ResponsiveVideoContainer";
import { useState, useEffect } from "react";
import usePostStore from "../../store/postStore";
import { useNavigate } from "react-router-dom";

const FeedPost = ({ post, isDetailPage = false }) => {
	const [videoError, setVideoError] = useState(false);
	const [videoLoading, setVideoLoading] = useState(true);
	const navigate = useNavigate();

	// Get the latest post data from the store to ensure we have the most up-to-date likes/comments
	const { posts } = usePostStore();
	const currentPost = posts.find(p => p.id === post.id) || post;

	// Debug logging to see what's happening with the post data
	useEffect(() => {
		console.log('FeedPost - Post ID:', post.id);
		console.log('FeedPost - Original post:', post);
		console.log('FeedPost - Current post from store:', currentPost);
		console.log('FeedPost - Store posts count:', posts.length);
		console.log('FeedPost - Current post userLikes:', currentPost?.userLikes?.length || 0);
		console.log('FeedPost - Current post comments:', currentPost?.comments?.length || 0);
	}, [post.id, post, currentPost, posts]);

	// Check if post.createdBy has the necessary profile data for hover functionality
	// We need at least username and profileImageUrl for the hover preview to work properly
	const hasCompleteProfile = currentPost.createdBy &&
		currentPost.createdBy.username &&
		currentPost.createdBy.profileImageUrl &&
		currentPost.createdBy.id;

	// If we have a complete profile object, use it; otherwise fetch by ID
	const creatorProfile = hasCompleteProfile ? currentPost.createdBy : null;
	const profileId = currentPost.createdBy?.id;

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
	} = useVideoAutoPlay(currentPost.videoUrl, {
		visibilityThreshold: videoConfig.autoPlay.visibilityThreshold,
		pauseThreshold: videoConfig.autoPlay.pauseThreshold,
		rootMargin: videoConfig.autoPlay.rootMargin,
		enableAutoPlay: videoConfig.autoPlay.enabled
	});

	const handleVideoError = (e) => {
		setVideoError(true);
		setVideoLoading(false);
		if (videoConfig.debug.consoleLogs) {
			console.error('Video failed to load:', currentPost.videoUrl, e);
		}
	};

	const renderMedia = () => {
		if (currentPost.videoUrl) {
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
							src={currentPost.videoUrl}
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
		} else if (currentPost.imageUrl) {
			return (
				<Image src={currentPost.imageUrl} alt={"FEED POST IMG"} />
			);
		}
		return null;
	};

	// Handle post click to navigate to detail page
	const handlePostClick = () => {
		if (!isDetailPage) {
			navigate(`/posts/${currentPost.id}`);
		}
	};

	return (
		<div ref={containerRef}>
			<PostHeader post={currentPost} creatorProfile={finalCreatorProfile} />
			<Box
				my={2}
				borderRadius={4}
				overflow={"hidden"}
				cursor={isDetailPage ? "default" : "pointer"}
				onClick={handlePostClick}
				_hover={!isDetailPage ? { opacity: 0.9 } : {}}
				transition="opacity 0.2s"
			>
				{renderMedia()}
			</Box>
			<PostFooter post={currentPost} creatorProfile={finalCreatorProfile} />
		</div>
	);
};

export default FeedPost;
