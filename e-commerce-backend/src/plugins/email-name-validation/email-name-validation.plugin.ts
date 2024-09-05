import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { EMAIL_NAME_VALIDATION_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { EmailNameValidation } from './services/email-name-validation';
import { EmailNameValidationAdminResolver } from './api/email-name-validation-admin.resolver';
import { shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: EMAIL_NAME_VALIDATION_PLUGIN_OPTIONS, useFactory: () => EmailNameValidationPlugin.options }, EmailNameValidation],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [EmailNameValidationAdminResolver]
    },
})
export class EmailNameValidationPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<EmailNameValidationPlugin> {
        this.options = options;
        return EmailNameValidationPlugin;
    }
}
