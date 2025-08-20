import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PostDetailPage from "./pages/PostDetailPage/PostDetailPage";
import { OAuth2Redirect } from "./components/auth/OAuth2Redirect";
import { useAuth } from "./contexts/AuthContext";

function App() {
	const { isAuthenticated, loading, user } = useAuth();

	if (loading) {
		return (
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
				backgroundColor: '#f7fafc'
			}}>
				<div>Loading...</div>
			</div>
		);
	}

	return (
		<PageLayout>
			<Routes>
				{/* Protected routes - only accessible when authenticated */}
				<Route path='/' element={
					isAuthenticated ? <HomePage /> : <Navigate to='/auth' replace />
				} />

				{/* Auth route - only accessible when NOT authenticated */}
				<Route path='/auth' element={
					!isAuthenticated ? <AuthPage /> : <Navigate to='/' replace />
				} />

				{/* OAuth2 redirect route - accessible to all */}
				<Route path='/oauth2/redirect' element={<OAuth2Redirect />} />

				{/* Profile routes - only accessible when authenticated */}
				<Route path='/profiles/me' element={
					isAuthenticated ? <ProfilePage isCurrentUser={true} /> : <Navigate to='/auth' replace />
				} />
				<Route path='/profiles/:id' element={
					isAuthenticated ? <ProfilePage /> : <Navigate to='/auth' replace />
				} />

				{/* Post detail route - only accessible when authenticated */}
				<Route path='/posts/:postId' element={
					isAuthenticated ? <PostDetailPage /> : <Navigate to='/auth' replace />
				} />

				{/* Catch all - redirect to appropriate route */}
				<Route path='*' element={
					isAuthenticated ? <Navigate to='/' replace /> : <Navigate to='/auth' replace />
				} />
			</Routes>
		</PageLayout>
	);
}

export default App;
