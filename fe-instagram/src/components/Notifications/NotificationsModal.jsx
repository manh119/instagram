import React, { useState } from 'react';
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
    IconButton,
    Tooltip,
    useDisclosure
} from '@chakra-ui/react';
import { DeleteIcon, CheckIcon, RepeatIcon } from '@chakra-ui/icons';
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
        loadMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        refreshNotifications
    } = useNotifications();

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
            title: 'Mark All as Read',
            message: 'Are you sure you want to mark all notifications as read?',
            onConfirm: markAllAsRead,
            confirmText: 'Mark All Read',
            confirmColor: 'blue'
        });
        onConfirmOpen();
    };

    // Handle delete all read
    const handleDeleteAllRead = () => {
        setConfirmAction({
            title: 'Delete Read Notifications',
            message: 'Are you sure you want to delete all read notifications? This action cannot be undone.',
            onConfirm: deleteAllRead,
            confirmText: 'Delete All Read',
            confirmColor: 'red'
        });
        onConfirmOpen();
    };

    // Handle confirm action
    const handleConfirmAction = async () => {
        if (confirmAction?.onConfirm) {
            await confirmAction.onConfirm();
        }
        onConfirmClose();
        setConfirmAction(null);
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <VStack spacing={4} align="stretch">
            {[1, 2, 3].map((i) => (
                <Box key={i} p={4} border="1px solid" borderColor={borderColor} borderRadius="lg">
                    <Flex gap={3}>
                        <Skeleton w={8} h={8} borderRadius="full" />
                        <VStack flex={1} align="start" spacing={2}>
                            <SkeletonText noOfLines={2} spacing={2} />
                            <Skeleton h={3} w="100px" />
                        </VStack>
                    </Flex>
                </Box>
            ))}
        </VStack>
    );

    // Empty state
    const EmptyState = () => (
        <Center py={10}>
            <VStack spacing={4}>
                <NotificationsLogo />
                <Text fontSize="lg" fontWeight="semibold" color="gray.500">
                    No notifications yet
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                    When you get notifications, they'll show up here
                </Text>
            </VStack>
        </Center>
    );

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(10px)" />
                <ModalContent bg={bgColor} border="1px solid" borderColor={borderColor}>
                    <ModalHeader bg={headerBg} borderBottom="1px solid" borderColor={borderColor}>
                        <Flex align="center" justify="space-between">
                            <HStack spacing={3}>
                                <NotificationsLogo />
                                <Text>Notifications</Text>
                                {unreadCount > 0 && (
                                    <Box
                                        bg="blue.500"
                                        color="white"
                                        borderRadius="full"
                                        px={2}
                                        py={1}
                                        fontSize="xs"
                                        fontWeight="bold"
                                    >
                                        {unreadCount}
                                    </Box>
                                )}
                            </HStack>

                            <HStack spacing={2}>
                                <Tooltip label="Refresh">
                                    <IconButton
                                        icon={<RepeatIcon />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={refreshNotifications}
                                        isLoading={isLoading}
                                        aria-label="Refresh notifications"
                                    />
                                </Tooltip>
                            </HStack>
                        </Flex>
                    </ModalHeader>

                    <ModalCloseButton />

                    <ModalBody p={0}>
                        {/* Action buttons */}
                        {notifications.length > 0 && (
                            <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                                <HStack spacing={3} justify="space-between">
                                    <HStack spacing={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorScheme="blue"
                                            onClick={handleMarkAllAsRead}
                                            isDisabled={unreadCount === 0}
                                        >
                                            <CheckIcon mr={2} />
                                            Mark All Read
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorScheme="red"
                                            onClick={handleDeleteAllRead}
                                            isDisabled={notifications.every(n => !n.isRead)}
                                        >
                                            <DeleteIcon mr={2} />
                                            Clear Read
                                        </Button>
                                    </HStack>

                                    <Text fontSize="sm" color="gray.500">
                                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                                    </Text>
                                </HStack>
                            </Box>
                        )}

                        {/* Notifications list */}
                        <Box p={4}>
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
                onConfirm={handleConfirmAction}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
                confirmText={confirmAction?.confirmText || 'Confirm'}
                confirmColor={confirmAction?.confirmColor || 'blue'}
            />
        </>
    );
};

export default NotificationsModal;
