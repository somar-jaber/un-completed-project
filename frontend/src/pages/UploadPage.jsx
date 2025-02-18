import { useEffect, useState } from 'react';
import "./UploadPage.css";
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [arrayOfMedia, setMedia] = useState([]);
    // const [authorId, setAuthorId] = useState('');
    const [filesArray, setFilesArray] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        if (!localStorage.getItem("token") || !localStorage.getItem("authorId"))
            navigate("/login");
    }, [navigate]);


    const handleMediaChange = (e) => {
        const media = Array.from(e.target.files);
        const mediaArray = media.map((file) => {         
            console.log("File", file);
               
            return {
                type: file.type,
                path: URL.createObjectURL(file),
            }
        });
        setMedia(mediaArray);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const filesInput = document.getElementById('files-input');
        const files = Array.from(filesInput.files);  // Convert FileList to Array
        setFilesArray(files);
        console.log("Files", files);

        handleMediaChange({ target: { files: filesInput.files }});

        let authorId = localStorage.getItem("authorId");
        const postData = {
            title,
            message: {
                text,
                media: arrayOfMedia,
            },
            authorId,
            filesArray
        };

        try {
            console.log("============\n", postData, "\n==========");
            
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem("token") || "",
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok)
                throw new Error(await response.text());

            const data = await response.json();
            console.log(data);         
            
            // navigate("/");
        } catch (error) {
            console.error('Error uploading post:', error);
        }
    };

    return (
        <div className="upload-page" >
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
                    <input id="files-input" type="file" name="media" multiple onChange={handleMediaChange} />
                </div>
                <button type="submit">Upload Post</button>
            </form>
        </div>
    );
};

export default UploadPage;
