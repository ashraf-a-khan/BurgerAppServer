import app from "./app.js";
import cors from "cors";
import express from "express";
import Stripe from "stripe";

import { connectDB } from "./config/database.js";
// import { redisClient } from "./app.js";

connectDB();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middlewares here
app.use(express.json());
app.use(cors());

app.get("/", (req, res, next) => {
    res.send("<h1>Working</h1>");
});

// process.on("SIGINT", () => {
//     console.log("Closing redisClient...");
//     redisClient.quit();
//     process.exit();
// });

export default app.listen(process.env.PORT, () =>
    console.log(
        `Server is working on PORT: ${process.env.PORT}, in ${process.env.NODE_ENV} MODE`
    )
);
