import { Inject, Injectable } from '@nestjs/common';
import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    CustomFieldRelationService,
    Customer,
    CustomerService,
    ListQueryBuilder,
    ListQueryOptions,
    ProductService,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    assertFound
} from '@vendure/core';
import { WISHLIST_PLUGIN_OPTIONS } from '../constants';

import { PluginInitOptions } from '../types';
import { WishList, WishListItem } from '../entities/wish-list.entity';



@Injectable()
export class WishListService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customFieldRelationService: CustomFieldRelationService, @Inject(WISHLIST_PLUGIN_OPTIONS) private options: PluginInitOptions,
        private customerservice:CustomerService,
        private productservice:ProductService
    ) {}

    findAll(
        ctx: RequestContext,
        customerId: ID,
        options?: ListQueryOptions<WishList>,
        relations?: RelationPaths<WishList>,
    ): Promise<WishList | null> {
        // return this.listQueryBuilder
        //     .build(WishList, options, {
        //         relations:['items', 'items.product','customer'],
        //         ctx,
        //         where:{
        //             customer:{
        //                 id:customerId
        //             }

        //         }
        //     }
        //     ).getManyAndCount().then(([items, totalItems]) => {
        //         return {
        //             items,
        //             totalItems,
        //         }
        //     }
        //     );
        return this.connection
                .getRepository(ctx, WishList)
                .findOne({
                    where: { customer:{
                        id:customerId
                    } },
                    relations: ['items', 'items.product', 'customer']
                });
    }

    findOnebycustomerID(
        ctx: RequestContext,
        customerId: ID,
        relations?: RelationPaths<WishList>,
    ): Promise<WishList | null> {
        return this.connection
            .getRepository(ctx, WishList)
            .findOne({
                where: { customer:{
                        id:customerId
                    } },
                relations: ['items', 'items.product', 'customer']
            });
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<WishList>,
    ): Promise<WishList | null> {
        return this.connection
            .getRepository(ctx, WishList)
            .findOne({
                where: { id },
                relations: ['items', 'items.product', 'customer']
            });
    }

    
        
    async createWishList(ctx: RequestContext, customer: Customer): Promise<WishList> {
                
        const wishList = new WishList({
                customer
            });

        let saved_wishlist =await this.connection.getRepository(ctx, WishList).save(wishList)

        return assertFound(this.findOne(ctx, saved_wishlist.id));
            
    }


    async addToWishList(ctx: RequestContext, customerId: ID, productId: ID): Promise<WishList> {
        
        let wishList = await this.findOnebycustomerID(ctx,customerId)
        
        if (!wishList) {
            const customer = await this.customerservice.findOne(ctx, customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }
            wishList = await this.createWishList(ctx, customer);
        }

        if (wishList.items){
            const existingItem = wishList.items.find(item => item.product?.id === productId);
            if (existingItem) {
                // Product already in wishlist
                return wishList;
            }
        } else{
            wishList.items = [];
        }

        const product = await this.productservice.findOne(ctx, productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const wishListItem = new WishListItem({
            wishList,
            product,
        });

        let saved_wishListItem = await this.connection.getRepository(ctx,WishListItem).save(wishListItem)
        wishList.items.push(saved_wishListItem);

        await this.connection.getRepository(ctx,WishList).save(wishList)

        return assertFound(this.findOne(ctx,wishList.id))
    }

    async removeFromWishList(ctx: RequestContext, customerId: ID, productId: ID): Promise<WishList> {
        const wishList = await this.findOnebycustomerID(ctx,customerId)
            if (!wishList) {
                throw new Error('WishList not found');
            }
            let deleteWishlist = wishList.items.filter(item => item.product.id == productId)
            
            wishList.items = wishList.items.filter(item => item.product.id !== productId);
            
            await this.connection.getRepository(ctx,WishList).save(wishList)
            await this.connection.getRepository(ctx,WishListItem).delete(deleteWishlist[0].id)
            return assertFound(this.findOne(ctx, wishList.id))
        }

    async clearWishList(ctx: RequestContext, customerId: ID): Promise<WishList> {
        const wishList = await this.findOnebycustomerID(ctx,customerId)

        if (!wishList) {
            throw new Error('WishList not found');
        }
        let list = wishList.items.map(items => items.id.toString())
        await this.connection.getRepository(ctx,WishListItem).delete(list)
        wishList.items = [];
        await this.connection.getRepository(ctx,WishList).save(wishList)
        return assertFound(this.findOne(ctx, wishList.id))
    }
}
