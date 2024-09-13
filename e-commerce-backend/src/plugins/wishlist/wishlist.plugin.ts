import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { WISHLIST_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { WishList, WishListItem } from './entities/wish-list.entity';
import { WishListService } from './services/wish-list.service';
import { WishListAdminResolver } from './api/wish-list-admin.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: WISHLIST_PLUGIN_OPTIONS, useFactory: () => WishlistPlugin.options }, WishListService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
    entities: [WishList, WishListItem],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [WishListAdminResolver]
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [WishListAdminResolver]
    },
})
export class WishlistPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<WishlistPlugin> {
        this.options = options;
        return WishlistPlugin;
    }
}
