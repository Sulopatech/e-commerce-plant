import gql from 'graphql-tag';

const bannersAdminApiExtensions = gql`
  type Banners implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    isActive: Boolean!
    description: String!
    link: String!
    bannerfile:Asset!
  }

  type BannersList implements PaginatedList {
    items: [Banners!]!
    totalItems: Int!
  }

  # Generated at run-time by Vendure
  input BannersListOptions

  extend type Query {
    banner(id: ID!): Banners
    banners(options: BannersListOptions): BannersList!
  }

  input CreateBannersInput {
    name: String!
    isActive: Boolean!
    description: String!
    link: String!
  }

  input UpdateBannersInput {
    id: ID!
    name: String
    isActive: Boolean
    description: String
    link: String
  }

  extend type Mutation {
    createBanners(input: CreateBannersInput!, file: Upload!): Banners!
    updateBanners(input: UpdateBannersInput!, file: Upload): Banners!
    deleteBanners(id: ID!): DeletionResponse!
  }
`;
export const adminApiExtensions = gql`
  ${bannersAdminApiExtensions}
`;

export const shopApiExtensions = gql`
  type Banners implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    name: String!
    isActive: Boolean!
    description: String!
    link: String!
  }

  type BannersList implements PaginatedList {
    items: [Banners!]!
    totalItems: Int!
  }

  # Generated at run-time by Vendure
  input BannersListOptions

  extend type Query {
    banner(id: ID!): Banners
    banners(options: BannersListOptions): BannersList!
  }
`;