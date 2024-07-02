import { Args, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, Product, RequestContext } from '@vendure/core';
import { Collection } from '@vendure/core';
import { ProductList } from '../gql/generated';
import { CollectionService } from '../services/extended-collection-plugin';

@Resolver('Collection')
export class CollectionResolver {
  constructor(private collectionService: CollectionService) {}

  @ResolveField()
  async FilteredProduct(
    @Ctx() ctx: RequestContext,
    @Parent() collection: Collection,
    @Args() args: any
  ): Promise<{ items: Product[]; totalItems: number }> {
    return this.collectionService.getProductListForCollection(ctx, collection.id, args);
  }
}
