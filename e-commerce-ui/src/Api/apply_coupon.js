import { gql } from '@apollo/client';

export const APPLY_COUPON = gql`
mutation ApplyCouponCode($couponCode: String!) {
  applyCouponCode(couponCode: $couponCode) {
    ... on Order {
      id
      couponCodes
      discounts {
        description
        amount
      }
      totalWithTax
    }
    ... on CouponCodeExpiredError {
      errorCode
      message
    }
    ... on CouponCodeInvalidError {
      errorCode
      message
    }
    ... on CouponCodeLimitError {
      errorCode
      message
    }
  }
}

`;
