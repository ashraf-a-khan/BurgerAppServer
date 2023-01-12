import mongoose from "mongoose";

const schema = new mongoose.Schema({
    stripe_charge_id: {
        type: String,
        required: true,
    },
    stripe_customer_id: {
        type: String,
        required: true,
    },
    stripe_payment_status: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Payment = mongoose.model("Payment", schema);
