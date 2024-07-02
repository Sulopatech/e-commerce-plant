import { Inject, Injectable } from '@nestjs/common';
import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    Asset,
    ListQueryBuilder,
    ListQueryOptions,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    assertFound,
    patchEntity
} from '@vendure/core';
import { BANNERS_PLUGIN_OPTIONS } from '../constants';
import { Banners } from '../entities/banners.entity';
import { PluginInitOptions } from '../types';

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

@Injectable()
export class BannersService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder, @Inject(BANNERS_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Banners>,
        relations?: RelationPaths<Banners>,
    ): Promise<PaginatedList<Banners>> {
        return this.listQueryBuilder
            .build(Banners, options, {
                relations,
                ctx,
            }
            ).getManyAndCount().then(([items, totalItems]) => {
                return {
                    items,
                    totalItems,
                }
            }
            );
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<Banners>,
    ): Promise<Banners | null> {
        return this.connection
            .getRepository(ctx, Banners)
            .findOne({
                where: { id },
                relations,
            });
    }

    async create(ctx: RequestContext, input: CreateBannersInput): Promise<Banners> {
        const newEntity = await this.connection.getRepository(ctx, Banners).save(input);
        return assertFound(this.findOne(ctx, newEntity.id));
    }

    async update(ctx: RequestContext, input: UpdateBannersInput): Promise<Banners> {
        const entity = await this.connection.getEntityOrThrow(ctx, Banners, input.id);
        const updatedEntity = patchEntity(entity, input);
        await this.connection.getRepository(ctx, Banners).save(updatedEntity, { reload: false });
        return assertFound(this.findOne(ctx, updatedEntity.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, Banners, id);
        try {
            await this.connection.getRepository(ctx, Banners).remove(entity);
            return {
                result: DeletionResult.DELETED,
            };
        } catch (e: any) {
            return {
                result: DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }
}
