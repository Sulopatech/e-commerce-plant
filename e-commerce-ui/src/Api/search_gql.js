import { gql } from '@apollo/client';

// Define your GraphQL query using gql
export const SEARCH_QUERY = gql`
  query Search($input: SearchInput!) {
    search(input: $input) {
      collections {
        collection {
          id
          name
        }
      }
      items {
        collectionIds
        productId
        productName
        productAsset {
          id
          preview
        }
      }
    }
  }
`;