import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { utils } from '../utils';
import { custom } from '../custom';
import { components } from '../components';

const GET_ORDERS = gql`
  query GETORDERS {
   activeOrder{
      id
          type
          total
          subTotal
          totalWithTax
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

const Order: React.FC = () => {
  const { loading, error, data } = useQuery(GET_ORDERS);
  const isLoading = loading;
  // console.log("data in order:", data)

  const renderHeader = (): JSX.Element => {
    return <components.Header title="My Order" goBackIcon={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (isLoading) return <components.Loader />;
    if (error) {
      return <Text>Error: {error.message}</Text>;
    }

    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: utils.responsiveHeight(40),
        }}
        showsVerticalScrollIndicator={false}
      >
        {data?.activeOrder?.lines?.map((order) =>{
          // order?.lines?.map((line) => {
            // console.log("orders in map:", line.productVariant.name)
            return(
            <View key={order.id} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{color: 'black'}}>{order.productVariant.name}</Text>
            </View>)
  // })
  }
        )}
      </ScrollView>
    );
  };

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderHeader()}
      {renderContent()}
    </custom.SafeAreaView>
  );
};

export default Order;