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

export const ADJUST_ORDER_LINE = gql`
  mutation AdjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ... on Order {
        id
        totalWithTax
        lines {
          id
          quantity
          productVariant {
            name
          }
        }
      }
      ... on ErrorResult {
        errorCode
        message
      }
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
        quantity
        productVariant{
          id
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
