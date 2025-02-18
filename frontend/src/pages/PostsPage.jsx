import { useEffect, useState } from 'react';
import AddPost from "../components/AddPost";
import "./posts-page.css"

const PostsPage = () => {
    // const [username, setUsername] = useState("");
    const [message, setMessage] = useState(null);
    const [posts, setPosts] = useState([]);
    const token = localStorage.getItem('token').trim();    

    useEffect(() => {
        const fetchUserDetails = async () => {
            // Fetch user details
             const userResponse = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem("token"),
                },
            });
        
            if (userResponse.ok) {
                const userData = await userResponse.json();
                // setUsername(userData.username);
                localStorage.setItem("username", userData.username);                
                localStorage.setItem("authorId", userData.id);                
            } else {
                const errorData = await userResponse.json();
                setMessage(`Failed to fetch user details: ${errorData.message}`);
            }
        }  // fetchUserDetails
    
        fetchUserDetails();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {

            const response = await fetch('/api/posts', {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data);              
            }
            else {
                const errorMessage = await response.text();
                console.error('Error fetching posts:', errorMessage);
            }
        };

        fetchUsers();
    }, [token]);

    return (
        <div className='posts-page' >
            <AddPost />
            {message && <h3 className="message">{message}</h3>}
            {posts.map((post) => (
                <div className='post' key={post.id}>
                    <h3>{post.title}</h3>
                    <p>{post.message.text}</p>
                    {post.message.media.map((oneMedia) => {
                        return <p key={oneMedia.path} >{oneMedia.path}</p>
                    })}
                </div>
            ))}
        </div>
    );
};

export default PostsPage;
