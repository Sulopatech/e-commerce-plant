import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
mutation LOGIN($username: String!, $password: String!) {
  authenticate(input: {
    native: {
      username: $username,
      password: $password
    }
  }, rememberMe: true) {
    ... on CurrentUser {
      id
      identifier
      channels {
        id
        token
        code
        permissions
        __typename
      }
    }
    ... on InvalidCredentialsError {
      errorCode
      message
    }
    ... on NotVerifiedError {
      errorCode
      message
    }
  }
}

`;
