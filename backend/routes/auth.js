const db = require("../controllers/db.js");
const {select, getOne, userRepository} = require("../controllers/usersController");
const Joi = require("joi");
const express = require("express");
const { hashVerify, generateToken } = require("../helperFuncs");
const authMiddleware = require("../middleware/authMiddleware");
const { getUserById } = require("../controllers/usersController");
const { log } = require("debug/src/browser.js");
const router = express.Router();





// Joi validation
function authValidation(reqBody) {
    const schema = Joi.object({
        email: Joi.string().required().trim(),
        password: Joi.string().required(),
        "g-recaptcha-response": Joi.string().allow("", null),
    });

    let result = schema.validate(reqBody);
    return result;    
}


/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get information about the current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Authentication failed
 */

// Getting information about the current user
router.get("/me", [authMiddleware], async (req, res) => {
    try {
        const record = await userRepository.findOne({
            where: { id: parseInt(req.user.id) },
            select: ["id", "username", "email", "createdAt", "updatedAt","role"]
        });
        return res.send(record);
    } catch (ex) {
        return res.status(400).send(`400 bad Request: ${ex}`);
    }
});

/**
 * @swagger
 * /api/auth:
 *   post:
 *     summary: Login to get JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin1234*
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token to be used for authenticated requests
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Authentication failed
 */

router.post("/", async (req, res) => {
    let result = authValidation(req.body);
    if (result.error)  return res.status(400).send(`400 Bad Request : ${result.error.details[0].message}`);
    try {
        const record = await userRepository.findOne({
            where: { email: req.body.email },
            select: ["id", "username", "email", "password", "createdAt", "updatedAt","role"]
        });
        
        if (!record)
            return res.status(404).json({ message: '404 Not Found: User not found' });
        
        if (record.length == 0 )  return res.status(400).send("400 Bad Request: Incorrect password or Email");       

        let db_hashed_pass = record.password;
        let vaildPassword = await hashVerify(db_hashed_pass, req.body.password || req.params.password);
        
        if (!vaildPassword)
            return res.status(400).send("400 Bad Request: Incorrect password or Email"); 
        
        let r = await db.query(`INSERT INTO login_logs (user_id) VALUES (${record.id})`);
        const token = generateToken(record);
        return res.header('x-auth-token', token).send(token);
    } catch (ex) {
        res.status(500).send(`500 bad Request: ${ex}`);
    }
});

module.exports.router = router;