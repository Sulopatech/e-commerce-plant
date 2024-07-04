import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { DELETECUSTOMER_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { DeleteCustomerService } from './services/delete-customer.service';
import { DeleteCustomerAdminResolver } from './api/delete-customer-admin.resolver';
import { shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: DELETECUSTOMER_PLUGIN_OPTIONS, useFactory: () => DeletecustomerPlugin.options }, DeleteCustomerService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^2.0.0',

    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [DeleteCustomerAdminResolver]
    },
})
export class DeletecustomerPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<DeletecustomerPlugin> {
        this.options = options;
        return DeletecustomerPlugin;
    }
}
