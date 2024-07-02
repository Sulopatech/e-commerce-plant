import { Inject, Injectable } from '@nestjs/common';
import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject, ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    CustomFieldRelationService,
    CustomerService,
    ListQueryBuilder,
    ListQueryOptions,
    ProductService,
    ProductVariantService,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    assertFound,
    Customer,
    Product as p,
    Product,
    ProductVariant,
} from '@vendure/core';
import { 
    Between, 
    Equal, 
    FindOperator, 
    FindOptionsWhere, 
    In, 
    LessThan, 
    LessThanOrEqual, 
    Like, 
    MoreThan, 
    MoreThanOrEqual
} from 'typeorm';
import { PRODUCTREVIEW_PLUGIN_OPTIONS } from '../constants';
import { ProductReview } from '../entities/product-review.entity';
import { PluginInitOptions, ReviewState } from '../types';
interface CreateProductReviewInput {
    productId: ID;
    productVariantId?: ID;
    summary: string;
    body: string;
    rating: number;
    author:Customer;
    authorLocation?: string;
    customFields?: CustomFieldsObject;
}

interface UpdateProductReviewInput {
    id: ID;
    summary?: string;
    body?: string;
    rating?: number;
    state?: ReviewState;
    response?: string;
    customFields?: CustomFieldsObject;
}


export interface ProductReviewListOptions extends ListQueryOptions<ProductReview> {
    skip?: number;
    take?: number;
    sort?: {
        id?: 'ASC' | 'DESC';
        createdAt?: 'ASC' | 'DESC';
        updatedAt?: 'ASC' | 'DESC';
        summary?: 'ASC' | 'DESC';
        rating?: 'ASC' | 'DESC';
    };
    filter?: {
        id?: { eq?: string; in?: string[] };
        createdAt?: { eq?: Date; before?: Date; after?: Date };
        updatedAt?: { eq?: Date; before?: Date; after?: Date };
        summary?: { eq?: string; contains?: string };
        body?: { contains?: string };
        rating?: { eq?: number; lt?: number; lte?: number; gt?: number; gte?: number };
        authorName?: { eq?: string; contains?: string };
        state?: { eq?: string; in?: string[] };
    };
}


