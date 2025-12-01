import pkg from "pg";
import {RedisStore} from "connect-redis";
import { createClient } from "redis";

// setup postgresdb
const { Pool } = pkg;
export const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB_NAME,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
  connectionTimeoutMillis: 5000,
});

// Initialize Client
let redisClient = createClient(); // let redisClient = createClient({port:6379, host:'localhost'});
redisClient.connect().catch(console.error);

// Initialize store.
export let redisStore = new RedisStore({
  client: redisClient,
  prefix: "todoapp:",
})
