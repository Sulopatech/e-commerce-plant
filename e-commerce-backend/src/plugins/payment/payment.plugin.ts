import { LanguageCode, PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { PAYMENT_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { RazorPayService } from './services/razor-pay';
import { RazorPayAdminResolver } from './api/razor-pay-admin.resolver';
import { adminApiExtensions,shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: PAYMENT_PLUGIN_OPTIONS, useFactory: () => PaymentPlugin.options }, RazorPayService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.

        config.customFields.Order.push({
            name: 'razorpay_order_id',
            label: [{ languageCode: LanguageCode.en, value: 'Razorpay Order ID' }],
            public: true,
            nullable: true,
            type:'string',
        })
        return config;
    },
    compatibility: '^3.0.0',
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [RazorPayAdminResolver]
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [RazorPayAdminResolver]
    },
})
export class PaymentPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<PaymentPlugin> {
        this.options = options;
        return PaymentPlugin;
    }
}
