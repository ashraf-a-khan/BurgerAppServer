import app from "./app.js";
import cors from "cors";
import express from "express";
import Stripe from "stripe";

import { connectDB } from "./config/database.js";

connectDB();

// require("dotenv").config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const app = express();

// Middlewares here
app.use(express.json());
app.use(cors());

app.get("/", (req, res, next) => {
    res.send("<h1>Working</h1>");
});

app.listen(process.env.PORT, () =>
    console.log(
        `Server is working on PORT: ${process.env.PORT}, in ${process.env.NODE_ENV} MODE`
    )
);

// // Listen
// app.listen(8000, () => {
//   console.log("Server started at port 8000");
// });
