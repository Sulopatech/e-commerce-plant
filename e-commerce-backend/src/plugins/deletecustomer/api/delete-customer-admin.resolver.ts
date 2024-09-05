import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission, DeletionResponse } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { Allow, Ctx, RequestContext, Transaction } from '@vendure/core';
import { DeleteCustomerService } from '../services/delete-customer.service';

@Resolver()
export class DeleteCustomerAdminResolver {
    constructor(private deleteCustomerService: DeleteCustomerService) {}

    @Mutation()
    @Transaction()
    async DeleteCustomerMutation(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {        
        return this.deleteCustomerService.deleteCustomerMutation(ctx, args.id);
    }
}
