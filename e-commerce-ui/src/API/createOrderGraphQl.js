import { gql } from 'apollo-server';
import { gql, useMutation } from '@apollo/client';

// createOrderGql.ts
import {gql} from 'graphql-request';

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      status
      message
    }
  }
`;
