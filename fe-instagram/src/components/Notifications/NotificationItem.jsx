import React from 'react';
import {
    Box,
    Flex,
    Avatar,
    Text,
    Badge,
    IconButton,
    Tooltip,
    useColorModeValue,
    HStack,
    VStack,
    Divider
} from '@chakra-ui/react';
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { timeAgo } from '../../utils/timeAgo';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({
    notification,
    onMarkAsRead,
    onDelete,
    isDeleting
}) => {
    const navigate = useNavigate();

    // Color scheme for better UX
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');
    const unreadBg = useColorModeValue('blue.50', 'blue.900');
    const unreadBorder = useColorModeValue('blue.200', 'blue.700');

    // Get notification icon and color based on type
    const getNotificationIcon = () => {
        switch (notification.type) {
            case 'FOLLOW':
                return { icon: '👥', color: 'blue' };
            case 'UNFOLLOW':
                return { icon: '👋', color: 'gray' };
            case 'LIKE':
                return { icon: '❤️', color: 'red' };
            case 'COMMENT':
                return { icon: '💬', color: 'green' };
            case 'LIKE_COMMENT':
                return { icon: '👍', color: 'orange' };
            case 'MENTION':
                return { icon: '📝', color: 'purple' };
            case 'NEW_POST':
                return { icon: '📸', color: 'teal' };
            default:
                return { icon: '🔔', color: 'gray' };
        }
    };

    // Handle notification click
    const handleNotificationClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }

        // Navigate based on notification type
        if (notification.relatedPostId) {
            // For now, just navigate to home since we don't have individual post pages
            navigate('/');
        } else if (notification.senderId) {
            // Navigate to user profile
            navigate(`/profiles/${notification.senderId}`);
        }
    };

    // Handle delete
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification.id);
    };

    // Handle mark as read
    const handleMarkAsRead = (e) => {
        e.stopPropagation();
        onMarkAsRead(notification.id);
    };

    const { icon, color } = getNotificationIcon();
    const isUnread = !notification.isRead;

    return (
        <Box
            p={4}
            bg={isUnread ? unreadBg : bgColor}
            border="1px solid"
            borderColor={isUnread ? unreadBorder : borderColor}
            borderRadius="lg"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
                bg: hoverBg,
                transform: 'translateY(-1px)',
                boxShadow: 'md'
            }}
            onClick={handleNotificationClick}
            position="relative"
        >
            {/* Unread indicator */}
            {isUnread && (
                <Box
                    position="absolute"
                    top={3}
                    right={3}
                    w={2}
                    h={2}
                    bg="blue.500"
                    borderRadius="full"
                />
            )}

            <Flex gap={3} align="start">
                {/* Notification icon */}
                <Box fontSize="2xl" flexShrink={0}>
                    {icon}
                </Box>

                {/* Notification content */}
                <VStack align="start" flex={1} spacing={1}>
                    <Flex align="center" gap={2} w="full">
                        <Avatar
                            size="sm"
                            src={notification.senderProfileImageUrl}
                            name={notification.senderUsername}
                        />
                        <Text fontWeight="semibold" fontSize="sm">
                            {notification.senderUsername}
                        </Text>
                        <Badge colorScheme={color} variant="subtle" size="sm">
                            {notification.type.replace('_', ' ')}
                        </Badge>
                    </Flex>

                    <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                        {notification.message}
                    </Text>

                    <Text fontSize="xs" color="gray.500">
                        {timeAgo(new Date(notification.createdAt))}
                    </Text>
                </VStack>

                {/* Action buttons */}
                <HStack spacing={1} flexShrink={0}>
                    {isUnread && (
                        <Tooltip label="Mark as read">
                            <IconButton
                                icon={<CheckIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={handleMarkAsRead}
                                aria-label="Mark as read"
                            />
                        </Tooltip>
                    )}

                    <Tooltip label="Delete notification">
                        <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={handleDelete}
                            isLoading={isDeleting}
                            aria-label="Delete notification"
                        />
                    </Tooltip>
                </HStack>
            </Flex>
        </Box>
    );
};

export default NotificationItem;
