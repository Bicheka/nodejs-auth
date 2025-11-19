import express from "express";

import authRouter from "./routes"
const PORT = process.env.PORT;

const app = express();

// Auth routes
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log("Server running in port ", PORT);
});
