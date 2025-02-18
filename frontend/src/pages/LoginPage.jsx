import { useState } from 'react';
import './LoginPage.css'; // Import the CSS file for styling
import { useNavigate } from 'react-router-dom';



const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePassword(password)) {
            setMessage('Password must be at least 8 characters long, include at least 1 capital letter, 1 digit, and a special character.');
            return;
        }

        try {
            const response = await fetch('api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const token = await response.text();
                localStorage.setItem('token', token);
                setMessage('Login successful!');
                // window.location.href = "/users";
                navigate("/");

            } else {
                const errorData = await response.json();                
                setMessage(`Login failed: ${errorData.message}`);
            }
        } catch (error) {
            setMessage(`Error at login: ${error.message}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserName('');
        setMessage('Logged out successfully.');
    }; 

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p className="message">{message}</p>}
            {userName && (
                <div>
                    <h3>Welcome, {userName}</h3>
                    <button onClick={() => window.location.href = '/users'}>Users Table</button>
                    <button onClick={() => window.location.href = '/login_logs'}>Login Logs Table</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default LoginPage;
