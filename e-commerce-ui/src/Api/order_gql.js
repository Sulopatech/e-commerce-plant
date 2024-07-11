import { gql } from "@apollo/client";

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