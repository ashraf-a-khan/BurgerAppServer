import express from "express";
import {
    getAdminOrders,
    getMyOrders,
    getOrderDetails,
    // paymentVerification,
    placeOrder,
    placeOrderOnline,
    stripeToken,
    // placeOrderOnline,
    processOrder,
} from "../controllers/order.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/createorder", placeOrder);

router.post("/createorderonline", placeOrderOnline);

router.post("/createtoken", stripeToken);

// router.post("/createorderonline", isAuthenticated, placeOrderOnline);

// router.post("/paymentverification", isAuthenticated, paymentVerification);

router.get("/myorders", isAuthenticated, getMyOrders);

router.get("/order/:id", isAuthenticated, getOrderDetails);

// Add Admin Middleware
router.get("/admin/orders", isAuthenticated, authorizeAdmin, getAdminOrders);
router.get("/admin/order/:id", isAuthenticated, authorizeAdmin, processOrder);

export default router;
