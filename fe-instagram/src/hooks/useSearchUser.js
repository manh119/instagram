import { useState, useRef, useCallback } from "react";
import useShowToast from "./useShowToast";
import userSearchService from "../services/userSearchService";

const useSearchUser = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [users, setUsers] = useState([]);
	const [query, setQuery] = useState("");
	const [error, setError] = useState(null);
	const showToast = useShowToast();

	// Cache for search results to prevent duplicate API calls
	const searchCache = useRef(new Map());
	const lastSearchQuery = useRef("");

	const searchUsers = useCallback(async (searchQuery, limit = 10) => {
		if (!searchQuery.trim()) {
			setUsers([]);
			setQuery("");
			setError(null);
			return;
		}

		// Check if we already have results for this exact query
		const cacheKey = `${searchQuery.toLowerCase()}_${limit}`;
		if (searchCache.current.has(cacheKey)) {
			console.log("Using cached results for:", searchQuery);
			setUsers(searchCache.current.get(cacheKey));
			setQuery(searchQuery);
			return;
		}

		// Prevent duplicate searches for the same query
		if (lastSearchQuery.current === searchQuery) {
			console.log("Skipping duplicate search for:", searchQuery);
			return;
		}

		setIsLoading(true);
		setQuery(searchQuery);
		setError(null);
		lastSearchQuery.current = searchQuery;

		try {
			const searchResults = await userSearchService.searchUsers(searchQuery, limit);

			// Cache the results
			searchCache.current.set(cacheKey, searchResults);

			// Limit cache size to prevent memory issues
			if (searchCache.current.size > 50) {
				const firstKey = searchCache.current.keys().next().value;
				searchCache.current.delete(firstKey);
			}

			setUsers(searchResults);

			if (searchResults.length === 0) {
				showToast("No results", `No users found for "${searchQuery}"`, "info");
			}
		} catch (error) {
			console.error("Error searching users:", error);

			// Handle different types of errors
			if (error.message.includes("No authentication token found")) {
				setError("Please log in to search for users");
				showToast("Authentication Required", "Please log in to search for users", "warning");
			} else if (error.message.includes("401")) {
				setError("Session expired. Please log in again");
				showToast("Session Expired", "Please log in again to continue", "warning");
			} else {
				setError(error.message || "Failed to search users");
				showToast("Error", error.message || "Failed to search users", "error");
			}

			setUsers([]);
		} finally {
			setIsLoading(false);
		}
	}, [showToast]);

	const clearSearch = useCallback(() => {
		setUsers([]);
		setQuery("");
		setError(null);
		lastSearchQuery.current = "";
	}, []);

	const clearCache = useCallback(() => {
		searchCache.current.clear();
		console.log("Search cache cleared");
	}, []);

	return {
		isLoading,
		users,
		query,
		error,
		searchUsers,
		clearSearch,
		clearCache,
		setUsers
	};
};

export default useSearchUser;
