import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  Collection,
  Product,
  ProductVariant,
  ListQueryBuilder,
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
    args: any
  ): Promise<{ items: Product[]; totalItems: number }> {
    console.log(collectionId)
    const [items, totalItems]=await this.connection.getRepository(ctx,Product).findAndCount({
        where:{variants:{
            collections:{
                id:collectionId
            }
        }
        
    },

    })
    return {
      items,
      totalItems,
    };
  }
}