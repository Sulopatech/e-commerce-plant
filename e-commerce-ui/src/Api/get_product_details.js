import { gql } from '@apollo/client';

export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      variants {
        id
        name
        sku
        stockLevel
        currencyCode
        price
        priceWithTax
        featuredAsset {
          id
          preview
        }
        assets {
          id
          preview
        }
      }
    }
  }
`;
