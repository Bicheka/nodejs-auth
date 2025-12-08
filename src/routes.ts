import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import axios from "axios";
import {
  createUser,
  findUserByEmail,
  updateUserAuthProvider,
  findUserByProvider,
  loginUserSession,
  createUserWithProvider,
} from "./service";
import bcrypt from "bcrypt";

const authRouter = express.Router();
const PORT = process.env.PORT;

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !req.session.userId) {
    return void res.status(401).json({ error: "Not authenticated" });
  }

  next();
}

// Get user info
authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  const userID = req.session.userId;
  res.send(userID).status(200);
});

// Github
authRouter.get("/github", (_: Request, res: Response) => {
  const redirectUri = `http://localhost:${PORT}/auth/github/callback`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const githubApiUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  res.redirect(githubApiUrl);
});

authRouter.get(
  "/github/callback",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const code = req.query.code as string;
      if (!code) return void res.status(400).send("Missing code from GitHub");

      const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        { headers: { Accept: "application/json" } }
      );

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken)
        return void res.status(500).send("No access token from GitHub");

      const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const emailRes = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      type EmailObject = {
        email: string;
        primary: boolean;
        verified: boolean;
      };

      const primaryEmail = emailRes.data.find(
        (e: EmailObject) => e.primary && e.verified
      )?.email;
      console.log("user data: ", userResponse.data);
      const githubId = String(userResponse.data.id);
      const name = userResponse.data.name ?? userResponse.data.login;
      const email = primaryEmail ?? userResponse.data.email ?? null;

      // find user
      let user = await findUserByProvider("github", githubId);

      // find user that might have created account with email and password and has same email as github account
      if (!user && email) {
        user = await findUserByEmail(email.toLowerCase());

        if(user) {
          // update the providers table creating a new row that link to this i
          await updateUserAuthProvider(user.id, "github", githubId);

        } else {
          // if no user was found
          // create user and update provider
          const newUser = {
            email: email ? email.toLowerCase() : undefined,
            name,
            email_verified: true,
            password: undefined,
          };
          user = await createUserWithProvider(newUser, "github", githubId);
        }
      }
      if(!user) {
        throw new Error("User could not be resolved")
      }
      loginUserSession(req, user);

      // redirect to the desired frontend url
      return void res.redirect("http://localhost:5173/");
    } catch (err) {
      console.error("GitHub callback error:", err);
      return void res.status(500).send("OAuth error");
    }
  }
);

// TODO Google

//Email + Password Signup
authRouter.post(
  "/signup",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body as {
        email: string;
        password: string;
        name: string;
      };

      if (!email || !password)
        return void res
          .status(400)
          .json({ error: "Email and password required" });

      const existing = await findUserByEmail(email.toLowerCase());
      if (existing)
        return void res.status(409).json({ error: "User already exists" });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await createUser({
        email: email.toLowerCase(),
        password: passwordHash,
        name,
        email_verified: false
      });

      loginUserSession(req, user);
      res.json({
        ok: true,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

// Email + Password Login
authRouter.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };
      if (!email || !password)
        return void res
          .status(400)
          .json({ error: "Email and password required" });

      const user = await findUserByEmail(email.toLowerCase());
      console.log("user: ", user);
      if (!user || !user.password) {
        // no user or password (maybe registered with OAuth only)
        return void res.status(401).json({ error: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return void res.status(401).json({ error: "Invalid credentials" });

      loginUserSession(req, user);
      res.json({
        ok: true,
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal error" });
    }
  }
);

// Logout
authRouter.post("/logout", (req: Request, res: Response) => {
  return req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
      return res.status(500).json({ ok: false });
    }

    // Clear cookie
    res.clearCookie("sessionCookie", {
      path: "/",
    });

    return res.sendStatus(200)
  });
});

export default authRouter;
