import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '@vendure/common/lib/generated-types';
import { ID } from '@vendure/common/lib/shared-types';
import { Allow, Ctx, RequestContext } from '@vendure/core';
import { EmailNameValidation } from '../services/email-name-validation';

@Resolver()
export class EmailNameValidationAdminResolver {
    constructor(private emailNameValidation: EmailNameValidation) {}

    @Query()
    @Allow(Permission.Public)
    async VerifyEmailAddress(@Ctx() ctx: RequestContext, @Args() args: { email: string }): Promise<boolean> {
        return this.emailNameValidation.VerifyEmailAddress(ctx, args.email);
    }
}
