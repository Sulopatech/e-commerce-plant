import {
    Product,
    ProductVariant,
    Customer,
    DeepPartial,
    HasCustomFields,
    LocaleString,
    Translatable,
    Translation,
    VendureEntity,
} from '@vendure/core';
import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';

// import { ScaffoldTranslation } from './entity-translation.template';

import {ReviewState} from '../types' 

export class ProductReviewCustomFields {}

@Entity()
export class ProductReview extends VendureEntity implements HasCustomFields {
    constructor(input?: DeepPartial<ProductReview>) {
        super(input);
    }

    @ManyToOne(type => Product)
    product: Product;

    @ManyToOne(type => ProductVariant)
    productVariant: ProductVariant | null;

    @Column()
    summary: string;

    @Column('text')
    body: string;

    @Column()
    rating: number;

    @ManyToOne(type => Customer)
    author: Customer;

    @Column()
    authorName: string;

    @Column({ nullable: true })
    authorLocation: string;

    @Column({ default: 0 })
    upvotes: number;

    @Column({ default: 0 })
    downvotes: number;

    @Column('varchar')
    state: ReviewState;

    @Column('text', { nullable: true, default: null })
    response: string;

    @Column({ nullable: true, default: null })
    responseCreatedAt: Date;

    @Column(type => ProductReviewCustomFields)
    customFields: ProductReviewCustomFields;
}
