import { gql } from "@apollo/client";

export const COUNTRIES_LIST = gql`
  query countries {
    availableCountries {
      code
      name
    }
  }
`;

export const SHIPPING_METHOD = gql`
  query shippingmethod {
    eligibleShippingMethods {
      id
      name
    }
  }
`;

export const ADD_ADDRESS = gql`
  mutation addingShippingAddress(
  $fullName: String!,
  $streetLine1: String!,
  $city: String!,
  $countryCode: String!
  ){
    setOrderShippingAddress(input: {
    fullName: $fullName,
  streetLine1: $streetLine1,
  city: $city,
  countryCode: $countryCode
    }) {
      ... on Order {
        id
        shippingAddress {
          fullName
          streetLine1
          city
          countryCode
        }
        shippingLines {
          id
          shippingMethod {
            id
            name
            languageCode
            code
          }
        }
      }
        ... on ErrorResult{
    errorCode
    message
  }
  ... on NoActiveOrderError{
    errorCode
    message
  }
    }
  }
`;

export const ADD_SHIPPING_METHOD = gql`
  mutation addingShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ... on Order {
        shippingLines {
          shippingMethod {
            id
            name
          }
        }
      }
    }
  }
`;

export const ADD_BILLING_ADDRESS = gql`
 mutation addingBillingAddress(
  $fullName: String!,
  $streetLine1: String!,
  $city: String!,
  $countryCode: String!
  ){
    setOrderBillingAddress(input: {
    fullName: $fullName,
  streetLine1: $streetLine1,
  city: $city,
  countryCode: $countryCode
    }) {
      ... on Order {
        id
        billingAddress {
          fullName
          streetLine1
          city
          countryCode
        }
        shippingLines {
          id
          shippingMethod {
            id
            name
            languageCode
            code
          }
        }
      }
        ... on ErrorResult{
    errorCode
    message
  }
  ... on NoActiveOrderError{
    errorCode
    message
  }
    }
  }`