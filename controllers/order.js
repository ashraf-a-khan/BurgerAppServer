import { asyncError } from "../middlewares/errorMiddleware.js";
import { Order } from "../models/Order.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { stripe } from "../server.js";
import { Payment } from "../models/Payment.js";
import mongoose from "mongoose";
import crypto from "crypto";

let globalToken = "";

export const placeOrder = asyncError(async (req, res, next) => {
    console.log({ req });
    const {
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
        stripeToken,
    } = req.body;

    const user = req.user._id;

    const orderOptions = {
        shippingInfo,
        orderItems,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
        user,
        stripeToken,
    };

    await Order.create(orderOptions);

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully via Cash On Delivery",
    });
});

export const stripeToken = asyncError(async (req, res) => {
    try {
        // Retrieve the credit card information from the request body
        const { number, exp_month, exp_year, cvc } = req.body;
        // Create a token using the credit card information
        const token = await stripe.tokens.create({
            card: {
                number,
                exp_month,
                exp_year,
                cvc,
            },
        });
        // globalToken = token.id;

        // Send the token as the response
        res.status(201).json({
            success: true,
            message: "Token created successfully",
            token: token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating token",
            error: error,
        });
    }
});

export const placeOrderOnline = asyncError(async (req, res, next) => {
    // console.log({ req });
    // console.log({ res });
    const {
        shippingInfo,
        orderItems,
        stripeToken,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
    } = req.body;

    const user = req.user._id;

    const orderOptions = {
        shippingInfo,
        orderItems,
        paymentMethod: "Online",
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
        user,
        stripeToken,
    };

    const charge = await stripe.charges.create({
        amount: totalAmount * 100,
        currency: "usd",
        source: stripeToken,
        description: `Order #${Math.floor(Math.random() * 1000000)}`,
    });

    if (charge.status === "succeeded") {
        await Order.create(orderOptions);
        res.status(201).json({
            success: true,
            message: "Order Placed Successfully via Stripe",
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Error processing the payment",
        });
    }
});

export const paymentVerification = asyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        stripeToken,
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
        stripe_charge_id,
        stripe_customer_id,
        stripe_payment_status,
        createdAt,
    } = req.body;

    const user = req.user._id;

    const orderOptions = {
        shippingInfo,
        orderItems,
        paymentMethod: "Online",
        itemsPrice,
        taxPrice,
        shippingCharges,
        totalAmount,
        user,
        stripeToken,
    };

    // const { stripeToken, orderOptions } = req.body;

    try {
        const charge = await stripe.charges.create({
            amount: totalAmount * 100,
            currency: "usd",
            source: stripeToken,
            description: `Order #${Math.floor(Math.random() * 1000000)}`,
        });

        const payment = await Payment.create({
            stripe_charge_id,
            stripe_customer_id,
            stripe_payment_status,
        });

        if (charge.status === "succeeded") {
            await Order.create({
                ...orderOptions,
                paidAt: new Date(Date.now()),
                paymentInfo: payment._id,
            });

            res.status(201).json({
                success: true,
                message: `Order Placed Successfully. Payment ID: ${charge.id}`,
            });
        } else {
            return next(new ErrorHandler("Payment Failed", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

export const getMyOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({
        user: req.user._id,
    }).populate("user", "name");

    res.status(200).json({
        success: true,
        orders,
    });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name");

    if (!order) return next(new ErrorHandler("Invalid Order Id", 404));

    res.status(200).json({
        success: true,
        order,
    });
});

export const getAdminOrders = asyncError(async (req, res, next) => {
    const orders = await Order.find({}).populate("user", "name");

    res.status(200).json({
        success: true,
        orders,
    });
});

export const processOrder = asyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) return next(new ErrorHandler("Invalid Order Id", 404));

    if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
    else if (order.orderStatus === "Shipped") {
        order.orderStatus = "Delivered";
        order.deliveredAt = new Date(Date.now());
    } else if (order.orderStatus === "Delivered")
        return next(new ErrorHandler("Food Already Delivered", 400));

    await order.save();

    res.status(200).json({
        success: true,
        message: "Status Updated Successfully",
    });
});