@Injectable()
export class ProductReviewService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private customFieldRelationService: CustomFieldRelationService,
        private productService: ProductService,
        private productVariantService: ProductVariantService,
        private customerService: CustomerService,
        @Inject(PRODUCTREVIEW_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<ProductReview>,
        relations?: RelationPaths<ProductReview>,
    ): Promise<PaginatedList<ProductReview>> {


        return this.listQueryBuilder
            .build(ProductReview, options, {
                relations: relations ?? ['product', 'productVariant', 'author'],
                ctx,
            })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<ProductReview>,
    ): Promise<ProductReview | null> {
        return this.connection
            .getRepository(ctx, ProductReview)
            .findOne({
                where: { id },
                relations: relations ?? ['product', 'productVariant', 'author'],
            });
    }

    async create(ctx: RequestContext, input: CreateProductReviewInput): Promise<ProductReview> {
        const { productId, productVariantId, ...rest } = input;
        const product = await this.productService.findOne(ctx, productId);
        if (!product) {
            throw new Error(`Product with id ${productId} not found`);
        }

        // const custom = await this.connection.getRepository(ctx, Product).findOne({
        //     where: { id: productId },
        //     relations: {
        //         customFields: {
        //             featuredReview: true,
        //         }
        //     }
        // });
        // let reviewList=custom?.customFields.featuredReview||[]

        // Save the updated product
        await this.connection.getRepository(ctx, Product).save(product);
        // let l=product.customFields.featuredReview||[]
        // console.log(product.customFields.featuredReview)
        let productVariant = undefined;
        if (productVariantId) {
            productVariant = await this.productVariantService.findOne(ctx, productVariantId);
            if (!productVariant) {
                throw new Error(`ProductVariant with id ${productVariantId} not found`);
            }
        }

        let author = undefined;
        if (ctx.activeUserId) {
            author = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
            if(!author){
                throw new Error(`User Not Found`);
            }
        }
        else{
            throw new Error(`Please Login`);
        }

        const newReview = await this.connection.getRepository(ctx, ProductReview).save({
            ...rest,
            product,
            productVariant,
            author,
            state: 'new',
            upvotes: 0,
            downvotes: 0,
        });


        await this.customFieldRelationService.updateRelations(ctx, ProductReview, input, newReview);
        // await this.customFieldRelationService.updateRelations(ctx, p, ,product);
        await this.updateProductReviewMetrics(ctx, productId);
        

        
        return assertFound(this.findOne(ctx, newReview.id));
    }

    // async update(ctx: RequestContext, input: UpdateProductReviewInput): Promise<ProductReview> {
    //     const review = await this.connection.getEntityOrThrow(ctx, ProductReview, input.id);
    //     const updatedReview = patchEntity(review, input);
    //     await this.connection.getRepository(ctx, ProductReview).save(updatedReview, { reload: false });
    //     await this.customFieldRelationService.updateRelations(ctx, ProductReview, input, updatedReview);
    //     await this.updateProductReviewMetrics(ctx, review.product.id);
    //     return assertFound(this.findOne(ctx, updatedReview.id));
    // }
    async update(ctx: RequestContext, input: UpdateProductReviewInput): Promise<ProductReview> {
        const review = await this.connection.getEntityOrThrow(ctx, ProductReview, input.id);
        
        // Create a new object without the 'id' property
        const { id, ...updateData } = input;
        
        // Validate the state if it's provided
        if (updateData.state && !['new', 'approved', 'rejected'].includes(updateData.state)) {
            throw new Error(`Invalid state: ${updateData.state}`);
        }
        
        // Use Object.assign instead of patchEntity
        const updatedReview = Object.assign(review, updateData);
        
        await this.connection.getRepository(ctx, ProductReview).save(updatedReview, { reload: false });
        await this.customFieldRelationService.updateRelations(ctx, ProductReview, input, updatedReview);
        await this.updateProductReviewMetrics(ctx, review.product.id);
        return assertFound(this.findOne(ctx, updatedReview.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const review = await this.connection.getEntityOrThrow(ctx, ProductReview, id);
        try {
            await this.connection.getRepository(ctx, ProductReview).remove(review);
            await this.updateProductReviewMetrics(ctx, review.product.id);
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

    async getReviewsForProduct(
        ctx: RequestContext,
        productId: string | number,
        options: { skip?: number; take?: number } = {}
      ): Promise<{ items: ProductReview[]; totalItems: number }> {
        const take = options.take || 10;
        const skip = options.skip || 0;
    
        const [items, totalItems] = await this.connection
          .getRepository(ctx, ProductReview)
          .findAndCount({
            where: { product: { id: productId } },
            order: { createdAt: 'DESC' },
            take,
            skip,
          });

          const [pitems, ptotalItems]=await this.connection.getRepository(ctx,Product).findAndCount({
            where:{variants:{
                collections:{
                    id:2
                }
            }},
            
        })
        console.log("this is items",pitems)
        return {
          items,
          totalItems,
        };
    }  





    private async updateProductReviewMetrics(ctx: RequestContext, productId: ID): Promise<void> {
        const reviews = await this.connection.getRepository(ctx, ProductReview).find({
            where: { product: { id: productId } },
        });

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        await this.productService.update(ctx, {
            id: productId,
            customFields: {
                reviewRating: averageRating,
                reviewCount: reviews.length,
            },
        });
    }
    

    async findAllByProductId(
        ctx: RequestContext,
        productId: ID,
        options: ProductReviewListOptions,
        relations: RelationPaths<ProductReview> = [],
    ): Promise<PaginatedList<ProductReview>> {
        return this.listQueryBuilder
            .build(ProductReview, options, {
                relations,
                where: {
                    product: { id: productId },
                    ...(options.filter ? this.buildFilter(options.filter) : {}),
                },
                ctx,
            })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    private buildFilter(filter: ProductReviewListOptions['filter']): FindOptionsWhere<ProductReview> {
        const where: FindOptionsWhere<ProductReview> = {};
        if (filter) {
            if (filter.id?.in) {
                where.id = In(filter.id.in);
            } else if (filter.id?.eq) {
                where.id = filter.id.eq;
            }
            if (filter.createdAt) {
                where.createdAt = this.buildDateFilter(filter.createdAt);
            }
            if (filter.updatedAt) {
                where.updatedAt = this.buildDateFilter(filter.updatedAt);
            }
            if (filter.summary) {
                where.summary = filter.summary.eq ? filter.summary.eq : Like(`%${filter.summary.contains}%`);
            }
            if (filter.body) {
                where.body = Like(`%${filter.body.contains}%`);
            }
            if (filter.rating) {
                where.rating = this.buildNumberFilter(filter.rating);
            }
            if (filter.authorName) {
                where.authorName = filter.authorName.eq ? filter.authorName.eq : Like(`%${filter.authorName.contains}%`);
            }
            if (filter.state?.in) {
                where.state = In(filter.state.in as ReviewState[]);
            } else if (filter.state?.eq) {
                where.state = filter.state.eq as ReviewState;
            }
        }
        return where;
    }

    private buildDateFilter(filter: { eq?: Date; before?: Date; after?: Date }): FindOperator<Date> {
        if (filter.eq) {
            return Equal(filter.eq);
        }
        if (filter.before && filter.after) {
            return Between(filter.after, filter.before);
        }
        if (filter.before) {
            return LessThan(filter.before);
        }
        if (filter.after) {
            return MoreThan(filter.after);
        }
        throw new Error('Invalid date filter');
    }

    private buildNumberFilter(filter: { eq?: number; lt?: number; lte?: number; gt?: number; gte?: number }): FindOperator<number> {
        if (filter.eq !== undefined) {
            return Equal(filter.eq);
        }
        if (filter.lt !== undefined) {
            return LessThan(filter.lt);
        }
        if (filter.lte !== undefined) {
            return LessThanOrEqual(filter.lte);
        }
        if (filter.gt !== undefined) {
            return MoreThan(filter.gt);
        }
        if (filter.gte !== undefined) {
            return MoreThanOrEqual(filter.gte);
        }
        throw new Error('Invalid number filter');
    }
}




// import { Inject, Injectable } from '@nestjs/common';
// import { DeletionResponse, DeletionResult } from '@vendure/common/lib/generated-types';
// import { CustomFieldsObject, ID, PaginatedList } from '@vendure/common/lib/shared-types';
// import {
//     CustomFieldRelationService,
//     ListQueryBuilder,
//     ListQueryOptions,
//     RelationPaths,
//     RequestContext,
//     TransactionalConnection,
//     assertFound,
//     patchEntity
// } from '@vendure/core';
// import { PRODUCTREVIEW_PLUGIN_OPTIONS } from '../constants';
// import { ProductReview } from '../entities/product-review.entity';
// import { PluginInitOptions } from '../types';

// // These can be replaced by generated types if you set up code generation
// interface CreateProductReviewInput {
//     summary: string;
//     body: string;
//     rating: number;
//     authorName: string;
//     authorLocation: string;
//     upvotes: number;
//     downvotes: number;
//     response: string;
//     responseCreatedAt: Date;
//     // Define the input fields here
//     customFields?: CustomFieldsObject;
// }
// interface UpdateProductReviewInput {
//     id: ID;
//     summary?: string;
//     body?: string;
//     rating?: number;
//     authorName?: string;
//     authorLocation?: string;
//     upvotes?: number;
//     downvotes?: number;
//     response?: string;
//     responseCreatedAt?: Date;
//     // Define the input fields here
//     customFields?: CustomFieldsObject;
// }

// @Injectable()
// export class ProductReviewService {
//     constructor(
//         private connection: TransactionalConnection,
//         private listQueryBuilder: ListQueryBuilder,
//         private customFieldRelationService: CustomFieldRelationService, @Inject(PRODUCTREVIEW_PLUGIN_OPTIONS) private options: PluginInitOptions
//     ) {}

//     findAll(
//         ctx: RequestContext,
//         options?: ListQueryOptions<ProductReview>,
//         relations?: RelationPaths<ProductReview>,
//     ): Promise<PaginatedList<ProductReview>> {
//         return this.listQueryBuilder
//             .build(ProductReview, options, {
//                 relations,
//                 ctx,
//             }
//             ).getManyAndCount().then(([items, totalItems]) => {
//                 return {
//                     items,
//                     totalItems,
//                 }
//             }
//             );
//     }

//     findOne(
//         ctx: RequestContext,
//         id: ID,
//         relations?: RelationPaths<ProductReview>,
//     ): Promise<ProductReview | null> {
//         return this.connection
//             .getRepository(ctx, ProductReview)
//             .findOne({
//                 where: { id },
//                 relations,
//             });
//     }

//     async create(ctx: RequestContext, input: CreateProductReviewInput): Promise<ProductReview> {
//         const newEntity = await this.connection.getRepository(ctx, ProductReview).save(input);
//         await this.customFieldRelationService.updateRelations(ctx, ProductReview, input, newEntity);
//         return assertFound(this.findOne(ctx, newEntity.id));
//     }

//     async update(ctx: RequestContext, input: UpdateProductReviewInput): Promise<ProductReview> {
//         const entity = await this.connection.getEntityOrThrow(ctx, ProductReview, input.id);
//         const updatedEntity = patchEntity(entity, input);
//         await this.connection.getRepository(ctx, ProductReview).save(updatedEntity, { reload: false });
//         await this.customFieldRelationService.updateRelations(ctx, ProductReview, input, updatedEntity);
//         return assertFound(this.findOne(ctx, updatedEntity.id));
//     }

//     async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
//         const entity = await this.connection.getEntityOrThrow(ctx, ProductReview, id);
//         try {
//             await this.connection.getRepository(ctx, ProductReview).remove(entity);
//             return {
//                 result: DeletionResult.DELETED,
//             };
//         } catch (e: any) {
//             return {
//                 result: DeletionResult.NOT_DELETED,
//                 message: e.toString(),
//             };
//         }
//     }
// }
