import express, { type Request, type Response } from "express";
import axios from "axios";

const PORT = process.env.PORT;

const app = express();

// GitHub
app.get("/auth/github", (_: Request, res: Response) => {
  const redirectUri = `http://localhost:${PORT}/auth/github/callback`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  // const githubApiURL = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  const githubApiUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  console.log(githubApiUrl)
  res.redirect(githubApiUrl);
});

app.get("/auth/github/callback", async (req: Request, res: Response) => {
  const code = req.query.code; // github sends a code

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  interface EmailObject {
    email: string;
    primary: boolean;
    verified: boolean;
  }

  const accessToken = tokenResponse.data.access_token;

  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const emailRes = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const email = emailRes.data.find((e: EmailObject) => e.primary && e.verified)?.email;
  console.log('GitHub user:', {
    name: userResponse.data.name,
    email
  })

  // redirect to the desired frontend page
  res.redirect('http://localhost:5173/success')
});

app.listen(PORT, () => {
  console.log("Server running in port ", PORT);
});
