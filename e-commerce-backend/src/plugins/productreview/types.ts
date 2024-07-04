/**
 * @description
 * The plugin can be configured using the following options:
 */
export interface PluginInitOptions {
    exampleOption?: string;
}

export type ReviewState = 'new' | 'approved' | 'rejected';

import { ProductReview } from './entities/product-review.entity';



declare module '@vendure/core' {
    interface CustomProductFields {
        reviewCount: number;
        reviewRating: number;
        featuredReview?: ProductReview;
    }
}