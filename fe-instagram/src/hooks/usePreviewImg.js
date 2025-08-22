import { useState } from "react";
import useShowToast from "./useShowToast";

const usePreviewImg = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const showToast = useShowToast();
	const maxFileSizeInBytes = 2 * 1024 * 1024; // 2MB

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type.startsWith("image/")) {
			if (file.size > maxFileSizeInBytes) {
				showToast("Error", "File size must be less than 2MB", "error");
				setSelectedFile(null);
				setPreviewUrl(null);
				return;
			}

			// Store the actual File object for upload
			setSelectedFile(file);

			// Create preview URL for UI display
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result);
			};
			reader.readAsDataURL(file);
		} else {
			showToast("Error", "Please select an image file", "error");
			setSelectedFile(null);
			setPreviewUrl(null);
		}
	};

	const clearFile = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
	};

	return { selectedFile, previewUrl, handleImageChange, setSelectedFile, clearFile };
};

export default usePreviewImg;
