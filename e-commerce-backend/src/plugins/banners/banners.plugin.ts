import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { BANNERS_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { Banners } from './entities/banners.entity';
import { BannersService } from './services/banners.service';
import { BannersAdminResolver } from './api/banners-admin.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { BannersShopResolver } from './api/banners-shop.resolver';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: BANNERS_PLUGIN_OPTIONS, useFactory: () => BannersPlugin.options }, BannersService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.1',
    entities: [Banners],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [BannersAdminResolver]
    },
    shopApiExtensions:{
        schema:shopApiExtensions,
        resolvers:[BannersShopResolver]
    }
})
export class BannersPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<BannersPlugin> {
        this.options = options;
        return BannersPlugin;
    }
}
