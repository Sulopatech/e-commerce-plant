// Get All Products
import { gql, useQuery } from '@apollo/client';

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        description
      }
      
    }
  }
`;