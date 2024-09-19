import {
    CancelPaymentResult,
    CancelPaymentErrorResult,
    PaymentMethodHandler,
    VendureConfig,
    CreatePaymentResult,
    SettlePaymentResult,
    SettlePaymentErrorResult,
    LanguageCode
} from '@vendure/core';
import { doesPaymentAmountMatch, getPaymentAmountOnOrder, getRazorpayInstance, isChecksumVerified } from './services/razorpay-common';

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_OvJNQL0uIV5tmb',
  key_secret: 'krXNW99MRVhujv5Us321QxLp',
});


/**
 * This is a handler which integrates Vendure with an imaginary
 * payment provider, who provide a Node SDK which we use to
 * interact with their APIs.
 */
export const razorpayPaymentMethodHandler = new PaymentMethodHandler({
    code: 'razorpay',
    description: [{ languageCode: LanguageCode.en, value: 'Razorpay' }],
    args: {
        key_id: { type: 'string' },
        key_secret: { type: 'string' },
    },

    /**
     * Step 1: Create Payment (Authorization Phase)
     * Called when `addPaymentToOrder` mutation is executed
     */
    createPayment: async (ctx, order, amount, args, metadata): Promise<CreatePaymentResult> => {
        try {

            // Getting razorpayOrderid stored for current vendure order.
            const razorpayOrderId = (order?.customFields as any).razorpay_order_id;

            // metadata = JSON.parse(metadata as any);
            
            const { razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = metadata;

            /*
            * Verifies if checksum sent by razorpay matches to the one generated by us.
            * IMPORTANT: Must not use orderId sent by razorpay. Use the razorpay order id saved
            * for current order only. Using order id sent by razorpay may result into undesired
            * but successful checksum verification in case user sends an old orderId, transactionId,
            * signature which should not happen.
            * */
            if (
                !isChecksumVerified({
                    razorpayOrderId,
                    razorpaySignature,
                    razorpayPaymentId,
                    secretKey: args.key_secret,
                })
            ) {
                return {
                    amount: amount,
                    state: "Declined" as const,
                    transactionId: razorpayPaymentId,
                    errorMessage: "SIGNATURE MISMATCH",
                    metadata
                };
            }

            const client = await getRazorpayInstance(args);
            // Get payment amount of transaction done against current order.
            const razorpayPaymentAmount = await getPaymentAmountOnOrder(
                razorpayOrderId,
                client
            );
            if (!razorpayPaymentAmount) {
                return {
                    amount: amount,
                    state: "Declined" as const,
                    transactionId: razorpayPaymentId,
                    errorMessage: "NO PAYMENT FOUND FOR GIVEN ORDER ID",
                    metadata
                };
            }
            
            // Check if user has paid required or lesser amount than the order amount.
            if (
                doesPaymentAmountMatch(razorpayPaymentAmount as number, +amount)
            ) {
                // All checks have passed. This is a legit payment. Save payment result
                // which updates orderState to "paymentSettled"
                return {
                    amount: amount,
                    state: "Settled" as const,
                    transactionId: razorpayPaymentId,
                    metadata
                };
            } else {
                return {
                    amount: amount,
                    state: "Declined" as const,
                    transactionId: razorpayPaymentId,
                    errorMessage: "AMOUNT MISMATCH",
                    metadata
                };
            }
        } catch (err) {
            return {
                amount: order.totalWithTax,
                state: 'Declined' as const,
                metadata: {
                    errorMessage: String(err).toString(),
                },
            };
        }
    },

    /**
     * Step 2: Settle Payment (Capture Phase)
     * Called when `settlePayment` mutation is executed
     */
    settlePayment: async (ctx, order, payment, args): Promise<SettlePaymentResult | SettlePaymentErrorResult> => {
        try {
            // Fetch payment details from Razorpay using transactionId
            const paymentDetails = payment;
            
            let metadata = JSON.parse(paymentDetails.metadata as any);
            
            const { razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = metadata;

            // Check if payment was successful
            if (paymentDetails.state.toString() === 'Authorized') {
                console.log("paymentDetails",paymentDetails)
                // Capture the payment
                const captureResponse = await instance.payments.capture(razorpayPaymentId, paymentDetails.amount, "INR");
                console.log("settlepayment",captureResponse)
                return {
                    success: true,
                };
            } else {
                return {
                    success: false,
                    errorMessage: 'Payment is not authorized for capture',
                };
            }
        } catch (err) {
            console.log(err)
            return {
                success: false,
                errorMessage: "Some error see the console",
            };
        }
    },

    /**
     * Step 3: Cancel Payment
     * Called when a payment is cancelled
     */
    cancelPayment: async (ctx, order, payment, args): Promise<CancelPaymentResult | CancelPaymentErrorResult> => {
        try {
            const refundResponse = await instance.payments.refund(payment.transactionId, {
                amount: payment.amount,
            });
            console.log("refund",refundResponse)
            return {
                success: true,
            };
        } catch (err) {
            return {
                success: false,
                errorMessage: String(err).toString(),
            };
        }
    },
});