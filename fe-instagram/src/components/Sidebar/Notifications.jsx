import { Box, Flex, Tooltip, useDisclosure } from "@chakra-ui/react";
import { NotificationsLogo } from "../../assets/constants";
import NotificationsModal from "../Notifications/NotificationsModal";
import useNotifications from "../../hooks/useNotifications";

const Notifications = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const { unreadCount } = useNotifications();

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
					<NotificationsLogo />
					<Box display={{ base: "none", md: "block" }}>Notifications</Box>

					{/* Unread count badge */}
					{unreadCount > 0 && (
						<Box
							position="absolute"
							top={1}
							right={1}
							bg="red.500"
							color="white"
							borderRadius="full"
							px={1.5}
							py={0.5}
							fontSize="xs"
							fontWeight="bold"
							minW="18px"
							textAlign="center"
						>
							{unreadCount > 99 ? '99+' : unreadCount}
						</Box>
					)}
				</Flex>
			</Tooltip>

			<NotificationsModal isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default Notifications;
