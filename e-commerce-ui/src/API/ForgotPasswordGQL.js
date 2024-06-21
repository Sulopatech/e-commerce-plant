import { gql } from 'apollo-server';
import { gql, useMutation } from '@apollo/client';


/*const gql = require('graphql-tag');
const { ApolloClient, InMemoryCache, HttpLink } = require('@apollo/client');

// Initialize Apollo Client
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://192.168.1.55:3000/shop-api' }),
  cache: new InMemoryCache()
});
*/

const ResetPassword=gql

export const REQUEST_PASSWORD_RESET = gql
`mutation RequestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }`
  export const RESET_PASSWORD = gql
  ` mutation ResetPassword($token: String! $password: String!) {
     resetPassword(token: $token password: $password) {
       ...on CurrentUser {
         id
         identifier
       }
       ... on ErrorResult {
         errorCode
         message
       }
     }
   }`
;