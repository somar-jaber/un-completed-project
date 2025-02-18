import { useEffect, useState } from 'react';
import "./UploadPage.css";
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [media, setMedia] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token") || !localStorage.getItem("authorId"))
            navigate("/login");
    }, [navigate]);

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setMedia(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('text', text);

        media.forEach((file, index) => {
            formData.append(`media`, file);
        });


         // Log FormData entries
        for (let pair of formData.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
        }        

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'x-auth-token': localStorage.getItem("token") || "",
                },
                body: formData,
            });

            if (!response.ok) throw new Error(`Bad response ${await response.text()}`);

            const data = await response.json();
            console.log(data);
            navigate("/");
        } catch (error) {
            console.error('Error uploading post:', error);
        }
    };

    return (
        <div className="upload-page">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div>
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Content</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Files</label>
                    <input type="file" name="media" multiple onChange={handleMediaChange} />
                </div>
                <button type="submit">Upload Post</button>
            </form>
        </div>
    );
};

export default UploadPage;
