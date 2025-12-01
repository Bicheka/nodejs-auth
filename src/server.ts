import express from "express";
import { redisStore } from "./config";
import authRouter from "./routes";
import session from "express-session";
const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.set("trust proxy", 1); // if behind a proxy

// Initialize session storage.
app.use(
  session({
    store: redisStore,
    name: "sessionCookie",
    secret: String(process.env.SESSION_SECRET),
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    cookie: {
      httpOnly: true,
      // secure should be true in production (HTTPS). Here we detect by NODE_ENV
      secure: process.env.NODE_ENV === "prod",
      sameSite: "lax", // 'lax' helps with OAuth redirects
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Types: extend session's shape
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

// Auth routes
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log("Server running in port ", PORT);
});
