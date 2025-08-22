import { Box, Flex, Tooltip, useDisclosure } from "@chakra-ui/react";
import { useEffect } from "react";
import { NotificationsLogo } from "../../assets/constants";
import NotificationsModal from "../Notifications/NotificationsModal";
import useNotifications from "../../hooks/useNotifications";

const Notifications = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { unreadCount, isWebSocketConnected } = useNotifications();

	// Debug WebSocket and unread count
	console.log('=== Sidebar Notifications Component ===');
	console.log('Unread count:', unreadCount);
	console.log('WebSocket connected:', isWebSocketConnected);
	console.log('Red dot should show:', unreadCount > 0);

	// Track unread count changes for debugging
	useEffect(() => {
		console.log('=== Sidebar Unread Count Changed ===');
		console.log('New unread count:', unreadCount);
		console.log('Red dot visibility:', unreadCount > 0 ? 'SHOW' : 'HIDE');
	}, [unreadCount]);

	return (
		<>
			<Tooltip
				hasArrow
				label={"Notifications"}
				placement='right'
				ml={1}
				openDelay={500}
				display={{ base: "block", md: "none" }}
			>
				<Flex
					alignItems={"center"}
					gap={4}
					_hover={{ bg: "whiteAlpha.400" }}
					borderRadius={6}
					p={2}
					w={{ base: 10, md: "full" }}
					justifyContent={{ base: "center", md: "flex-start" }}
					cursor="pointer"
					onClick={onOpen}
					position="relative"
				>
					<Box position="relative">
						<NotificationsLogo />
						{/* Instagram-style red dot indicator at top-right curve of heart */}
						{unreadCount > 0 && (
							<Box
								position="absolute"
								top={-1}
								right={-1}
								w={2.5}
								h={2.5}
								bg="red.500"
								borderRadius="full"
								zIndex={1}
								sx={{
									'@keyframes pulse': {
										'0%': { opacity: 0.8 },
										'50%': { opacity: 1 },
										'100%': { opacity: 0.8 }
									}
								}}
								animation="pulse 2s ease-in-out infinite"
								_after={{
									content: '""',
									position: 'absolute',
									top: '-2px',
									right: '-2px',
									w: '6px',
									h: '6px',
									bg: 'red.500',
									borderRadius: 'full',
									opacity: 0.3,
									animation: 'pulse 2s infinite'
								}}
							/>
						)}
					</Box>
					<Box display={{ base: "none", md: "block" }}>Notifications</Box>
				</Flex>
			</Tooltip>

			<NotificationsModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default Notifications;
