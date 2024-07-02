import gql from 'graphql-tag';

const deleteCustomershopApiExtensions = gql`
  extend type Mutation {
  DeleteCustomerMutation(id: ID!): DeletionResponse!
  }
`;
export const shopApiExtensions = gql`
  ${deleteCustomershopApiExtensions}
`;


