import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '@vendure/common/lib/generated-types';
import {
    Allow,
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
} from '@vendure/core';
import { Banners } from '../entities/banners.entity';
import { BannersService } from '../services/banners.service';


@Resolver()
export class BannersShopResolver {
    constructor(private bannersService: BannersService) {}

    @Query()
    @Allow(Permission.Authenticated)
    async banner(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID },
        @Relations(Banners) relations: RelationPaths<Banners>,
    ): Promise<Banners | null> {
        return this.bannersService.findOne(ctx, args.id, relations);
    }

    @Query()
    @Allow(Permission.Authenticated)
    async banners(
        @Ctx() ctx: RequestContext,
        @Args() args: { options: ListQueryOptions<Banners> },
        @Relations(Banners) relations: RelationPaths<Banners>,
    ): Promise<PaginatedList<Banners>> {
        return this.bannersService.findAll(ctx, args.options || undefined, relations);
    }
}
