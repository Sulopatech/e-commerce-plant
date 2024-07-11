import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
query Query($options: ProductListOptions) {
  products(options: $options) {
    items {
      id
      name
      description
      variantList{
        items{
          id
          name
          price
        }
      }
      assets {
        preview
        source
      }
    }
  }
}
`;