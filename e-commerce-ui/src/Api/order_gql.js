import { gql } from "@apollo/client";

export const ADDTOCART = gql`
  mutation AddItemToOrder($productVariantId: ID!, $quantityToApi: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantityToApi) {
      __typename
      ...ActiveOrder
    }
  }
  fragment ActiveOrder on Order {
    id
    code
    state
    couponCodes
    subTotalWithTax
    shippingWithTax
    totalWithTax
    totalQuantity
    lines {
      id
      productVariant {
        id
        name
      }
      featuredAsset {
        id
        preview
      }
      quantity
      linePriceWithTax
    }
  }
`;

export const GET_ORDERS_HISTORY = gql`
  query GETORDERS {
     activeCustomer {
      id
      firstName
      orders {
        totalItems
        items {
          id
          state
          type
          total
          subTotal
          totalWithTax
          totalQuantity
          createdAt
          discounts{
            description
            amount
            amountWithTax
          }
          lines {
            id
            unitPriceWithTax
            quantity
            linePriceWithTax
            productVariant {
              id
              name
              price
            }
            featuredAsset{
              preview
            }
          }
        }
      }
    }
  }
`;

export const GET_ACTIVE_ORDERS = gql`
  query GETORDERS {
   activeOrder{
      id
          type
          total
          subTotal
          totalWithTax
          subTotalWithTax
          totalQuantity
      lines{
        id
        productVariant{
          name
          price
        }
        featuredAsset{
              preview
            }
      }
          discounts{
            description
            amount
            amountWithTax
          }
    }
  }
`;
