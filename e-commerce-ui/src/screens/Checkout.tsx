import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, FlatList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { text } from '../text';
import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { theme } from '../constants';
import { components } from '../components';
import { actions } from '../store/actions';
import { useChangeHandler } from '../utils/useChangeHandler';
import { useMutation, useQuery } from '@apollo/client';

import { ELIGIBLE_PAYMENT_METHOD, NEXT_ORDER_STATE, PAYMENT_INFO, CHANGE_STATE, ADD_PAYMENT } from '../Api/payment_gql'

const Checkout: React.FC = () => {
  const navigation = hooks.useAppNavigation();
  const dispatch = hooks.useAppDispatch();
  const { data: eligibleData } = useQuery(ELIGIBLE_PAYMENT_METHOD);
  const { data: nextOrderData } = useQuery(NEXT_ORDER_STATE);
  const { data: paymentInfo } = useQuery(PAYMENT_INFO);

  const [changeState] = useMutation(CHANGE_STATE)
  const [addPayment] = useMutation(ADD_PAYMENT)

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [open, setOpen] = useState(false);

  const discount = hooks.useAppSelector((state) => state.cartSlice.discount);

  const cardNumberInputRef = useRef<TextInput>(null);
  const expiryDateInputRef = useRef<TextInput>(null);
  const cvvInputRef = useRef<TextInput>(null);
  const cardHolderNameInputRef = useRef<TextInput>(null);

  const handleCvvChange = useChangeHandler(actions.setCvv);
  const handleCardHolderNameChange = useChangeHandler(actions.setCardHolderName);

  const { cardNumber, cardHolderName, expiryDate, cvv } = hooks.useAppSelector(
    (state) => state.paymentSlice,
  );

  const handleCardNumberChange = (text: string) => {
    let newText = '';
    let count = 0;

    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') {
        if (count !== 0 && count % 4 === 0) {
          newText = newText + ' ';
        }
        newText = newText + text[i];
        count++;
      }
    }
    dispatch(actions.setCardNumber(newText));
  };

  const handleExpiryDateChange = (text: string) => {
    let newText = '';
    let len = text.length;
    if (len < expiryDate.length) {
      newText = text;
    } else {
      for (let i = 0; i < len; i++) {
        if (i === 2 && text[i] !== '/') {
          newText = newText + '/';
        }
        newText = newText + text[i];
      }
    }
    dispatch(actions.setExpiryDate(newText));
  };


  const handleConfirmOrder = async () => {
    navigation.navigate('OrderPreview')
    const nextOrder = nextOrderData?.nextOrderStates[0]
    setLoading(true);
    try {
      await changeState({
        variables: { state: nextOrder }
      })
      await addPayment({
        variables: { method: paymentMethod, metadata: {} }
      })
    } catch (e) {
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Checkout" goBackIcon={true} />;
  };

  const renderForm = (): JSX.Element => {
    return (
      <View style={styles.container}>
        <custom.InputField
          maxLength={19}
          value={cardNumber}
          label="card number"
          keyboardType="number-pad"
          innerRef={cardNumberInputRef}
          placeholder="Enter your card number"
          onChangeText={handleCardNumberChange}
          containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
        />
        <View>
          <View
            style={{
              ...theme.flex.rowCenterSpaceBetween,
              marginBottom: utils.responsiveHeight(20),
            }}
          >
            <custom.InputField
              maxLength={5}
              value={expiryDate}
              label="expiry date"
              placeholder="MM/YY"
              keyboardType="number-pad"
              innerRef={expiryDateInputRef}
              containerStyle={{ width: '48%' }}
              onChangeText={handleExpiryDateChange}
            />
            <custom.InputField
              keyboardType="number-pad"
              label="CVV"
              value={cvv}
              maxLength={3}
              innerRef={cvvInputRef}
              placeholder="Enter your cvv"
              onChangeText={handleCvvChange}
              containerStyle={{ width: '48%' }}
            />
          </View>
          <custom.InputField
            label="card holder name"
            value={cardHolderName}
            innerRef={cardHolderNameInputRef}
            onChangeText={handleCardHolderNameChange}
            placeholder="Enter your card holder name"
            containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
          />
        </View>
      </View>
    );
  };

  const renderShippingAPaymentInfo = (): JSX.Element => {
    const lastFourDigits = cardNumber.slice(-4);
    const maskedCardNumber = '**** ' + lastFourDigits;
    return (
      <View
        style={{
          padding: 20,
          borderRadius: 15,
          backgroundColor: theme.colors.imageBackground,
        }}
      >
        <text.H5
          numberOfLines={1}
          style={{
            marginBottom: utils.responsiveHeight(13),
          }}
        >
          Payment info
        </text.H5>
        <View
          style={{
            ...theme.flex.rowCenterSpaceBetween,
            paddingBottom: utils.responsiveHeight(14),
          }}
        >
          <text.T14>Shipping</text.T14>
          <text.T14>₹{paymentInfo?.activeOrder?.shipping}</text.T14>
        </View>
        <View
          style={{
            ...theme.flex.rowCenterSpaceBetween,
            paddingBottom: utils.responsiveHeight(14),
          }}
        >
          <text.T14>Subtotal</text.T14>
          <text.T14>₹{paymentInfo?.activeOrder?.subTotal?.toFixed(2)}</text.T14>
        </View>
        {/* SUBTOTAL */}
        <View
          style={{
            ...theme.flex.rowCenterSpaceBetween,
            marginBottom: utils.responsiveHeight(14),
          }}
        >
          <text.H5>Total</text.H5>
          <text.T14 style={{ color: theme.colors.mainColor }}>
          ₹{paymentInfo?.activeOrder?.total?.toFixed(2)}
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
          <text.H4>Total with tax</text.H4>
          <text.H4>₹{paymentInfo?.activeOrder?.subTotalWithTax?.toFixed(2)}</text.H4>
          {/* <text.H4>${(totalWithDiscount + delivery).toFixed(2)}</text.H4> */}
        </View>
      </View>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <components.Button
        loading={loading}
        title="Confirm order"
        onPress={handleConfirmOrder}
        containerStyle={{ padding: 20 }}
      />
    );
  };

  const paymentMethods = eligibleData?.eligiblePaymentMethods.map((method) => ({
    label: method.name,
    value: method.code,
  })) || [];

  const renderItem = ({ item }) => {
    if (item.key === 'form') return renderForm();
    // if (item.key === 'shipping') return renderShippingAPaymentInfo();
    // if (item.key === 'button') return renderButton();
    if (item.key === 'dropdown') {
      return (
        <DropDownPicker
          open={open}
          value={paymentMethod}
          items={paymentMethods}
          setOpen={setOpen}
          setValue={setPaymentMethod}
          placeholder="Select a payment method"
          containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
          dropDownContainerStyle={{ borderColor: 'gray' }}
        />
      );
    }
    return null;
  };

  const dataForFlatList = [
    { key: 'dropdown' },
    ...(paymentMethod ? [{ key: 'form' }] : []),
    ...(paymentMethod ? [
      { key: 'shipping' },
      { key: 'button' },
    ] : []),
  ];

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderHeader()}
      <FlatList
        data={dataForFlatList}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: utils.responsiveHeight(25),
          paddingBottom: utils.responsiveHeight(70),
        }}
      />
      {renderShippingAPaymentInfo()}
      {renderButton()}
    </custom.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: utils.responsiveHeight(20),
  },
  dropdownContainer: {
    marginBottom: utils.responsiveHeight(20),
  },
  buttonContainer: {
    padding: 20,
  },
});

export default Checkout;