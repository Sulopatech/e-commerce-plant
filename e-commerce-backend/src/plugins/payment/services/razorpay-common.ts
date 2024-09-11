
import { PaymentMethodArgsHash } from "../types";
import * as crypto from "crypto";
const Razorpay = require('razorpay');

export function getRazorpayInstance(args: PaymentMethodArgsHash) {
    console.log(args)
    return new Razorpay({
        key_id: 'rzp_test_OvJNQL0uIV5tmb',
        key_secret: 'krXNW99MRVhujv5Us321QxLp',
      });
}


export function isChecksumVerified({
    razorpaySignature,
    razorpayOrderId,
    razorpayPaymentId,
    secretKey,
}: {
    razorpaySignature: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    secretKey: string;
}): boolean {
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");
    return generatedSignature === razorpaySignature;
}

export async function getPaymentAmountOnOrder(
    razorpayOrderId: string,
    razorpayClient: any
): Promise<number | boolean> {
    const payments = await razorpayClient.orders.fetchPayments(razorpayOrderId);
    if (Array.isArray(payments.items) || payments.items.length) {
        return +payments.items[0].amount;
    } else {
        return false;
    }
}

export function doesPaymentAmountMatch(
    amountPaidViaRazorpay: number,
    orderAmount: number
): boolean {
    return orderAmount === amountPaidViaRazorpay;
}