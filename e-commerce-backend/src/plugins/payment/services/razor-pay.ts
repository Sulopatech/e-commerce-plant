import { Inject, Injectable } from '@nestjs/common';
import { ErrorResult, ID, InternalServerError, Logger, OrderService, PaymentMethod, RequestContext, TransactionalConnection } from '@vendure/core';
import { PAYMENT_PLUGIN_OPTIONS, loggerCtx } from '../constants';
import { razorpayPaymentMethodHandler } from '../my-payment-handler';
import { PaymentMethodArgsHash, PluginInitOptions, RazorpayOrderResult, successResponse } from '../types';
import { getRazorpayInstance } from './razorpay-common';





@Injectable()
export class RazorPayService {
    constructor(
        private connection: TransactionalConnection, 
        private orderService: OrderService,
        @Inject(PAYMENT_PLUGIN_OPTIONS) private options: PluginInitOptions) {}

    async generateRazorpayOrderId(
        ctx: RequestContext,
        orderId: ID 
    ) :Promise<successResponse | ErrorResult >{

        const order = await this.orderService.findOne(ctx, orderId);

        // Proceed only if current order exists.
        if (order && order.customer) {
            // Prevent user from generating orderIds if order state is not ArrangingPayment
            if (order.state !== 'ArrangingPayment') {
                return {
                    __typename: "RazorpayOrderIdGenerationError",
                    errorCode: "INVALID_ORDER_STATE_ERROR",
                    message: 'The order must be in "ArrangingPayment" state in order to generate Razorpay OrderId for it',
                };
            }

            const args = await this.getPaymentMethodArgs(ctx);
            const razorpayClient = getRazorpayInstance(args);
            try {
                const razorPayOrder = await this.createRazorpayOrder(
                    razorpayClient,
                    {
                        amount: order.totalWithTax,
                        currency: "INR",
                    }
                );
                console.log(razorPayOrder)
                // Update "customFieldsRazorpay_order_id" field with generated razorpay order id
                let save = await this.orderService.updateCustomFields(
                    ctx,
                    orderId,
                    { razorpay_order_id: razorPayOrder.id }
                );
                if (save?.id) {

                    return {
                        __typename: "RazorpayOrderIdSuccess",
                        razorpayOrderId:razorPayOrder.id,
                    };
                }
            } catch (e) {
                console.log(e)
                const errorMessage = this.getErrorMessage(e);
                Logger.error(errorMessage, loggerCtx);
            }
        }
        return {
            __typename: "RazorpayOrderIdGenerationError",
            errorCode: "VENDURE_ORDER_ID_NOT_FOUND_ERROR",
            message: "The order id you have provided is invalid",
        };
    }
    
    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        } else if (typeof error === 'string') {
            return error;
        } else {
            return 'An unknown error occurred';
        }
    }

    private async getPaymentMethodArgs(
        ctx: RequestContext
    ): Promise<PaymentMethodArgsHash> {
        const method = await this.connection
            .getRepository(ctx, PaymentMethod)
            .findOne({
                where: {
                    code: razorpayPaymentMethodHandler.code,
                },
            });
        if (!method) {
            throw new InternalServerError(
                `[${loggerCtx}] Could not find Razorpay PaymentMethod`
            );
        }
        return method.handler.args.reduce((hash, arg) => {
            return {
                ...hash,
                [arg.name]: arg.value,
            };
        }, {} as PaymentMethodArgsHash);
    }
    
    private createRazorpayOrder(
        razorpayClient: any,
        orderArgs?: any
    ): Promise<RazorpayOrderResult> {
        if (!orderArgs.amount) {
            return Promise.reject("Required Argument Missing: Amount");
        }
        return new Promise((resolve, reject) => {
            razorpayClient.orders.create(
                orderArgs,
                (err: any, order: RazorpayOrderResult) => {
                    if (err) reject(err);
                    resolve(order);
                }
            );
        });
    }

}
