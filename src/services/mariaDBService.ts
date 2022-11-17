import * as dotenv from "dotenv";
import MariaDBService from "mariadb";

dotenv.config();

const pool = MariaDBService.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 5,
  bigIntAsNumber: true,
  insertIdAsNumber: true,
  multipleStatements: true,
});

const MariaDB = {
  query: async (sql: string, params?: Array<number | string>) => {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.query(sql, params).finally(() => {});
    } finally {
      if (conn) conn.release().finally(() => {}); // release to pool
    }
  },
  batch: async (sql: string, params?: any[]) => {
    let conn;
    try {
      conn = await pool.getConnection();
      return await conn.batch(sql, params).finally(() => {});
    } finally {
      if (conn) conn.release().finally(() => {}); // release to pool
    }
  },
};

export default MariaDB;
