import { Injectable, Inject } from '@nestjs/common';
import { 
    TransactionalConnection, 
    RequestContext, 
    ID, 
    CustomerService, 
    Order, 
    User,
    EntityNotFoundError,
    UserService,
    OrderService,
    isGraphQlErrorResult,
} from '@vendure/core';
import { DELETECUSTOMER_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';

@Injectable()
export class DeleteCustomerService {
    constructor(
        private connection: TransactionalConnection,
        private customerService: CustomerService,
        private userService: UserService,
        private orderService: OrderService,
        @Inject(DELETECUSTOMER_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    async deleteCustomerMutation(ctx: RequestContext, id: ID): Promise<boolean> {
        

        let customer = undefined;
        if (ctx.activeUserId) {
            customer  = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
            console.log(customer)
            if (!customer) {
                throw new Error('CustomerNotFound');
            }
        }
        else{
            throw new Error(`Please Login`);
        }

        

        // Check if the customer has any orders
        const orders = await this.orderService.findByCustomerId(ctx, customer.id);
        console.log(orders)
        if (orders.totalItems > 0 && !this.options.allowDeleteWithOrders) {
            throw new Error('Cannot delete customer with existing orders');
        }

        

        // Delete the customer
        const deleteResult = await this.customerService.softDelete(ctx, customer.id);
        console.log(deleteResult)
        if (isGraphQlErrorResult(deleteResult)) {
            throw new Error(`Failed to delete customer: ${deleteResult}`);
        }

        // Delete associated user if it exists
        if (customer.user) {
            console.log(customer.user)
            const deleteUserResult = await this.userService.softDelete(ctx, customer.user.id);
            console.log(deleteUserResult)
            if (isGraphQlErrorResult(deleteUserResult)) {
                throw new Error(`Failed to delete associated user: ${deleteUserResult}`);
            }
        }

        return true;
    }

}