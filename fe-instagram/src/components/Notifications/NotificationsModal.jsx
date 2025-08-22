import { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    HStack,
    Button,
    Text,
    Box,
    Flex,
    useColorModeValue,
    Divider,
    Skeleton,
    SkeletonText,
    Center,
    useDisclosure,
    Badge
} from '@chakra-ui/react';
import { DeleteIcon, CheckIcon } from '@chakra-ui/icons';
import { NotificationsLogo } from '../../assets/constants';
import NotificationItem from './NotificationItem';
import useNotifications from '../../hooks/useNotifications';
import ConfirmDialog from '../Common/ConfirmDialog';

const NotificationsModal = ({ isOpen, onClose }) => {
    const [deletingId, setDeletingId] = useState(null);
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const [confirmAction, setConfirmAction] = useState(null);

    const {
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        isWebSocketConnected,
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        refreshNotifications
    } = useNotifications();



    // Refresh notifications when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log('=== Modal opened, refreshing notifications ===');
            refreshNotifications();
        }
    }, [isOpen, refreshNotifications]);

    // Refresh notifications when WebSocket connects (if modal is open)
    useEffect(() => {
        if (isOpen && isWebSocketConnected) {
            console.log('=== WebSocket connected, refreshing notifications ===');
            refreshNotifications();
        }
    }, [isOpen, isWebSocketConnected, refreshNotifications]);

    // Color scheme
    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const headerBg = useColorModeValue('gray.50', 'gray.700');

    // Handle mark as read
    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
    };

    // Handle delete notification
    const handleDeleteNotification = async (notificationId) => {
        setDeletingId(notificationId);
        try {
            await deleteNotification(notificationId);
        } finally {
            setDeletingId(null);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = () => {
        setConfirmAction({
            title: "Mark All as Read",
            message: "Are you sure you want to mark all notifications as read?",
            action: markAllAsRead
        });
        onConfirmOpen();
    };

    // Handle delete all read
    const handleDeleteAllRead = () => {
        setConfirmAction({
            title: "Delete All Read",
            message: "Are you sure you want to delete all read notifications? This action cannot be undone.",
            action: deleteAllRead
        });
        onConfirmOpen();
    };



    // Loading skeleton component
    const LoadingSkeleton = () => (
        <VStack spacing={3} align="stretch">
            {[...Array(3)].map((_, i) => (
                <Box key={i} p={4} bg={bgColor} border="1px solid" borderColor={borderColor} borderRadius="lg">
                    <Flex gap={3} align="start">
                        <Skeleton w={8} h={8} borderRadius="full" />
                        <VStack align="start" flex={1} spacing={2}>
                            <Skeleton h={4} w="60%" />
                            <SkeletonText noOfLines={2} spacing={2} />
                            <Skeleton h={3} w="40%" />
                        </VStack>
                    </Flex>
                </Box>
            ))}
        </VStack>
    );

    // Empty state component
    const EmptyState = () => (
        <Center py={8}>
            <VStack spacing={4}>
                <Box fontSize="4xl">🔔</Box>
                <Text fontSize="lg" fontWeight="medium" color="gray.500">
                    No notifications yet
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                    When you get notifications, they&apos;ll appear here
                </Text>
            </VStack>
        </Center>
    );

    // WebSocket connection status
    const ConnectionStatus = () => (
        isWebSocketConnected
    );

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
                        <Flex align="center" justify="space-between">
                            <Flex align="center" gap={3}>
                                <NotificationsLogo />
                                <Text>Notifications</Text>
                                {unreadCount > 0 && (
                                    <Badge
                                        key={`unread-${unreadCount}`}
                                        colorScheme="red"
                                        variant="solid"
                                        borderRadius="full"
                                    >
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Badge>
                                )}
                            </Flex>
                            <HStack spacing={2}>

                                <ModalCloseButton position="static" />
                            </HStack>
                        </Flex>
                    </ModalHeader>

                    <ModalBody p={0}>
                        {/* Connection status */}
                        <Box p={4} pb={2}>
                            <ConnectionStatus />
                        </Box>

                        {/* Action buttons */}
                        <Box px={4} pb={4}>
                            <HStack spacing={2} justify="space-between">
                                <HStack spacing={2}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="blue"
                                        onClick={handleMarkAllAsRead}
                                        isDisabled={notifications.length === 0 || unreadCount === 0}
                                    >
                                        <CheckIcon mr={1} />
                                        Mark All Read
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="red"
                                        onClick={handleDeleteAllRead}
                                        isDisabled={notifications.filter(n => n.isRead).length === 0}
                                    >
                                        <DeleteIcon mr={1} />
                                        Delete Read
                                    </Button>
                                </HStack>
                            </HStack>
                        </Box>

                        <Divider />

                        {/* Notifications list */}
                        <Box p={4} position="relative">
                            {/* Show loading indicator when refreshing */}
                            {isLoading && notifications.length > 0 && (
                                <Box
                                    position="absolute"
                                    top="2"
                                    right="2"
                                    zIndex={2}
                                    bg="blue.500"
                                    color="white"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="sm"
                                >
                                    Refreshing...
                                </Box>
                            )}

                            {isLoading && notifications.length === 0 ? (
                                <LoadingSkeleton />
                            ) : notifications.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <VStack spacing={3} align="stretch">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={handleMarkAsRead}
                                            onDelete={handleDeleteNotification}
                                            isDeleting={deletingId === notification.id}
                                        />
                                    ))}

                                    {/* Load more button */}
                                    {hasMore && (
                                        <Center pt={4}>
                                            <Button
                                                onClick={loadMore}
                                                isLoading={isLoading}
                                                variant="outline"
                                                colorScheme="blue"
                                            >
                                                Load More
                                            </Button>
                                        </Center>
                                    )}
                                </VStack>
                            )}
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Confirmation dialog */}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={onConfirmClose}
                title={confirmAction?.title || ""}
                message={confirmAction?.message || ""}
                onConfirm={() => {
                    if (confirmAction?.action) {
                        confirmAction.action();
                    }
                    onConfirmClose();
                }}
            />
        </>
    );
};

export default NotificationsModal;
