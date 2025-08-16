import { Box, Avatar, Text, Flex, Button, VStack, HStack, Divider, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useFollowUser from "../../hooks/useFollowUser";

const ProfilePreview = ({ profile, isVisible, position, onMouseEnter, onMouseLeave }) => {
    const { handleFollowUser, isFollowing, isUpdating } = useFollowUser(profile?.id);

    // Color mode values
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const textColor = useColorModeValue('gray.800', 'white');
    const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

    if (!isVisible || !profile) return null;

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
        >
            <Box
                bg={bgColor}
                borderRadius="lg"
                boxShadow="xl"
                border={`1px solid ${borderColor}`}
                p={4}
                minW="280px"
                maxW="320px"
                position="relative"
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
                        src={profile.profilePicURL}
                        size="lg"
                        name={profile.username}
                        border={`2px solid ${borderColor}`}
                    />
                    <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
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
                <HStack justify="space-around" mb={4} p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                    <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {profile.postsCount || profile.posts?.length || 0}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>posts</Text>
                    </VStack>
                    <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {profile.followersCount || profile.followers?.length || 0}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>followers</Text>
                    </VStack>
                    <VStack spacing={0}>
                        <Text fontWeight="bold" fontSize="lg" color={textColor}>
                            {profile.followingCount || profile.following?.length || 0}
                        </Text>
                        <Text fontSize="xs" color={secondaryTextColor}>following</Text>
                    </VStack>
                </HStack>

                <Divider mb={4} />

                {/* Actions */}
                <VStack spacing={2}>
                    <Link to={`/profiles/${profile.id}`} style={{ width: '100%' }}>
                        <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            w="full"
                            _hover={{ bg: 'blue.50' }}
                        >
                            View Profile
                        </Button>
                    </Link>

                    <Button
                        size="sm"
                        colorScheme={isFollowing ? "gray" : "blue"}
                        variant={isFollowing ? "outline" : "solid"}
                        w="full"
                        onClick={handleFollowUser}
                        isLoading={isUpdating}
                        _hover={{
                            bg: isFollowing ? 'gray.100' : 'blue.600'
                        }}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                </VStack>
            </Box>
        </Box>
    );
};

export default ProfilePreview;
