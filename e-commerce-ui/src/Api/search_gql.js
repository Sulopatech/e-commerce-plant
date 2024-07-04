import { gql } from "@apollo/client";
export const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $term: String
    $facetValueFilters: [FacetValueFilterInput!]
    $collectionId: ID
    $collectionSlug: String
    $groupByProduct: Boolean
    $take: Int
    $skip: Int
    $sort: SearchResultSortParameter
    $inStock: Boolean
  ) {
    search(input: {
      term: $term
      facetValueFilters: $facetValueFilters
      collectionId: $collectionId
      collectionSlug: $collectionSlug
      groupByProduct: $groupByProduct
      take: $take
      skip: $skip
      sort: $sort
      inStock: $inStock
    }) {
      totalItems
    }
  }
`;