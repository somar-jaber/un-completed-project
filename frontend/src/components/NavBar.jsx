import { Outlet } from "react-router-dom";
import "./NavBar.css";
import LogoutButton from "../components/LogoutButton";

const NavBar = () => {
    return(
        <>
            <div className="nav-bar" >
                <h1>Welcom To Blog 0</h1>
                <p>Welcom {localStorage.getItem("username")}</p>
                <LogoutButton />
            </div>
            <Outlet />
        </>
    );
}

export default NavBar;