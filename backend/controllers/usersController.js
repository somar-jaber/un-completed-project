const AppDataSource = require('../config/database');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');

const userRepository = AppDataSource.getRepository("User");

// Joi validation
function validateUser(reqBody) {
    const schema = Joi.object({
        username: Joi.string().required().trim(),
        email: Joi.string().required().trim(),
        password: Joi.string().min(8).pattern(new RegExp('(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])')).message({"string.pattern.bas" : "Password , must include at least 1 capital letter, 1 digit and a special character "}).required(),
        role: Joi.string().lowercase().trim().valid("guest", "author", "admin"),
    });

    let result = schema.validate(reqBody);
    return result;    
}



async function getUsers(req, res) {
    try {
        const users = await userRepository.find({
            select: ["id", "username", "email", "createdAt", "updatedAt", "role"] // Excluding password
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
}


async function getUserById(req, res) {
    try {
        const user = await userRepository.findOne({
            where: { id: parseInt(req.params.id) },
            select: ["id", "username", "email", "createdAt", "updatedAt", "role"]
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
}


async function createUser(req, res) {
    try {
        const { username, email, password, role } = req.body;
        
        // Validate user
        const result = validateUser(req.body);
        if (result.error) {
            return res.status(400).json({ message: 'Validation failed', error: result.error });
        }
        
        // Hash the password
        const hashedPassword = await argon2.hash(password);
        
        // Create new user
        const user = userRepository.create({
            username,
            email,
            password: hashedPassword,
            role
        });
        
        // Save the user
        await userRepository.save(user);
        
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
}


async function updateUser(req, res) {
    try {
        const user = await userRepository.findOne({
            where: { id: parseInt(req.params.id) }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Validate user
        const result = validateUser(req.body);
        if (result.error) {
            return res.status(400).json({ message: 'Validation failed', error: result.error });
        }
        
        // Update user properties
        userRepository.merge(user, req.body);
        
        // If password is being updated, hash it
        if (req.body.password) {
            user.password = await argon2.hash(req.body.password);
        }
        
        await userRepository.save(user);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
}

async function deleteUser(req, res) {
    try {
        const result = await userRepository.delete(req.params.id);
        
        if (result.affected === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
}


module.exports = {
    validateUser,
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    userRepository
};