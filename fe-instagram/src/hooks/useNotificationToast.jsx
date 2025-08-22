import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import NotificationToast from '../components/Notifications/NotificationToast';

const useNotificationToast = () => {
    const toast = useToast();

    // Show enhanced notification toast
    const showNotificationToast = useCallback((notification) => {
        // Create a custom toast with the notification component
        toast({
            duration: 5000, // 5 seconds
            isClosable: true,
            render: ({ onClose }) => (
                <NotificationToast
                    notification={notification}
                    onClose={onClose}
                />
            ),
        });
    }, [toast]);

    // Show regular toast (fallback)
    const showToast = useCallback((title, description, status) => {
        toast({
            title: title,
            description: description,
            status: status,
            duration: 3000,
            isClosable: true,
        });
    }, [toast]);

    return {
        showNotificationToast,
        showToast
    };
};

export default useNotificationToast;
