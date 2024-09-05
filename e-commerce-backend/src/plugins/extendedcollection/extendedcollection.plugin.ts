import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { EXTENDEDCOLLECTION_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { CollectionService } from './services/extended-collection-plugin';
import { CollectionResolver } from './api/extended-collection-admin.resolver';
import { shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: EXTENDEDCOLLECTION_PLUGIN_OPTIONS, useFactory: () => ExtendedcollectionPlugin.options }, CollectionService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.1',
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [CollectionResolver]
    },
})
export class ExtendedcollectionPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ExtendedcollectionPlugin> {
        this.options = options;
        return ExtendedcollectionPlugin;
    }
}
