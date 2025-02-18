import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import NavBar from "./components/NavBar";
import PostsPage from './pages/PostsPage';
import UploadPage from './pages/UploadPage';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<NavBar />} >
            <Route index element={<PostsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/upload-page" element={<UploadPage />} />
        </Route>
    ),
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
