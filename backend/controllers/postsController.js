const { log } = require('debug/src/browser');
const AppDataSource = require('../config/database');
const Joi = require('joi');
const { upload } = require('../utils/upload');
const { saveFiles } = require('../helperFuncs');
const postRepository = AppDataSource.getRepository("Posts");

// Joi validation schema
function validatePost(post) {
    const schema = Joi.object({
        title: Joi.string().required().min(3).max(255),
        message: Joi.object({
            text: Joi.string().required(),
            media: Joi.array().items(
                Joi.object({
                    type: Joi.string(),
                    path: Joi.string(),
                })
            )
        }),
        authorId: Joi.string().required(),
        filesArray: Joi.array().allow("", null),
    });

    return schema.validate(post);
}

async function getPosts(req, res) {
    try {
        const posts = await postRepository.find({
            relations: ['author'],
            select: {
                // id: true,
                // title: true,
                // message: true,
                // createdAt: true,
                // updatedAt: true,
                author: {
                    password: false
                }
            }
        });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
}

async function getPostById(req, res) {
    try {
        const post = await postRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['author'],
            select: {
                // id: true,
                // title: true,
                // message: true,
                // createdAt: true,
                // updatedAt: true,
                author: {
                    password: false
                }
            }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post' });
    }
}

// async function createPost(req, res) {
//     try {
//         // Validate post data
//         const { error } = validatePost(req.body);
//         if (error) {
//             return res.status(400).json({ message: 'Validation failed', error: error.details[0].message });
//         }

//         // Create new post
//         const post = postRepository.create({
//             ...req.body,
//             author: req.user.id // From auth middleware
//         });

//         await postRepository.save(post);
//         return res.status(201).json({ message: 'Post created successfully', post });
//     } catch (error) {
//         console.error('Error creating post:', error);
//         return res.status(500).json({ message: 'Error creating post' });
//     }
// }

async function createPost(req, res) {
    try {
        // Validate post data
        const { error } = validatePost(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation failed', error: error.details[0].message });
        }

        const mediaFiles = req.body.message.media.map(file => {
            if (!file) return null;

            return {
                type: file.type,
                path: `${new Date()}-${file.path.split("/")[3]}`,
            }
        });

        // Create new post
        const post = postRepository.create({
            ...req.body,
            message: {
                ...req.body.message,
                media: mediaFiles
            },
            authorId: req.user.id // From auth middleware
        });

        console.log("\n=========++===", req.body.filesArray, "\n==============\n");
        
        await saveFiles(req.body, res);
        await postRepository.save(post);

        // upload(req, res, async (err) => {
        //     if (err) {
        //         throw new Error(`File upload error, error: ${err}`);
        //     } else {
        //         console.log("=================>", "succedded");
        //     }
        // });
        return res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        console.log('Error creating post:', error);
        return res.status(500).json({ message: `Error creating post ${error}` });
    }
}



async function updatePost(req, res) {
    try {
        // Find the post
        const post = await postRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['author']
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is authorized to update this post
        if (post.author.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        // Validate update data
        const { error } = validatePost(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation failed', error: error.details[0].message });
        }

        // Update post
        postRepository.merge(post, req.body);
        await postRepository.save(post);

        return res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Error updating post' });
    }
}

async function deletePost(req, res) {
    try {
        const post = await postRepository.findOne({
            where: { id: parseInt(req.params.id) },
            relations: ['author']
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is authorized to delete this post
        if (post.author.id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await postRepository.remove(post);
        return res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Error deleting post' });
    }
}

module.exports = {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
