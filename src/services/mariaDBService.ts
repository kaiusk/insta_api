import * as dotenv from "dotenv";

dotenv.config();
const MariaDBService = require("mariadb");
const pool = MariaDBService.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

export class MariaDB {
  static async query(sql: string, params?: (number | string)[]) {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(sql, params);
    } finally {
      if (conn) conn.release(); //release to pool
    }
  }
}
