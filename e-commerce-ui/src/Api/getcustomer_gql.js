import { gql} from "@apollo/client";

export const GET_CUSTOMER_PROFILE = gql`

query GET_CUSTOMER_PROFILE {
  activeCustomer {
    id
    title
    firstName
    lastName
    phoneNumber
    emailAddress
  }
}
`;