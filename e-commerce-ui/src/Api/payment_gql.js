import { gql } from "@apollo/client";

export const ELIGIBLE_PAYMENT_METHOD = gql`
  query eligiblePayment {
    eligiblePaymentMethods {
      id
      name
      code
      description
    }
  }
`;

export const NEXT_ORDER_STATE = gql`
query NextStates {
  nextOrderStates
}
`

export const CHANGE_STATE = gql`
mutation changingState($nextOrder: String! = "ArrangingPayment"){
  transitionOrderToState(state: $nextOrder) {
   ... on Order{
     id
     state
   }
  }
}
`

export const ADD_PAYMENT = gql`
mutation addingPayment($method: String!) {
addPaymentToOrder(input:{
  method: $method,
  metadata: {}
}){
  ... on Order{
    id
    state
    payments{
      id
      transactionId
      method
    }
  }
}  
}
`

export const PAYMENT_INFO = gql`
query neworder{
    activeOrder{
      id
          type
          total
          subTotal
      subTotalWithTax
          totalWithTax
          totalQuantity
      shipping
      lines{
        id
        quantity
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
`