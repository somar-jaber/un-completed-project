const { DataSource } = require('typeorm');
const config = require("config");

const AppDataSource = new DataSource({
    type: "mysql",
    host: config.get("db.host"),
    port: 3306,
    username: config.get("db.user"),
    password: config.get("db.password"),
    database: config.get("db.database"),
    synchronize: true, // Be careful with this in production
    logging: true,
    entities: ["./entities/**/*.js"],
    subscribers: [],
    migrations: [],
});

module.exports = AppDataSource;
