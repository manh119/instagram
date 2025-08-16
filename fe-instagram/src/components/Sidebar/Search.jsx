import {
	Box,
	Flex,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Tooltip,
	useDisclosure,
	VStack,
	Text,
	Divider,
	InputGroup,
	InputLeftElement,
	IconButton,
	HStack,
	useColorModeValue,
	Alert,
	AlertIcon,
} from "@chakra-ui/react";
import { SearchLogo } from "../../assets/constants";
import useSearchUser from "../../hooks/useSearchUser";
import { useRef, useState, useEffect } from "react";
import SuggestedUser from "../SuggestedUsers/SuggestedUser";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { useAuth } from "../../contexts/AuthContext";

const Search = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const searchRef = useRef(null);
	const { users, isLoading, query, error, searchUsers, clearSearch, clearCache } = useSearchUser();
	const [searchInput, setSearchInput] = useState("");
	const [debouncedInput, setDebouncedInput] = useState("");
	const { isAuthenticated } = useAuth();

	const bgColor = useColorModeValue("white", "gray.800");
	const borderColor = useColorModeValue("gray.200", "gray.600");
	const inputBg = useColorModeValue("gray.50", "gray.700");

	// Debounce the search input
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedInput(searchInput);
		}, 800);

		return () => clearTimeout(timeoutId);
	}, [searchInput]);

	// Perform search when debounced input changes
	useEffect(() => {
		if (debouncedInput.trim() && isAuthenticated) {
			// Only search if the term is at least 2 characters
			if (debouncedInput.trim().length >= 2) {
				console.log("Searching for:", debouncedInput);
				searchUsers(debouncedInput, 20);
			} else {
				// Clear results for very short searches
				clearSearch();
			}
		} else if (debouncedInput.trim() && !isAuthenticated) {
			// Don't search if not authenticated
		} else {
			clearSearch();
		}
	}, [debouncedInput, isAuthenticated, searchUsers, clearSearch]);

	const handleSearchChange = (e) => {
		const value = e.target.value;
		setSearchInput(value);

		// Clear results immediately if input is cleared
		if (!value.trim()) {
			clearSearch();
		}
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setDebouncedInput("");
		clearSearch();
		searchRef.current?.focus();
	};

	const handleClose = () => {
		onClose();
		setSearchInput("");
		setDebouncedInput("");
		clearSearch();
	};

	// Clear cache when modal opens (fresh start)
	useEffect(() => {
		if (isOpen) {
			clearCache();
		}
	}, [isOpen, clearCache]);

	return (
		<>
			<Tooltip
				hasArrow
				label={"Search"}
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
					onClick={onOpen}
					cursor="pointer"
				>
					<SearchLogo />
					<Box display={{ base: "none", md: "block" }}>Search</Box>
				</Flex>
			</Tooltip>

			<Modal isOpen={isOpen} onClose={handleClose} motionPreset='slideInLeft' size="md">
				<ModalOverlay backdropFilter="blur(10px)" />
				<ModalContent bg={bgColor} border="1px solid" borderColor={borderColor} maxW="500px">
					<ModalHeader borderBottom="1px solid" borderColor={borderColor} pb={4}>
						<Text fontSize="lg" fontWeight="bold">Search Users</Text>
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4} align="stretch">
							{/* Authentication Check */}
							{!isAuthenticated && (
								<Alert status="warning" borderRadius="md">
									<AlertIcon />
									<Box>
										<Text fontWeight="bold">Authentication Required</Text>
										<Text fontSize="sm">Please log in to search for users.</Text>
									</Box>
								</Alert>
							)}

							{/* Search Input */}
							<FormControl>
								<FormLabel fontSize="sm" color="gray.600">
									Search by username or display name (min. 2 characters)
								</FormLabel>
								<InputGroup>
									<InputLeftElement pointerEvents="none">
										<AiOutlineSearch color="gray.400" />
									</InputLeftElement>
									<Input
										ref={searchRef}
										placeholder={isAuthenticated ? "Enter username or name..." : "Please log in to search"}
										value={searchInput}
										onChange={handleSearchChange}
										bg={inputBg}
										border="1px solid"
										borderColor={borderColor}
										_focus={{
											borderColor: "blue.400",
											boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
											bg: bgColor
										}}
										_hover={{
											borderColor: "blue.300"
										}}
										transition="all 0.2s"
										disabled={!isAuthenticated}
									/>
									{searchInput && (
										<InputLeftElement right={0}>
											<IconButton
												icon={<AiOutlineClose />}
												onClick={handleClearSearch}
												variant="ghost"
												size="sm"
												aria-label="Clear search"
												_hover={{ bg: "gray.100" }}
											/>
										</InputLeftElement>
									)}
								</InputGroup>
							</FormControl>

							{/* Search Status */}
							{searchInput && searchInput.length < 2 && (
								<Alert status="info" borderRadius="md">
									<AlertIcon />
									<Text fontSize="sm">Type at least 2 characters to search</Text>
								</Alert>
							)}

							{/* Error Display */}
							{error && (
								<Alert status="error" borderRadius="md">
									<AlertIcon />
									<Box>
										<Text fontWeight="bold">Search Error</Text>
										<Text fontSize="sm">{error}</Text>
									</Box>
								</Alert>
							)}

							{/* Search Results */}
							{searchInput && searchInput.length >= 2 && isAuthenticated && !error && (
								<>
									<Divider />
									<Box>
										<HStack justify="space-between" mb={3}>
											<Text fontSize="sm" fontWeight="medium" color="gray.600">
												{isLoading ? "Searching..." : `Results (${users.length})`}
											</Text>
											{users.length > 0 && (
												<Text fontSize="xs" color="gray.500">
													Searching for &ldquo;{query}&rdquo;
												</Text>
											)}
										</HStack>

										{isLoading ? (
											<Box textAlign="center" py={8}>
												<Text color="gray.500">Searching...</Text>
											</Box>
										) : users.length > 0 ? (
											<VStack spacing={3} align="stretch" maxH="400px" overflowY="auto">
												{users.map((user) => (
													<SuggestedUser key={user.id} user={user} />
												))}
											</VStack>
										) : searchInput.trim() && searchInput.length >= 2 ? (
											<Box textAlign="center" py={8}>
												<Text color="gray.500" fontSize="lg" mb={2}>
													No users found
												</Text>
												<Text color="gray.400" fontSize="sm">
													Try searching with a different username or name
												</Text>
											</Box>
										) : null}
									</Box>
								</>
							)}

							{/* Search Tips */}
							{!searchInput && isAuthenticated && !error && (
								<Box textAlign="center" py={8}>
									<Text color="gray.500" fontSize="lg" mb={2}>
										Search for users
									</Text>
									<Text color="gray.400" fontSize="sm">
										Enter at least 2 characters to find other users
									</Text>
								</Box>
							)}


						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	);
};

export default Search;
