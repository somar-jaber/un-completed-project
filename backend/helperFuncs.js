const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const config = require("config");
const fs = require('fs');
const path = require('path');


async function hash(password) {
    try {
        const hash = await argon2.hash(password);
        return hash;
    } catch (ex) {
        throw new Error(`An Error happend while hashing in Argon2 : ${err}`);
    }
}


async function hashVerify(db_hashed_pass, user_pass) {
    try {
        if (await argon2.verify(db_hashed_pass, user_pass)) {
            // password match
            return true;
        } else {
            // password did not match
            return false;
        }
    } catch (ex) {
        // internal failure
        throw new Error(`From hsashVerify function: ${ex}`);
    }
}

function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
}

function generateToken(record) {
    const token = jwt.sign({ id: record.id, role: record.role }, config.get("jwtPrivateKey"));
    return token
}


async function saveFiles(reqBody, res) {
    const filesArray = reqBody.filesArray;
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }

    filesArray.map((file) => {
        const dataUri = file;

        if(!dataUri)    return res.status(400).send("400 Bad Request: No file data provided");

        console.log("\n============", dataUri, "\n==============\n");
        
        // Extract the base64 content and file type
        const matches = dataUri.match(/^data:(.*);base64,(.*)$/);
        if (!matches) {
            throw new Error("Invalid data URI");
            // return res.status(400).send('Invalid data URI');
        }

        const fileType = matches[1];
        const base64Content = matches[2];

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(base64Content, 'base64');

        // Determine the file extension from the MIME type
        const fileExtension = fileType.split('/')[1];

        // Save the file to the server
        const filePath = path.join(__dirname, 'uploads', `${new Date()}-uploadedFile.${fileExtension}`);
        fs.writeFile(filePath, fileBuffer, (err) => {
            if (err) {
                throw new Error("Error saving file");
                // return res.status(500).send('Error saving file');
            }
            console.log('File uploaded successfully');
        });
    });
    return null;
}


module.exports = { getOffset, hash, hashVerify, generateToken, saveFiles };
