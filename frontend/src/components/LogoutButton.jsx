import { useNavigate } from "react-router-dom";
import "./LogoutButton.css";

const LogoutButton = () => {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.setItem("token", "");
        localStorage.setItem("authorId", "");
        localStorage.setItem("username", "");
        location.reload()
    }

    return(
        <button className="logout-button" onClick={logout} >Logout</button>
    );
}

export default LogoutButton;