import { Args, Mutation, Query, Resolver,ResolveField , Parent} from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import {
    Allow,
    Ctx,
    ID,
    Product,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction,
    Customer
} from '@vendure/core';
import { ProductReview as Review } from '../entities/product-review.entity';
import { ProductReviewService,ProductReviewListOptions } from '../services/product-review.service';
import {ReviewState } from '../types';


interface CreateProductReviewInput {
    productId: ID;
    productVariantId?: ID;
    summary: string;
    body: string;
    rating: number;
    author:Customer
    authorLocation?: string;
    customFields?: CustomFieldsObject;
}

interface UpdateProductReviewInput {
    id: ID;
    summary?: string;
    body?: string;
    rating?: number;
    authorLocation?: string;
    upvotes?: number;
    downvotes?: number;
    state?: ReviewState;
    response?: string;
    responseCreatedAt?: Date;
    customFields?: CustomFieldsObject;
}
@Resolver()
export class ProductReviewAdminResolver {
    constructor(private productReviewService: ProductReviewService) {}

    @Query()
    @Allow(Permission.ReadCatalog)
    async ProductReview(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(Review) relations: RelationPaths<Review>,
    ): Promise<Review | null> {
        return this.productReviewService.findOne(ctx, args.id, relations);
    }

    @Query()
    @Allow(Permission.ReadCatalog)
    async ProductReviews(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ProductReviewListOptions },
        @Relations(Review) relations: RelationPaths<Review>,
    ): Promise<PaginatedList<Review>> {
        return this.productReviewService.findAll(ctx, args.options, relations);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.UpdateCatalog)
    async updateProductReview(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateProductReviewInput },
    ): Promise<Review> {
        return this.productReviewService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.DeleteCatalog)
    async deleteProductReview(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID }
    ): Promise<DeletionResponse> {
        return this.productReviewService.delete(ctx, args.id);
    }
}

@Resolver()
export class ProductReviewShopResolver {
    constructor(private productReviewService: ProductReviewService) {}

    @Query()
    async ProductReview(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(Review) relations: RelationPaths<Review>,
    ): Promise<Review | null> {
        return this.productReviewService.findOne(ctx, args.id, relations);
    }

    @Query()
    async ProductReviews(
        @Ctx() ctx: RequestContext,
        @Args() args: { productId: ID, options: ProductReviewListOptions },
        @Relations(Review) relations: RelationPaths<Review>,
    ): Promise<PaginatedList<Review>> {
        return this.productReviewService.findAllByProductId(ctx, args.productId, args.options, relations);
    }

    @Mutation()
    @Transaction()
    async createProductReview(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateProductReviewInput },
    ): Promise<Review> {
        return this.productReviewService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    async updateProductReview(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateProductReviewInput },
    ): Promise<Review> {
        return this.productReviewService.update(ctx, args.input);
    }
}


