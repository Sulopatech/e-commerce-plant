import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { Permission } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject } from '@vendure/common/lib/shared-types';
import {
    Allow,
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction
} from '@vendure/core';
import { WishList } from '../entities/wish-list.entity';
import { WishListService } from '../services/wish-list.service';


@Resolver()
export class WishListAdminResolver {
    constructor(private wishListService: WishListService) {}

    @Query()
    @Allow(Permission.Authenticated)
    async wishLists(
        @Ctx() ctx: RequestContext,
        @Args() args: { customerId: ID, options: ListQueryOptions<WishList> },
        @Relations(WishList) relations: RelationPaths<WishList>,
    ): Promise<WishList | null> {
        return this.wishListService.findOnebycustomerID(ctx, args.customerId);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async addToWishList(
        @Ctx() ctx: RequestContext,
        @Args() args: { customerId: ID, productId: ID },
    ): Promise<WishList> {
        return this.wishListService.addToWishList(ctx, args.customerId, args.productId);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async removeFromWishList(
        @Ctx() ctx: RequestContext,
        @Args() args: { customerId: ID, productId: ID },
    ): Promise<WishList> {
        return this.wishListService.removeFromWishList(ctx, args.customerId, args.productId);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Public)
    async clearWishList(
        @Ctx() ctx: RequestContext,
        @Args() args: { customerId: ID, productId: ID },
    ): Promise<WishList> {
        return this.wishListService.clearWishList(ctx, args.customerId);
    }
}
