import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Permission } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { Allow, Ctx, ErrorResult, RequestContext, Transaction } from '@vendure/core';
import { RazorPayService } from '../services/razor-pay';
import { successResponse } from '../types';

@Resolver()
export class RazorPayAdminResolver {
    constructor(private razorPayService: RazorPayService) {}

    @Mutation()
    @Transaction()
    @Allow(Permission.Authenticated)
    async generateRazorpayOrderId(
        @Ctx() ctx: RequestContext, 
        @Args() args: { orderId: ID }
    ): Promise< successResponse | ErrorResult> {

        return this.razorPayService.generateRazorpayOrderId(ctx, args.orderId);
    
    }
}
