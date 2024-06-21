import { ApolloClient,HttpLink,HttpLink, InMemoryCache} from '@apollo/client'
import { buildClientSchema } from 'graphql';
const HttpLink =new HttpLink(
    {
        urli:'http://192.168.1.55:3000/shop-api'
    }
);
const client=new ApolloClient(
    {
        link:HttpLink,
        cache:new InMemoryCache(),
    }
);
export default  client;