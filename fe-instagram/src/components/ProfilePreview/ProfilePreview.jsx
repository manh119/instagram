import { Box, Avatar, Text, Flex, Button, VStack, HStack, Divider, useColorModeValue } from "@chakra-ui/react";
import useFollowUser from "../../hooks/useFollowUser";

const ProfilePreview = ({ profile, isVisible, position, onMouseEnter, onMouseLeave }) => {
    // Always call hooks with stable values to prevent hooks order issues
    const profileId = profile?.id || 0; // Use 0 as fallback to ensure stable hook calls
    const { handleFollowUser, isFollowing, isUpdating } = useFollowUser(profileId);

    // Color mode values - Completely solid backgrounds
    const bgColor = useColorModeValue('white', 'black');
    const borderColor = useColorModeValue('gray.400', 'gray.600');
    const textColor = useColorModeValue('gray.800', 'white');
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.300');

    // Hover effect colors
    const hoverBorderColor = useColorModeValue('blue.500', 'blue.400');
    const hoverAvatarBorderColor = useColorModeValue('blue.600', 'blue.300');
    const hoverUsernameColor = useColorModeValue('blue.800', 'blue.200');
    const hoverStatsBg = useColorModeValue('blue.200', 'blue.900');

    // Stats background colors
    const statsBgColor = useColorModeValue('gray.200', 'gray.900');

    // Solid background colors with full opacity
    const solidBgColor = useColorModeValue('rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)');
    const borderColorLight = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');

    // Don't render anything if not visible or no profile
    if (!isVisible || !profile) {
        return null;
    }

    return (
        <Box
            position="absolute"
            zIndex={1000}
            top={position.includes('bottom') ? '100%' : 'auto'}
            bottom={position.includes('top') ? '100%' : 'auto'}
            left={position.includes('end') ? 'auto' : '0'}
            right={position.includes('start') ? 'auto' : '0'}
            mt={position.includes('bottom') ? 2 : 0}
            mb={position.includes('top') ? 2 : 0}
            ml={position.includes('end') ? 0 : 'auto'}
            mr={position.includes('start') ? 0 : 'auto'}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseEnter} // Keep preview visible while mouse is moving over it
        >
            {/* Simple solid background like notification toast */}
            <Box
                bg={useColorModeValue('white', 'black')}
                borderRadius="lg"
                boxShadow="lg"
                border={`1px solid ${useColorModeValue('gray.200', 'gray.700')}`}
                p={4}
                minW="280px"
                maxW="320px"
                position="relative"
                zIndex={1}
                sx={{
                    backgroundColor: useColorModeValue('white', 'black') + ' !important'
                }}
                _hover={{
                    boxShadow: 'xl',
                    borderColor: useColorModeValue('gray.300', 'gray.600')
                }}
                transition="all 0.3s ease-in-out"
            >
                {/* Arrow indicator */}
                <Box
                    position="absolute"
                    top={position.includes('top') ? '100%' : '-8px'}
                    left="50%"
                    transform="translateX(-50%)"
                    width="0"
                    height="0"
                    borderLeft="8px solid transparent"
                    borderRight="8px solid transparent"
                    borderTop={position.includes('top') ? '8px solid' : 'none'}
                    borderBottom={position.includes('bottom') ? '8px solid' : 'none'}
                    borderTopColor={position.includes('top') ? bgColor : 'transparent'}
                    borderBottomColor={position.includes('bottom') ? bgColor : 'transparent'}
                />

                {/* Profile header */}
                <Flex gap={3} mb={4}>
                    <Avatar
                        className="profile-avatar"
                        src={profile.profilePicURL}
                        size="lg"
                        name={profile.username}
                        border={`2px solid ${borderColor}`}
                        transition="all 0.3s ease-in-out"
                    />
                    <VStack align="start" spacing={1} flex={1}>
                        <Text
                            className="profile-username"
                            fontWeight="bold"
                            fontSize="lg"
                            color={textColor}
                            transition="color 0.3s ease-in-out"
                        >
                            {profile.username}
                        </Text>
                        <Text fontSize="sm" color={secondaryTextColor} noOfLines={2}>
                            {profile.fullName}
                        </Text>
                        {profile.bio && (
                            <Text fontSize="xs" color={secondaryTextColor} noOfLines={2}>
                                {profile.bio}
                            </Text>
                        )}
                    </VStack>
                </Flex>

                {/* Stats */}
                <HStack
                    justify="space-around"
                    mb={4}
                    p={3}
                    bg={useColorModeValue('gray.50', 'gray.800')}
                    borderRadius="md"
                    transition="all 0.2s ease-in-out"
                >
                    <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {profile.postsCount || 0}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>posts</Text>
                    </VStack>
                    <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {profile.followersCount || 0}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>followers</Text>
                    </VStack>
                    <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {profile.followingCount || 0}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>following</Text>
                    </VStack>
                </HStack>

                <Divider mb={4} />

                {/* Actions */}
                <VStack spacing={3}>

                    <Button
                        size="md"
                        colorScheme={isFollowing ? "gray" : "blue"}
                        variant={isFollowing ? "outline" : "solid"}
                        w="full"
                        onClick={handleFollowUser}
                        isLoading={isUpdating}
                        _hover={{
                            bg: isFollowing ? 'gray.100' : 'blue.600',
                            transform: 'scale(1.02)'
                        }}
                        _active={{ transform: 'scale(0.98)' }}
                        transition="all 0.2s"
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                </VStack>
            </Box>
        </Box>
    );
};

export default ProfilePreview;
