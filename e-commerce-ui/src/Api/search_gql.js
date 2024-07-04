import { gql } from '@apollo/client';

export const SEARCH_QUERY = gql`
  query Search($term: String!) {
    search(input: { term: $term }) {
      items {
        __typename
        productVariantName
        productName
        productAsset{
          id
          preview
        }
      }
    }
}
`;
