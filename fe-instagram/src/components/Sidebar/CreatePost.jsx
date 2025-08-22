import {
	Box,
	Button,
	CloseButton,
	Flex,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Textarea,
	Tooltip,
	useDisclosure,
	Text,
	IconButton,
	HStack,
} from "@chakra-ui/react";
import { CreatePostLogo } from "../../assets/constants";
import { BsFillImageFill, BsFillCameraVideoFill } from "react-icons/bs";
import { useRef, useState } from "react";
import usePreviewImg from "../../hooks/usePreviewImg";
import useShowToast from "../../hooks/useShowToast";
import { useAuth } from "../../contexts/AuthContext";
import usePostStore from "../../store/postStore";
import useUserProfileStore from "../../store/userProfileStore";
import { useLocation } from "react-router-dom";
import postService from "../../services/postService";

const CreatePost = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [caption, setCaption] = useState("");
	const imageRef = useRef(null);
	const videoRef = useRef(null);
	const { handleImageChange, selectedFile, previewUrl, setSelectedFile, clearFile } = usePreviewImg();
	const [selectedVideo, setSelectedVideo] = useState(null);
	const [videoPreview, setVideoPreview] = useState(null);
	const showToast = useShowToast();
	const { user: authUser } = useAuth();
	const { isLoading, handleCreatePost } = useCreatePost();

	const handleVideoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Check file size (100MB limit)
			if (file.size > 100 * 1024 * 1024) {
				showToast("Error", "Video file size must be less than 100MB", "error");
				return;
			}

			// Check file type
			if (!file.type.startsWith('video/')) {
				showToast("Error", "Please select a valid video file", "error");
				return;
			}

			setSelectedVideo(file);
			const url = URL.createObjectURL(file);
			setVideoPreview(url);
		}
	};

	const handlePostCreation = async () => {
		try {
			await handleCreatePost(selectedFile, selectedVideo, caption);
			onClose();
			setCaption("");
			clearFile(); // This clears both selectedFile and previewUrl
			setSelectedVideo(null);
			setVideoPreview(null);
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	const clearMedia = () => {
		clearFile();
		setSelectedVideo(null);
		setVideoPreview(null);
	};

	return (
		<>
			<Tooltip
				hasArrow
				label={"Create"}
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
				>
					<CreatePostLogo />
					<Box display={{ base: "none", md: "block" }}>Create</Box>
				</Flex>
			</Tooltip>

			<Modal isOpen={isOpen} onClose={onClose} size='xl'>
				<ModalOverlay />

				<ModalContent bg={"black"} border={"1px solid gray"}>
					<ModalHeader>Create Post</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<Textarea
							placeholder='Post caption...'
							value={caption}
							onChange={(e) => setCaption(e.target.value)}
							mb={4}
						/>



						<HStack spacing={4} mb={4}>
							<Input type='file' hidden ref={imageRef} onChange={handleImageChange} accept="image/*" />
							<Input type='file' hidden ref={videoRef} onChange={handleVideoChange} accept="video/*" />

							<IconButton
								icon={<BsFillImageFill />}
								onClick={() => imageRef.current.click()}
								aria-label="Add image"
								colorScheme="blue"
								variant="outline"
								size="lg"
							/>


						</HStack>

						{/* Image Preview */}
						{previewUrl && (
							<Flex mt={5} w={"full"} position={"relative"} justifyContent={"center"}>
								<Image src={previewUrl} alt='Selected image' maxH="300px" objectFit="contain" />
								<CloseButton
									position={"absolute"}
									top={2}
									right={2}
									onClick={() => clearFile()}
								/>
							</Flex>
						)}

						{/* Video Preview */}
						{selectedVideo && (
							<Flex mt={5} w={"full"} position={"relative"} justifyContent={"center"}>
								<video
									src={videoPreview}
									controls
									style={{ maxHeight: "300px", maxWidth: "100%" }}
								/>
								<CloseButton
									position={"absolute"}
									top={2}
									right={2}
									onClick={() => {
										setSelectedVideo(null);
										setVideoPreview(null);
									}}
								/>
							</Flex>
						)}

						{/* Clear All Button */}
						{(selectedFile || selectedVideo) && (
							<Button
								onClick={clearMedia}
								colorScheme="gray"
								variant="outline"
								size="sm"
								mt={3}
							>
								Clear All Media
							</Button>
						)}
					</ModalBody>

					<ModalFooter>
						<Button
							mr={3}
							onClick={handlePostCreation}
							isLoading={isLoading}
							isDisabled={!selectedFile && !selectedVideo}
						>
							Post
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreatePost;

function useCreatePost() {
	const showToast = useShowToast();
	const [isLoading, setIsLoading] = useState(false);
	const createPost = usePostStore((state) => state.createPost);
	const addPost = useUserProfileStore((state) => state.addPost);
	const userProfile = useUserProfileStore((state) => state.userProfile);
	const { pathname } = useLocation();
	const { user: authUser } = useAuth();

	const handleCreatePost = async (selectedFile, selectedVideo, caption) => {
		if (isLoading) return;
		if (!selectedFile && !selectedVideo) throw new Error("Please select an image or video");
		if (!authUser) throw new Error("You must be logged in to create a post");

		setIsLoading(true);

		try {
			// Create post using the real API
			const postData = {
				caption: caption
			};

			if (selectedFile) {
				postData.image = selectedFile;
			}
			if (selectedVideo) {
				postData.video = selectedVideo;
			}

			const response = await postService.createPost(postData);

			if (response && response.post) {
				// Add the new post to the store
				createPost(response.post);

				// If we're on a profile page, also add to user profile store
				if (pathname !== "/" && userProfile?.uid === authUser.uid) {
					addPost(response.post);
				}

				showToast("Success", "Post created successfully", "success");
			} else {
				throw new Error("Failed to create post");
			}
		} catch (error) {
			console.error('Error creating post:', error);
			showToast("Error", error.message || "Failed to create post", "error");
		} finally {
			setIsLoading(false);
		}
	};

	return { isLoading, handleCreatePost };
}
