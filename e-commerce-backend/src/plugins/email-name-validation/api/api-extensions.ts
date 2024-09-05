import gql from 'graphql-tag';

const emailNameValidationAdminApiExtensions = gql`
  extend type Query {
    VerifyEmailAddress(email: String!): Boolean!
  }

`;
export const shopApiExtensions = gql`
  ${emailNameValidationAdminApiExtensions}
`;
