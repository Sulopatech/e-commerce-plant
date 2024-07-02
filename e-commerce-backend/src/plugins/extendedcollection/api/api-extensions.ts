import gql from 'graphql-tag';

const extendedCollectionshopApiExtensions = gql`


  type FilteredProductList implements PaginatedList {
    items: [Product!]!
    totalItems: Int!
  }



  extend type Collection {
      FilteredProduct: FilteredProductList!
  }

`;
export const shopApiExtensions = gql`
  ${extendedCollectionshopApiExtensions}
`;
