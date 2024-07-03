import { gql } from '@apollo/client';

export const GET_ALL_PRODUCTS = (prodSlug) => gql`
 query {
        product(slug: "${prodSlug}") {
          id
          name
          slug
          featuredAsset {
            preview
            id
            createdAt
          }
          __typename
          description
          createdAt
          variants {
            id
            name
            priceWithTax
            price
            taxCategory {
              id
              name
            }
            taxRateApplied {
              name
            }
          }
        }
        activeOrder{
            totalQuantity
          }
      }
`;