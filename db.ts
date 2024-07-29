import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import { Database } from "@/types/index";
import dotenv from "dotenv";
dotenv.config();


const dialect = new MysqlDialect({
  pool: createPool({
    database: 'prod_db',
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'admin',
    connectionLimit: 999,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
