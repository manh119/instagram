import { Container, Flex, Link, Skeleton, SkeletonCircle, Text, VStack, Grid, Box } from "@chakra-ui/react";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileTabs from "../../components/Profile/ProfileTabs";
import ProfilePosts from "../../components/Profile/ProfilePosts";
import { useUserProfileStoreShallow } from "../../store/userProfileStore";
import { useParams, useLocation } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import userProfileService from "../../services/userProfileService";

const ProfilePage = ({ isCurrentUser = false }) => {
	const { id } = useParams();
	const { user: authUser } = useAuth();
	const setUserProfile = useUserProfileStoreShallow((state) => state.setUserProfile);
	const setUserProfileRef = useRef(setUserProfile);
	const [isLoading, setIsLoading] = useState(true);
	const [userProfile, setLocalUserProfile] = useState(null);
	const location = useLocation();

	// Update ref when setUserProfile changes
	useEffect(() => {
		setUserProfileRef.current = setUserProfile;
	}, [setUserProfile]);

	// Debug logging
	console.log('ProfilePage - Debug Info:', {
		id,
		isCurrentUser,
		location: location.pathname,
		authUser,
		hasId: !!id,
		hasUserProfile: !!userProfile
	});

	// Fetch profile data - use useCallback to prevent recreation on every render
	const fetchProfile = useCallback(async () => {
		setIsLoading(true);
		try {
			let profile;

			if (isCurrentUser) {
				// Use /profiles/me endpoint for current user
				console.log('ProfilePage - Fetching current user profile');
				profile = await userProfileService.getCurrentUserProfile();
			} else if (id) {
				// Use /profiles/{id} endpoint for specific user
				console.log('ProfilePage - Fetching profile by ID:', id);
				profile = await userProfileService.getUserProfileById(id);
			} else {
				console.error('ProfilePage - No ID or current user flag provided');
				return;
			}

			console.log('ProfilePage - Profile fetched:', profile);
			setLocalUserProfile(profile);
			// Store update moved outside useCallback to prevent infinite loops
		} catch (error) {
			console.error('ProfilePage - Error fetching profile:', error);
		} finally {
			setIsLoading(false);
		}
	}, [id, isCurrentUser]); // Using ref for setUserProfile to prevent infinite loops

	// Fetch profile data when dependencies change
	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	// Update store after profile is fetched (separate from fetch logic)
	useEffect(() => {
		if (userProfile && setUserProfileRef.current) {
			console.log('ProfilePage - Updating store with profile:', userProfile);
			// Temporarily disabled to test if this causes infinite loop
			// setUserProfileRef.current(userProfile);
		}
	}, [userProfile]); // Only depend on userProfile, not the function

	const userNotFound = !isLoading && !userProfile;
	if (userNotFound) {
		console.log('ProfilePage - User not found, showing UserNotFound component');
		return <UserNotFound />;
	}

	return (
		<Container maxW='container.lg' py={5}>
			<Flex py={10} px={4} pl={{ base: 4, md: 10 }} w={"full"} mx={"auto"} flexDirection={"column"}>
				{!isLoading && userProfile && <ProfileHeader profile={userProfile} />}
				{isLoading && <ProfileHeaderSkeleton />}
			</Flex>
			<Flex
				px={{ base: 2, sm: 4 }}
				maxW={"full"}
				mx={"auto"}
				borderTop={"1px solid"}
				borderColor={"whiteAlpha.300"}
				direction={"column"}
			>
				<ProfileTabs />
				{!isLoading && userProfile && <ProfilePosts profile={userProfile} />}
				{isLoading && <ProfilePostsSkeleton />}
			</Flex>
		</Container>
	);
};

export default ProfilePage;

// skeleton for profile header
const ProfileHeaderSkeleton = () => {
	return (
		<Flex
			gap={{ base: 4, sm: 10 }}
			py={10}
			direction={{ base: "column", sm: "row" }}
			justifyContent={"center"}
			alignItems={"center"}
		>
			<SkeletonCircle size='24' />

			<VStack alignItems={{ base: "center", sm: "flex-start" }} gap={2} mx={"auto"} flex={1}>
				<Skeleton height='12px' width='150px' />
				<Skeleton height='12px' width='100px' />
			</VStack>
		</Flex>
	);
};

// skeleton for profile posts
const ProfilePostsSkeleton = () => {
	return (
		<Grid
			templateColumns={{
				sm: "repeat(1, 1fr)",
				md: "repeat(3, 1fr)",
			}}
			gap={1}
			columnGap={1}
		>
			{[0, 1, 2].map((_, idx) => (
				<VStack key={idx} alignItems={"flex-start"} gap={4}>
					<Skeleton w={"full"}>
						<Box h='300px'>contents wrapped</Box>
					</Skeleton>
				</VStack>
			))}
		</Grid>
	);
};

const UserNotFound = () => {
	return (
		<Flex flexDir='column' textAlign={"center"} mx={"auto"}>
			<Text fontSize={"2xl"}>User Not Found</Text>
			<Link as={RouterLink} to={"/"} color={"blue.500"} w={"max-content"} mx={"auto"}>
				Go home
			</Link>
		</Flex>
	);
};
