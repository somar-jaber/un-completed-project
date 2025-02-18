import "./AddPost.css";
import { useNavigate } from "react-router-dom";

const AddPost = () => {
    const navigate = useNavigate();

    const handleAddingPost = async (e) => {
        e.preventDefault();

        if (!localStorage.getItem("token")) {
            navigate("/login");
        }
        navigate("/upload-page");
    }

    return (
        <>
            <button className="add-post" onClick={handleAddingPost} >+</button>
        </>
    );
}

export default AddPost;