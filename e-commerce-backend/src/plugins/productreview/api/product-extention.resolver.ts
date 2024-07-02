import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Product } from '@vendure/core';
import { ProductReviewService } from '../services/product-review.service';

@Resolver('Product')
export class ProductEntityResolver {
  constructor(private productReviewService: ProductReviewService) {}

  @ResolveField()
  async reviews(@Ctx() ctx: RequestContext, @Parent() product: Product) {
    return this.productReviewService.getReviewsForProduct(ctx, product.id);
  }
}