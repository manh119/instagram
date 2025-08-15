import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import AuthPage from "./pages/AuthPage/AuthPage";
import PageLayout from "./Layouts/PageLayout/PageLayout";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import OAuth2Redirect from "./components/auth/OAuth2Redirect";
import { useAuth } from "./contexts/AuthContext";

function App() {
	const { isAuthenticated, loading } = useAuth();

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
				<Route path='/' element={isAuthenticated ? <HomePage /> : <Navigate to='/auth' />} />
				<Route path='/auth' element={!isAuthenticated ? <AuthPage /> : <Navigate to='/' />} />
				<Route path='/oauth2/redirect' element={<OAuth2Redirect />} />
				<Route path='/:username' element={<ProfilePage />} />
			</Routes>
		</PageLayout>
	);
}

export default App;
