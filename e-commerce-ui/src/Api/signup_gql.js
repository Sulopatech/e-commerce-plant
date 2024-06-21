// SignUp
import { gql } from "@apollo/client";

export const SIGNUP = gql`
  mutation registerCustomerAccount($firstName: String, $emailAddress: String!, $password: String) {
    registerCustomerAccount(input: {
      firstName: $firstName,
      emailAddress: $emailAddress,
      password: $password
    }) {
      __typename
    }
  }
`;



// mutation {
//     registerCustomerAccount(input:{
//         firstName:"Miler ODE"
//         emailAddress:"milar@gmail.com"
//         password:"1234"
//     })
//     {
//         __typename
//     }
// }