import mysql from 'mysql2/promise'
let pool = mysql.createPool({
    host: "LAPTOP-VCP58CHN",
    user: "myuser",
    password: "mypassword",
    database: "dharsh",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;