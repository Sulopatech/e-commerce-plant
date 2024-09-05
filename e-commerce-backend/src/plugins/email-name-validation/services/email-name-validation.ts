import { Inject, Injectable } from '@nestjs/common';
import { ID, Product, RequestContext, TransactionalConnection, UserService } from '@vendure/core';
import { EMAIL_NAME_VALIDATION_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';

@Injectable()
export class EmailNameValidation {
    constructor(
        private connection: TransactionalConnection, @Inject(EMAIL_NAME_VALIDATION_PLUGIN_OPTIONS) private options: PluginInitOptions,
        private userService: UserService,
    ) {}

    async VerifyEmailAddress(ctx: RequestContext, email: string): Promise<boolean> {
        const doesEmailExist = await this.userService.getUserByEmailAddress(ctx,email,"customer");
        return !!doesEmailExist
    }

}
