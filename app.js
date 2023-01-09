import express from "express";
import dotenv from "dotenv";
import { connectPassport } from "./utils/Provider.js";
import session from "express-session";
import passport from "passport";

const app = express();
export default app;

dotenv.config({
    path: "./config/config.env",
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());

connectPassport();
// Importing Routes

import userRoute from "./routes/user.js";

app.use("/api/v1", userRoute);
