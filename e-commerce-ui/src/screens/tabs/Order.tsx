import React, { useState, useCallback } from 'react';
import { View, Alert, RefreshControl } from 'react-native';
import { useQuery } from '@apollo/client';
import { useFocusEffect } from '@react-navigation/native';
import { text } from '../../text';
import { hooks } from '../../hooks';
import { items } from '../../items';
import { utils } from '../../utils';
import { custom } from '../../custom';
import { theme } from '../../constants';
import { useAppSelector } from '../../store';
import { actions } from '../../store/actions';
import { components } from '../../components';
import { queryHooks } from '../../store/slices/apiSlice';
import { useChangeHandler } from '../../utils/useChangeHandler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { GET_ACTIVE_ORDERS } from '../../Api/order_gql';

const Order: React.FC = () => {
  const dispatch = hooks.useAppDispatch();
  const navigation = hooks.useAppNavigation();

  const discount = useAppSelector(state => state.cartSlice.discount);
  const promoCode = useAppSelector(state => state.cartSlice.promoCode);

  const { data: ordersData, error: ordersError, loading: ordersLoading, refetch: refetchOrders } = useQuery(GET_ACTIVE_ORDERS);

  const {
    data: plantsData,
    error: plantsError,
    isLoading: plantsLoading,
    refetch: refetchPlants,
  } = queryHooks.useGetPlantsQuery();

  const {
    data: promocodesData,
    error: promocodesError,
    isLoading: promocodesLoading,
    refetch: refetchPromocodes,
  } = queryHooks.useGetPromocodesQuery();

  const handlePromocodeChange = useChangeHandler(actions.setPromoCode);

  const matchPromocode = promocodesData?.promocodes.find(
    item => item.code === promoCode,
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchPlants(), refetchPromocodes(), refetchOrders()])
      .then(() => setRefreshing(false))
      .catch(error => {
        console.error(error);
        setRefreshing(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refetchOrders();
    }, [])
  );

  const renderProducts = (): JSX.Element | null => {
    if (ordersData?.activeOrder?.lines?.length > 0) {
      return (
        <View style={{ paddingLeft: 20, marginBottom: utils.rsHeight(30) }}>
          {ordersData?.activeOrder?.lines?.map((order, index) => {
            const isLast = index === order?.lines?.length - 1;
            return (
              <items.OrderItem key={order?.id} item={order} isLast={isLast} />
            );
          })}
        </View>
      );
    }

    return null;
  };

  const renderEnterVoucher = (): JSX.Element | null => {
    if (ordersData?.activeOrder?.lines?.length > 0) {
      return (
        <View
          style={{
            paddingHorizontal: 20,
            ...theme.flex.rowCenterSpaceBetween,
            marginBottom: utils.responsiveHeight(70),
          }}
        >
          <custom.InputField
            value={promoCode}
            label='Enter the voucher'
            containerStyle={{
              width: utils.responsiveWidth(225, true),
            }}
            editable={discount === 0}
            onChangeText={handlePromocodeChange}
            placeholder={discount === 0 ? 'Enter the voucher' : promoCode}
          />
          <components.Button
            title='Apply'
            containerStyle={{
              padding: 0,
              width: utils.responsiveWidth(100, true),
            }}
            onPress={() => {
              if (promoCode.trim() === '') {
                Alert.alert(
                  'Promocode required',
                  'Please enter a promocode',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('OK');
                      },
                    },
                  ],
                  { cancelable: false },
                );
                return;
              }
              if (!matchPromocode) {
                Alert.alert(
                  'Invalid promocode',
                  'The promocode you entered is invalid',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('OK');
                      },
                    },
                  ],
                  { cancelable: false },
                );
                return;
              }

              if (discount > 0) {
                Alert.alert(
                  'Promocode already applied',
                  'You have already applied a promocode',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('OK');
                      },
                    },
                  ],
                  { cancelable: false },
                );
              }

              if (matchPromocode) {
                dispatch(actions.setDiscount(Number(matchPromocode?.discount)));
                return;
              }
            }}
          />
        </View>
      );
    }

    return null;
  };

  const renderTotal = (): JSX.Element | null => {
    if (ordersData?.activeOrder?.lines?.length > 0) {
      return (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            padding: 20,
            borderRadius: 15,
            backgroundColor: theme.colors.imageBackground,
          }}
        >
          {/* DELIVERY */}
          <View
            style={{
              ...theme.flex.rowCenterSpaceBetween,
              paddingBottom: utils.responsiveHeight(14),
            }}
          >
            <text.T14>Total Quantity</text.T14>
            <text.T14>{ordersData?.activeOrder?.totalQuantity}</text.T14>
          </View>
          {/* SUBTOTAL */}
          <View
            style={{
              ...theme.flex.rowCenterSpaceBetween,
              marginBottom: utils.responsiveHeight(14),
            }}
          >
            <text.H5>Subtotal</text.H5>
            <text.T14 style={{ color: theme.colors.mainColor }}>
            ₹{ordersData?.activeOrder?.subTotal?.toFixed(2) / 100}
            </text.T14>
          </View>
          {/* DISCOUNT */}
          {discount > 0 && (
            <View
              style={{
                borderBottomWidth: 1,
                ...theme.flex.rowCenterSpaceBetween,
                paddingBottom: utils.responsiveHeight(14),
                marginBottom: utils.responsiveHeight(14),
                borderColor: theme.colors.antiFlashWhite,
              }}
            >
              <text.T14>Discount</text.T14>
              <text.T14>{discount}%</text.T14>
            </View>
          )}
          {/* TOTAL */}
          <View style={{ ...theme.flex.rowCenterSpaceBetween }}>
            <text.H4>Subtotal with tax</text.H4>
            <text.H4>₹{ordersData?.activeOrder?.subTotalWithTax?.toFixed(2)/ 100}</text.H4>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = (): JSX.Element | null => {
    if (ordersData?.activeOrder?.lines?.length === undefined) {
      return (
        <View style={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}>
          <custom.Image
            source={require('../../assets/icons/04.png')}
            style={{
              height: utils.responsiveHeight(120),
              aspectRatio: 123.39 / 120,
              marginBottom: utils.responsiveHeight(14),
            }}
          />
          <text.H2
            style={{ marginBottom: utils.responsiveHeight(14) }}
            numberOfLines={1}
          >
            Your cart is empty!
          </text.H2>
          <text.T16>Looks like you haven't made {'\n'}your order yet.</text.T16>
        </View>
      );
    }

    return null;
  };

  const renderButton = (): JSX.Element | null => {
    return (
      <components.Button
        title={ordersData?.activeOrder?.lines?.length > 0 ? 'Shipping & Payment info' : 'Shop now'}
        containerStyle={{ padding: 20 }}
        touchableOpacityStyle={{ backgroundColor: theme.colors.pastelMint }}
        textStyle={{ color: theme.colors.steelTeal }}
        onPress={() => {
          if (ordersData?.activeOrder?.lines?.length === undefined) {
            navigation.navigate('Shop', {
              title: 'Shop',
            });
            return;
          }

          if (ordersData?.activeOrder?.lines?.length > 0) {
            dispatch(actions.resetFilters());
            navigation.navigate('ShippingAndPaymentInfo');
            return;
          }
        }}
      />
    );
  };

  const renderContent = (): JSX.Element => {
    if (ordersLoading) return <components.Loader />;
    return (
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        contentContainerStyle={{
          flexGrow: 1,
          paddingVertical: 20,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderProducts()}
        {renderEnterVoucher()}
        {renderTotal()}
        {renderEmpty()}
      </KeyboardAwareScrollView>
    );
  };

  return (
    <React.Fragment>
      {renderContent()}
      {renderButton()}
    </React.Fragment>
  );
};

export default Order;