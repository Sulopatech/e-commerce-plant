import { gql } from '@apollo/client';

export const GET_ALL_PRODUCTS = gql`
    query GetProducts($options: ProductListOptions) {
        products(options: $options) {
            items {
                id
                name
                slug
                featuredAsset {
                    preview
                }
            }
            totalItems
        }
    }
`;
