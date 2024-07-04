import gql from 'graphql-tag';


export const adminApiExtensions = gql`
type ProductReview implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    product: Product!
    productVariant: ProductVariant
    summary: String!
    body: String!
    rating: Int!
    author: Customer!
    authorName: String!
    authorLocation: String
    upvotes: Int!
    downvotes: Int!
    state: String!
    response: String
    responseCreatedAt: DateTime
}

type ReviewList implements PaginatedList {
    items: [ProductReview!]!
    totalItems: Int!
}

extend type Product {
    reviews: ReviewList
}

extend type Query {
    ProductReview(id: ID!): ProductReview
    ProductReviews(options: ProductReviewListOptions): ProductReviewList!
}

input ProductReviewListOptions {
    skip: Int
    take: Int
    sort: ProductReviewSortParameter
    filter: ProductReviewFilterParameter
}

input ProductReviewSortParameter {
    id: SortOrder
    createdAt: SortOrder
    updatedAt: SortOrder
    summary: SortOrder
    rating: SortOrder
}

input ProductReviewFilterParameter {
    id: IDOperators
    createdAt: DateOperators
    updatedAt: DateOperators
    summary: StringOperators
    body: StringOperators
    rating: NumberOperators
    authorName: StringOperators
    state: StringOperators
}

type ProductReviewList implements PaginatedList {
    items: [ProductReview!]!
    totalItems: Int!
}

extend type Mutation {
    updateProductReview(input: UpdateProductReviewInput!): ProductReview!
    deleteProductReview(id: ID!): DeletionResponse!
}

input UpdateProductReviewInput {
    id: ID!
    summary: String
    body: String
    state: String
    response: String
}
`;

export const shopApiExtensions= gql`
type ProductReview implements Node {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    product: Product!
    productVariant: ProductVariant
    summary: String!
    body: String!
    rating: Int!
    author: Customer!
    authorName: String!
    authorLocation: String
    upvotes: Int!
    downvotes: Int!
    state: String!
    response: String
    responseCreatedAt: DateTime
}

type ReviewList implements PaginatedList {
    items: [ProductReview!]!
    totalItems: Int!
}

extend type Product {
    reviews: ReviewList
}

extend type Query {
    ProductReview(id: ID!): ProductReview
    ProductReviews(productId: ID!, options: ProductReviewListOptions): ProductReviewList!
}

input ProductReviewListOptions {
    skip: Int
    take: Int
    sort: ProductReviewSortParameter
    filter: ProductReviewFilterParameter
}

input ProductReviewSortParameter {
    id: SortOrder
    createdAt: SortOrder
    updatedAt: SortOrder
    summary: SortOrder
    rating: SortOrder
}

input ProductReviewFilterParameter {
    id: IDOperators
    createdAt: DateOperators
    updatedAt: DateOperators
    summary: StringOperators
    body: StringOperators
    rating: NumberOperators
    authorName: StringOperators
    state: StringOperators
}

type ProductReviewList implements PaginatedList {
    items: [ProductReview!]!
    totalItems: Int!
}

extend type Mutation {
    createProductReview(input: CreateProductReviewInput!): ProductReview!
    updateProductReview(input: UpdateProductReviewInput!): ProductReview!
}

input CreateProductReviewInput {
    productId: ID!
    productVariantId: ID
    summary: String!
    body: String!
    rating: Int!
    authorName: String!
    authorLocation: String
}

input UpdateProductReviewInput {
    id: ID!
    summary: String
    body: String
    state: String
    response: String
}
`