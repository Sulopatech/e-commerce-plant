import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { utils } from '../utils';
import { custom } from '../custom';
import { components } from '../components';

const GET_ORDERS = gql`
  query GETORDERS {
    activeCustomer {
      id
      firstName
      orders {
        totalItems
        items {
          id
          type
          lines {
            id
            unitPriceWithTax
            quantity
            linePriceWithTax
            productVariant {
              id
              name
            }
          }
        }
      }
    }
  }
`;

const Order: React.FC = () => {
  const { loading, error, data } = useQuery(GET_ORDERS);

  const renderHeader = (): JSX.Element => {
    return <components.Header title="My Order" goBackIcon={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }
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
        {data?.activeCustomer?.orders?.items?.map((order) =>
          order?.lines?.map((line) => {
            // console.log("orders in map:", line.productVariant.name)
            return(
            <View key={line.id} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{color: 'black'}}>{line.productVariant.name}</Text>
            </View>)
  })
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