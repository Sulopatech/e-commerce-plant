import { LanguageCode, PluginCommonModule, Type, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import gql from 'graphql-tag';
import * as path from 'path';
import { ProductReviewAdminResolver, ProductReviewShopResolver } from './api/product-review-admin.resolver';
import { PRODUCTREVIEW_PLUGIN_OPTIONS } from './constants';
import { ProductReview } from './entities/product-review.entity';
import { ProductReviewService } from './services/product-review.service';
import { PluginInitOptions } from './types';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { ProductEntityResolver } from './api/product-extention.resolver';
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: PRODUCTREVIEW_PLUGIN_OPTIONS, useFactory: () => ProductreviewPlugin.options }, ProductReviewService],
    configuration: config => {
        config.customFields.Product.push({
            name: 'reviewRating',
            label: [{ languageCode: LanguageCode.en, value: 'Review rating' }],
            public: true,
            nullable: true,
            type: 'float',
            ui: { tab: 'Reviews', component: 'star-rating-form-input' },
        });
        config.customFields.Product.push({
            name: 'reviewCount',
            label: [{ languageCode: LanguageCode.en, value: 'Review count' }],
            public: true,
            defaultValue: 0,
            type: 'float',
            ui: { tab: 'Reviews', component: 'review-count-link' },
        });
        config.customFields.Product.push({
            name: 'productReview',
            label: [{ languageCode: LanguageCode.en, value: 'Featured review' }],
            public: true,
            type: 'relation',
            list: true,
            nullable: true,
            entity: ProductReview,
            ui: { tab: 'Reviews', component: 'review-selector-form-input' },
        });
        return config;
    },
    compatibility: '^2.0.0',
    entities: [ProductReview],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [ProductReviewAdminResolver,ProductEntityResolver],
    },
    shopApiExtensions:{
        schema:shopApiExtensions,
    resolvers: [ProductReviewShopResolver,ProductEntityResolver,]
},
}
)
export class ProductreviewPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<ProductreviewPlugin> {
        this.options = options;
        return ProductreviewPlugin;
    }

    static ui: AdminUiExtension = {
        id: 'productreview-ui',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'productreview', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
