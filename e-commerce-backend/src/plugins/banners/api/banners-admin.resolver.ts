import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DeletionResponse, Permission } from '@vendure/common/lib/generated-types';
import {
    Allow,
    Asset,
    Ctx,
    ID,
    ListQueryOptions,
    PaginatedList,
    RelationPaths,
    Relations,
    RequestContext,
    Transaction
} from '@vendure/core';
import { Banners } from '../entities/banners.entity';
import { BannersService } from '../services/banners.service';

// These can be replaced by generated types if you set up code generation
interface CreateBannersInput {
    name: string;
    isActive: boolean;
    description: string;
    link: string;
    asset:Asset;
    // Define the input fields here
}
interface UpdateBannersInput {
    id: ID;
    name?: string;
    isActive?: boolean;
    description?: string;
    link?: string;
    asset:Asset;
    // Define the input fields here
}

@Resolver()
export class BannersAdminResolver {
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

    @Mutation()
    @Transaction()
    async createBanners(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreateBannersInput },
        @Args('file') file: any
    ): Promise<Banners> {
        return this.bannersService.create(ctx, args.input,file);
    }

    @Mutation()
    @Transaction()
    async updateBanners(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdateBannersInput },
    ): Promise<Banners> {
        return this.bannersService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.Authenticated)
    async deleteBanners(@Ctx() ctx: RequestContext, @Args() args: { id: ID }): Promise<DeletionResponse> {
        return this.bannersService.delete(ctx, args.id);
    }
}
