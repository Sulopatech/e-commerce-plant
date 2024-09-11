import gql from 'graphql-tag';

const razorPayExtensions = gql`

           type RazorpayOrderIdGenerationError {
                errorCode: String
                message: String
            }

            type RazorpayOrderIdSuccess {
                razorpayOrderId: String!
            }

            union generateRazorpayOrderIdResult =
                  RazorpayOrderIdSuccess
                | RazorpayOrderIdGenerationError

            extend type Mutation {
                generateRazorpayOrderId(
                    orderId: ID!
                ): generateRazorpayOrderIdResult!
            }
`;
export const adminApiExtensions = gql`
  ${razorPayExtensions}
`;

export const shopApiExtensions = gql`
  ${razorPayExtensions}
`;
