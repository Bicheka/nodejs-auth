# NodeJs Auth

This project is an early work-in-progress.

The goal is simple: **create a basic authentication template for Node.js apps** that developers can use as a starting point or modify for their own needs.

Right now, the project is still in the early stages and **a lot of help is needed**. The idea is to build something that makes setting up auth easier without having to rewrite everything from scratch each time.

## Purpose

- Provide a simple starting point for email/password and OAuth login
- Offer a basic structure that developers can copy, adapt, or improve
- Keep things minimal, easy to understand, and flexible

## Status

- Very early development
- Many features are missing
- Open to contributions, ideas, and improvements

## Contributing

If you want to help shape this project, feel free to open issues, suggest changes, or submit pull requests. Any help is appreciated.

## Set up

To make it work, you are going to need to run [Postgres](https://www.postgresql.org/) and [Redis](https://redis.io/).
You also need to add an .env file to the project root, as shown in the .env.example

run:
```bash
npm run dev
```
## ⚠️ Warning: Postman

If you try to test GitHub OAuth login from **Postman** or similar API tools, it **might not work as expected**.

OAuth logins usually require a **browser redirect** to complete the authentication flow, so you should test these flows in a real browser or using a frontend client.

Postman is great for testing API endpoints like login with email/password, but OAuth redirects need a browser environment.

If anyone knows a good way to handle OAuth testing from Postman or other API tools, **please let me know!**

You can test the OAuth routes just by going to the route directly in the browser, eg http://localhost:3000/auth/github

Also, if you need help getting this project running or understanding parts of it, **feel free to reach out—I’m happy to help.**

## License

MIT
