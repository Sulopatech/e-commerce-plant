import gql from 'graphql-tag';

const wishListApiExtensions = gql`
  type WishList {
    id: ID!
    customer: Customer!
    items: [WishListItem!]!
  }

  type WishListItem {
    id: ID!
    product: Product!
  }

  extend type Query {
    wishLists(customerId: ID!): WishList
  }

  extend type Mutation {
    addToWishList(customerId: ID!, productId: ID!): WishList!
    removeFromWishList(customerId: ID!, productId: ID!): WishList!
    clearWishList(customerId: ID!): WishList!
  }

`;
export const adminApiExtensions = gql`
  ${wishListApiExtensions}
`;

export const shopApiExtensions = gql`
  ${wishListApiExtensions}
`;
