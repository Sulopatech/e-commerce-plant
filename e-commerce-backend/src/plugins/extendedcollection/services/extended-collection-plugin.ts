import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  Collection,
  Product,
  ProductVariant,
  ListQueryBuilder,
  ListQueryOptions,
} from '@vendure/core';``
import { ProductList } from '../gql/generated';

@Injectable()
export class CollectionService {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder
  ) {}

  async getProductListForCollection(
    ctx: RequestContext,
    collectionId: string | number,
    options?: ListQueryOptions<Product>
  ): Promise<{ items: Product[]; totalItems: number }> {
    // console.log(options)
    // const [items, totalItems]=await this.connection.getRepository(ctx,Product).findAndCount({  
    //   where:{variants:{
    //         collections:{
    //             id:collectionId
    //         }
    //     }},
    // })
    // const [p,c] = await this.connection
    //   .getRepository(ctx, Product)
    //   .createQueryBuilder('product')
    //   .leftJoinAndSelect('product.variants', 'variant')
    //   .leftJoinAndSelect('variant.collections', 'collection')
    //   .where('collection.id = :collectionId', { collectionId }).getManyAndCount();

 
    const [items,totalItems]=await this.listQueryBuilder.build(Product, options || {}, {
      where:{variants:{
        collections:{
            id:collectionId
        }
      }},
      relations:[],
      channelId: ctx.channelId,
      ctx: ctx,
    }).getManyAndCount();
    console.log(items)
    return {
      items,
      totalItems,
    };
  }
}