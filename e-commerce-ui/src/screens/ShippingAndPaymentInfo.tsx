import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useMutation, gql, useQuery } from '@apollo/client';

import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { theme } from '../constants';
import { actions } from '../store/actions';
import { components } from '../components';
import { validation } from '../validation';
import { useChangeHandler } from '../utils/useChangeHandler';

const COUNTRIES_LIST = gql`
  query countries {
    availableCountries {
      code
      name
    }
  }
`;

const SHIPPING_METHOD = gql`
  query shippingmethod {
    eligibleShippingMethods {
      id
      name
    }
  }
`;

const ADD_ADDRESS = gql`
  mutation addingAddress($input: ShippingAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ... on Order {
        id
        shippingAddress {
          fullName
          streetLine1
          city
          countryCode
        }
        shippingLines {
          id
          shippingMethod {
            id
            name
            languageCode
            code
          }
        }
      }
        ... on ErrorResult{
    errorCode
    message
  }
  ... on NoActiveOrderError{
    errorCode
    message
  }
    }
  }
`;

const ADD_SHIPPING_METHOD = gql`
  mutation addingShippingMethod($shippingMethodId: ID!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ... on Order {
        shippingLines {
          shippingMethod {
            id
            name
          }
        }
      }
    }
  }
`;

const ShippingAndPaymentInfo: React.FC = () => {
  const navigation = hooks.useAppNavigation();
  const dispatch = hooks.useAppDispatch();
  const user = hooks.useAppSelector(state => state.userSlice.user);

  const { data: countriesData } = useQuery(COUNTRIES_LIST);
  const { data: shippingMethodsData } = useQuery(SHIPPING_METHOD);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryValue, setCountryValue] = useState<string | null>(null);
  const [countryItems, setCountryItems] = useState<{ label: string; value: string }[]>([]);

  const [shippingMethodOpen, setShippingMethodOpen] = useState(false);
  const [shippingMethodValue, setShippingMethodValue] = useState<string | null>(null);
  const [shippingMethodItems, setShippingMethodItems] = useState<{ label: string; value: string }[]>([]);

  const [addAddress] = useMutation(ADD_ADDRESS);
  const [addShippingMethod] = useMutation(ADD_SHIPPING_METHOD);

  useEffect(() => {
    if (countriesData?.availableCountries) {
      const items = countriesData.availableCountries.map((country: { code: string; name: string }) => ({
        label: country.name,
        value: country.code,
      }));
      setCountryItems(items);
    }
  }, [countriesData]);

  useEffect(() => {
    if (shippingMethodsData?.eligibleShippingMethods) {
      const items = shippingMethodsData.eligibleShippingMethods.map((method: { id: string; name: string }) => ({
        label: method.name,
        value: method.id,
      }));
      setShippingMethodItems(items);
    }
  }, [shippingMethodsData]);

  console.log("change shiping add:",)

  const { name, address, cardNumber, expiryDate, cvv, cardHolderName } = hooks.useAppSelector(state => state.paymentSlice);

  const nameInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const cardNumberInputRef = useRef<TextInput>(null);
  const expiryDateInputRef = useRef<TextInput>(null);
  const cvvInputRef = useRef<TextInput>(null);
  const cardHolderNameInputRef = useRef<TextInput>(null);

  const handleCvvChange = useChangeHandler(actions.setCvv);
  const handleNameChange = useChangeHandler(actions.setName);
  const handleAddressChange = useChangeHandler(actions.setAddress);
  const handleCardHolderNameChange = useChangeHandler(actions.setCardHolderName);

  useEffect(() => {
    if (cvv.length === 3) {
      cvvInputRef.current?.blur();
      // console.log('this is cvv', cvv);
    }

    if (cardNumber.length === 19) {
      cardNumberInputRef.current?.blur();
      // console.log('this is card number', cardNumber);
    }

    if (expiryDate.length === 5) {
      expiryDateInputRef.current?.blur();
      // console.log('this is expiry date', expiryDate);
    }
  }, [cvv, cardNumber, expiryDate]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      cvvInputRef.current?.blur();
      nameInputRef.current?.blur();
      addressInputRef.current?.blur();
      cardNumberInputRef.current?.blur();
      expiryDateInputRef.current?.blur();
      cardHolderNameInputRef.current?.blur();
    });

    return unsubscribe;
  }, [navigation]);

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

  const handleProceedToCheckout = async () => {
    const addressInput = {
      fullName: name,
      streetLine1: address,
      city: address, // Assuming you meant city here, adjust if needed
      countryCode: countryValue || '',
    };

  console.log("data in shipping:", name, address, countryValue)

    try {
      await addAddress({ variables: { input: addressInput } });
      console.log(addAddress)
      if (shippingMethodValue) {
        await addShippingMethod({ variables: { shippingMethodId: shippingMethodValue } });
      }

      console.log("shipping method:", shippingMethodValue)
      navigation.navigate('Checkout');
    } catch (error) {
      console.error("Error during checkout: ", error);
      // Handle the error appropriately, e.g., show a message to the user
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header title='Shipping info' goBackIcon={true} />
    );
  };

  const renderContent = (): JSX.Element => {
    const regex = /^[a-zA-Zа-яА-Я\s]*$/;

    return (
      <View style={styles.container}>
        <custom.InputField
          label='Name'
          value={name}
          innerRef={nameInputRef}
          onChangeText={handleNameChange}
          placeholder='Enter your full name'
          containerStyle={styles.inputContainer}
          checkIcon={name.trim() && regex.test(name) ? true : false}
        />
        <custom.InputField
          label='Phone number'
          editable={false}
          value={user?.phoneNumber}
          innerRef={addressInputRef}
          containerStyle={styles.inputContainer}
        />
        <custom.InputField
          label='Email'
          editable={false}
          value={user?.email}
          innerRef={addressInputRef}
          containerStyle={styles.inputContainer}
        />
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={countryOpen}
            value={countryValue}
            items={countryItems}
            setOpen={setCountryOpen}
            setValue={setCountryValue}
            setItems={setCountryItems}
            placeholder="Select your country"
            containerStyle={{ height: 40 }}
            style={{ backgroundColor: '#fafafa' }}
          />
        </View>
        <custom.InputField
          label='City'
          value={address}
          innerRef={addressInputRef}
          placeholder='Enter your city'
          onChangeText={handleAddressChange}
          containerStyle={styles.inputContainer}
        />
        <custom.InputField
          label='Street Line'
          value={address}
          innerRef={addressInputRef}
          placeholder='Enter your street line'
          onChangeText={handleAddressChange}
          containerStyle={styles.inputContainer}
        />
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={shippingMethodOpen}
            value={shippingMethodValue}
            items={shippingMethodItems}
            setOpen={setShippingMethodOpen}
            setValue={setShippingMethodValue}
            setItems={setShippingMethodItems}
            placeholder="Select shipping method"
            containerStyle={{ height: 40 }}
            style={{ backgroundColor: '#fafafa' }}
          />
        </View>
      </View>
    );
  };

  const renderButton = (): JSX.Element => {
    const data = {
      name,
      address,
      cardNumber,
      expiryDate,
      cvv,
      cardHolderName,
    };

    return (
      <components.Button
        title='Proceed to Checkout'
        containerStyle={styles.buttonContainer}
        onPress={handleProceedToCheckout}
      />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: utils.responsiveHeight(35),
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

export default ShippingAndPaymentInfo;