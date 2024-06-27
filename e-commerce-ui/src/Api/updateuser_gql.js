import { gql} from "@apollo/client";

 export const UPDATE_USER = gql`
mutation UPDATE_USER($input:UpdateCustomerInput!) {
updateCustomer(input:$input){
firstName
lastName
phoneNumber
}
}
`;