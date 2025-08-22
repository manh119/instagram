
import {
    Box,
    Flex,
    Text,
    Avatar,
    Icon,
    VStack
} from '@chakra-ui/react';
import { useCallback } from 'react';
import {
    FaHeart,
    FaComment,
    FaUserPlus,
    FaBell,
    FaReply
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotificationToast = ({ notification, onClose }) => {
    const navigate = useNavigate();

    // Debug: Log the notification structure
    console.log('🔍 NotificationToast - Full notification object:', notification);
    console.log('🔍 NotificationToast - notification.fromUser:', notification.fromUser);
    console.log('🔍 NotificationToast - notification.createdBy:', notification.createdBy);
    console.log('🔍 NotificationToast - notification.user:', notification.user);

    // Get notification icon and color based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'LIKE':
                return { icon: FaHeart, color: 'red.500' };
            case 'COMMENT':
                return { icon: FaComment, color: 'blue.500' };
            case 'FOLLOW':
                return { icon: FaUserPlus, color: 'green.500' };
            case 'REPLY':
                return { icon: FaReply, color: 'purple.500' };
            default:
                return { icon: FaBell, color: 'gray.500' };
        }
    };

    // Get notification color scheme
    const getNotificationColorScheme = (type) => {
        switch (type) {
            case 'LIKE':
                return 'red';
            case 'COMMENT':
                return 'blue';
            case 'FOLLOW':
                return 'green';
            case 'REPLY':
                return 'purple';
            default:
                return 'gray';
        }
    };

    // Handle toast click to navigate to post
    const handleToastClick = useCallback(() => {
        if (notification.relatedPostId) {
            // Navigate to the specific post detail (using correct route)
            navigate(`/posts/${notification.relatedPostId}`);
        } else if (notification.senderUsername) {
            // Navigate to user profile
            navigate(`/profiles/${notification.senderUsername}`);
        }

        // Close the toast
        if (onClose) onClose();
    }, [notification, navigate, onClose]);

    const { icon: IconComponent, color: iconColor } = getNotificationIcon(notification.type);
    const colorScheme = getNotificationColorScheme(notification.type);

    return (
        <Box
            onClick={handleToastClick}
            cursor="pointer"
            _hover={{
                transform: 'scale(1.02)',
                boxShadow: 'xl',
                borderColor: `${colorScheme}.400`,
                bg: `${colorScheme}.100`,
                "& .notification-message": {
                    color: `${colorScheme}.800`
                },
                "& .notification-time": {
                    color: `${colorScheme}.700`
                },
                "& .notification-icon": {
                    transform: 'scale(1.1)',
                    bg: `${colorScheme}.200`
                }
            }}
            transition="all 0.2s ease-in-out"
            bg={`${colorScheme}.50`}
            border={`1px solid ${colorScheme}.200`}
            borderRadius="lg"
            p={4}
            maxW="400px"
            boxShadow="lg"
        >
            <Flex align="center" gap={3}>
                {/* User Avatar */}
                <Avatar
                    size="sm"
                    src={
                        notification.senderProfileImageUrl ||
                        notification.fromUser?.profileImageUrl ||
                        notification.fromUser?.picture ||
                        notification.createdBy?.profileImageUrl ||
                        notification.createdBy?.picture ||
                        notification.user?.picture
                    }
                    name={
                        notification.senderUsername ||
                        notification.fromUser?.displayName ||
                        notification.fromUser?.username ||
                        notification.fromUser?.name ||
                        notification.createdBy?.displayName ||
                        notification.createdBy?.username ||
                        notification.user?.name ||
                        'Unknown User'
                    }
                    bg={`${colorScheme}.100`}
                    _hover={{
                        transform: 'scale(1.1)',
                        boxShadow: 'md',
                        border: `2px solid ${colorScheme}.300`
                    }}
                    transition="all 0.2s ease-in-out"
                    cursor="pointer"
                />



                {/* Notification Content */}
                <VStack align="start" flex={1} spacing={1}>
                    <Text
                        className="notification-message"
                        fontSize="xs"
                        color={`${colorScheme}.600`}
                        noOfLines={2}
                    >
                        {notification.message}
                    </Text>
                    <Text
                        className="notification-time"
                        fontSize="xs"
                        color={`${colorScheme}.500`}
                    >
                        {new Date(notification.createdAt).toLocaleTimeString()}
                    </Text>
                </VStack>
                {/* Notification Icon */}
                <Box
                    className="notification-icon"
                    p={1}
                    borderRadius="full"
                    bg={`${colorScheme}.100`}
                    color={iconColor}
                    transition="all 0.2s ease-in-out"
                >
                    <Icon as={IconComponent} boxSize={4} />
                </Box>
            </Flex>
        </Box>
    );
};

export default NotificationToast;
