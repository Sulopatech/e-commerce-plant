import React, { useState, useCallback } from 'react';
import Accordion from 'react-native-collapsible/Accordion';
import { View, TouchableOpacity, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { gql, useQuery } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import { text } from '../text';
import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { theme } from '../constants';
import { components } from '../components';
import { actions } from '../store/actions';
import { GET_ORDERS_HISTORY } from '../Api/order_gql';

const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Get the day, month, and year
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' }); // Full month name
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

const OrderHistory: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_ORDERS_HISTORY);
  const [activeSections, setActiveSections] = useState([]);
  const dispatch = hooks.useAppDispatch();
  const navigation = hooks.useAppNavigation();

  const setSections = (sections: any) => {
    setActiveSections(sections.includes(undefined) ? [] : sections);
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const renderHeader = (): JSX.Element => {
    return <components.Header goBackIcon={true} title='Order history' />;
  };

  const accordionHeader = (section: any): JSX.Element => {
    return (
      <View
        style={{
          borderTopWidth: 1,
          marginHorizontal: 20,
          paddingVertical: 20,
          borderColor: theme.colors.antiFlashWhite,
        }}
      >
        <View
          style={{
            ...theme.flex.rowCenterSpaceBetween,
            marginBottom: utils.responsiveHeight(8),
          }}
        >
          <text.H5 numberOfLines={1}>#{section?.id}</text.H5>
          <text.H5 numberOfLines={1}>₹{section?.total}</text.H5>
        </View>
        <View style={{ ...theme.flex.rowCenterSpaceBetween }}>
          <Text style={{ color: '#FFA462' }}>{section?.orderStatus}</Text>
          <Text
            style={{
              fontSize: Platform.OS === 'ios' ? 12 : 10,
              lineHeight: Platform.OS === 'ios' ? 12 * 1.5 : 10 * 1.5,
              ...theme.fonts.DM_Sans_400Regular,
              color: theme.colors.textColor,
            }}
          >
            {formatDate(section?.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const accordionContent = (section: any): JSX.Element => {
    return (
      <View style={{ marginHorizontal: 20 }}>
        <components.Container
          containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
        >
          {section?.products?.map((item: any) => (
            <View
              key={item?.id}
              style={{
                marginBottom: utils.responsiveHeight(10),
                ...theme.flex.rowCenterSpaceBetween,
              }}
            >
              <text.T14 numberOfLines={1} style={{color: 'black'}}>
                {item?.name}
              </text.T14>
              <text.T14 numberOfLines={1}>
                {item?.quantity} x ₹{item?.price}
              </text.T14>
            </View>
          ))}
          <View
            style={{
              borderBottomWidth: 1,
              marginBottom: utils.responsiveHeight(10),
              paddingBottom: utils.responsiveHeight(10),
              ...theme.flex.rowCenterSpaceBetween,
              borderBottomColor: theme.colors.antiFlashWhite,
            }}
          >
            <text.T14 style={{ textTransform: 'capitalize' }} numberOfLines={1}>
              Delivery
            </text.T14>
            <text.T14 style={{ textTransform: 'capitalize' }} numberOfLines={1}>
            ₹{section?.delivery}
            </text.T14>
          </View>
          <View style={{ ...theme.flex.rowCenterSpaceBetween }}>
            <text.T14
              style={{
                textTransform: 'capitalize',
                color: theme.colors.mainColor,
              }}
              numberOfLines={1}
            >
              Total
            </text.T14>
            <text.T14 style={{ textTransform: 'capitalize' }} numberOfLines={1}>
            ₹{section?.total}
            </text.T14>
          </View>
        </components.Container>
      </View>
    );
  };

  const renderAccordion = (): JSX.Element | null => {
    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error: {error.message}</Text>;

    const sections = data?.activeCustomer?.orders?.items?.map((order: any) => ({
      id: order?.id,
      total: order?.lines?.reduce((acc: number, line: any) => acc + line?.linePriceWithTax, 0),
      orderStatus: order?.state, // Placeholder status
      createdAt: order?.createdAt,
      products: order?.lines?.map((line: any) => ({
        id: line?.id,
        name: line?.productVariant?.name,
        quantity: line?.quantity,
        price: line?.unitPriceWithTax / 100,
      })),
      delivery: 5, // Placeholder delivery fee
    }));

    return (
      <Accordion
        duration={400}
        onChange={setSections}
        activeSections={activeSections}
        renderHeader={accordionHeader}
        renderContent={accordionContent}
        sections={sections}
        touchableComponent={TouchableOpacity}
      />
    );
  };

  const renderContent = (): JSX.Element | null => {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: utils.responsiveHeight(15),
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderAccordion()}
      </ScrollView>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <View>
        <components.Button
          title='My Profile'
          onPress={() => {
            dispatch(actions.setScreen('Profile'));
            navigation.reset({ index: 0, routes: [{ name: 'TabNavigator' }] });
          }}
          containerStyle={{ padding: 20 }}
        />
      </View>
    );
  };

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderHeader()}
      {renderContent()}
      {renderButton()}
    </custom.SafeAreaView>
  );
};

export default OrderHistory;