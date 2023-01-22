import express, { urlencoded } from "express";
import dotenv from "dotenv";
import { connectPassport } from "./utils/Provider.js";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.js";
import orderRoute from "./routes/order.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import cors from "cors";
import redis from "redis";
import RedisStore from "connect-redis";
import MemoryStore from "memorystore";

// const redisClient = redis.createClient();

dotenv.config({
    path: "./config/config.env",
});

// export const redisClient = redis.createClient({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
// });

// redisClient.connect();

// redisClient.ping().then(console.log).catch(console.error);

// const RedisStore1 = RedisStore(session);
// const redisStore = new RedisStore1({
//     client: redisClient,
// });

const MemoryStoreSession = MemoryStore(session);

// redisClient.on("connect", function (err) {
//     if (err) {
//         console.log("Could not establish a connection with Redis. " + err);
//     } else {
//         console.log("Connected to Redis successfully!");
//     }
// });

// console.log("redisStore", redisStore);

const app = express();
export default app;

app.use(cookieParser());
app.use(express.json());
app.use(
    urlencoded({
        extended: true,
    })
);

// app.use(
//     session({
//         store: new MemoryStoreSession({
//             checkPeriod: 86400000,
//         }),
//         secret: process.env.SESSION_SECRET,
//         resave: false,
//         saveUninitialized: false,
//         cookie: {
//             secure: process.env.NODE_ENV === "development" ? false : true,
//             httpOnly: process.env.NODE_ENV === "development" ? false : true,
//             sameSite: process.env.NODE_ENV === "development" ? false : "strict",
//             maxAge: 1000 * 60 * 60 * 24,
//         },
//     })
// );

app.use(
    session({
        store: new MemoryStoreSession({
            checkPeriod: 86400000,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "development" ? false : true,
            httpOnly: process.env.NODE_ENV === "development" ? false : true,
            sameSite: process.env.NODE_ENV === "development" ? false : "none",
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());
app.enable("trust proxy");

connectPassport();
// Importing Routes

app.use("/api/v1", userRoute);
app.use("/api/v1", orderRoute);

//Using Error Middleware
app.use(errorMiddleware);

// redisClient.on("error", (err) => {
//     console.log("Error connecting to Redis:", err);
// });
