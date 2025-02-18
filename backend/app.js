require('reflect-metadata');
const cors = require('cors');
const path = require("path");
const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const startupDebugger = require("debug")("app:startup");
const logger = require('./logger');
const express = require("express");
const AppDataSource = require('./config/database');
const initializeAdmin = require('./utils/adminInitializer');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const multer = require('multer');
const app = express();


// handling uncaught exceptions
process.on('uncaughtException', function(err) {
    console.log("We have got an Unhandled Exception");
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// handling unhandled promise rejections
process.on('unhandledRejection', function(err) {
    console.log("We have got an Unhandled Rejection");
    logger.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Initialize TypeORM and create admin user if not exists
AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");
        await initializeAdmin(AppDataSource);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
        process.exit(1);
    });


if (!config.get("jwtPrivateKey")) {
    console.error("Fatal Error: jwtPrivateKey is not defined");
    process.exit(1);
}

// Environment
console.log(`Node_ENV is : ${process.env.NODE_ENV}`);
if (app.get('env') === "development") {
    // for logging the http traffic
    app.use(morgan('tiny'));
    // for startup debugging (to see this you should set the envirounment variable "DEBUG=app:startup")
    startupDebugger("Morgan Enabled...");
}

const corsOptions = {
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200
};


// Set up storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|avi/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
  
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and videos are allowed!'));
    }
};

// Initialize upload with multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Ensure the uploads directory exists
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}


// middlewares 
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('uploads'));
app.use(helmet());  // for adding more protection
app.use(cors(corsOptions)); 
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; img-src 'self' data: https://www.google.com https://www.gstatic.com;"
    );
    next();
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "WebDLX API Documentation"
}));

// Routes 
const users = require("./routes/users");
app.use("/api/users" ,users.router);

const auth = require("./routes/auth");
app.use("/api/auth", auth.router);

const posts = require("./routes/posts");
app.use("/api/posts", posts.router);

// Error-handling middleware for the routes errors
app.use((err, req, res, next) => {
    logger.error(err.message);
    return res.status(500).json({ message: 'Internal Server Error' });
});


// Main rout
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, 'views', 'index.html'))
    // return res.send('Welcome To The API');
});

// Route to handle file uploads (multer)
app.post('/upload', (req, res, next) => {
    upload.array('files', 10)(req, res, (err) => { // Change 'files' to your form field name and set the max number of files
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      res.send('Files uploaded successfully!');
    });
});
  

PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
