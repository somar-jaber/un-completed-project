const mysql = require("mysql2/promise");
const config = require("config");

const configObj= {
    host: config.get("db.host"),
    user: config.get("db.user"),
    password: config.get("db.password"),
    database: config.get("db.database"),
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0  // "queueLimit" It defines the number of connection requests that can be queued up if all available connections in the pool are in use. 0 means there is no limit on the number.  

}

console.log(configObj);

// Creating a connection pool
// this to minimize the overhead of establishing a new connection for every query, while still ensuring that connections are properly closed when they are no longer needed
const pool = mysql.createPool(configObj);


async function query(sql, params) {
    const [results, ] = await pool.execute(sql, params);

    return results;
}

module.exports = {query};
