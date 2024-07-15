import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useMutation, useQuery } from '@apollo/client';

import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { text } from '../text';
import { actions } from '../store/actions';
import { components } from '../components';
import { useChangeHandler } from '../utils/useChangeHandler';
import { COUNTRIES_LIST, SHIPPING_METHOD, ADD_ADDRESS, ADD_SHIPPING_METHOD, ADD_BILLING_ADDRESS } from '../Api/shipping_gql'

const ShippingAndPaymentInfo: React.FC = () => {
  const navigation = hooks.useAppNavigation();
  const user = hooks.useAppSelector(state => state.userSlice.user);

  const { data: countriesData } = useQuery(COUNTRIES_LIST);
  const { data: shippingMethodsData } = useQuery(SHIPPING_METHOD);

  const [addAddress] = useMutation(ADD_ADDRESS);
  const [addShippingMethod] = useMutation(ADD_SHIPPING_METHOD);
  const [addingBillingAddress] = useMutation(ADD_BILLING_ADDRESS);

  const [countryOpen, setCountryOpen] = useState(false);
  const [countryShippingOpen, setCountryShippingOpen] = useState(false);
  const [countryValue, setCountryValue] = useState<string | null>(null);
  const [countryShippingValue, setCountryShippingValue] = useState<string | null>(null);
  const [countryItems, setCountryItems] = useState<{ label: string; value: string }[]>([]);
  
  const [shippingMethodOpen, setShippingMethodOpen] = useState(false);
  const [shippingMethodValue, setShippingMethodValue] = useState<string | null>(null);
  const [shippingMethodItems, setShippingMethodItems] = useState<{ label: string; value: string }[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  
  const { name, address, streetLine, streetLineShipping, addressShipping, cardNumber, expiryDate, cvv } = hooks.useAppSelector(state => state.paymentSlice);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const streetInputRef = useRef<TextInput>(null);
  const addresshippingInputRef = useRef<TextInput>(null);
  const streetShippingInputRef = useRef<TextInput>(null);
  const cardNumberInputRef = useRef<TextInput>(null);
  const expiryDateInputRef = useRef<TextInput>(null);
  const cvvInputRef = useRef<TextInput>(null);
  const cardHolderNameInputRef = useRef<TextInput>(null);

  const handleNameChange = useChangeHandler(actions.setName);
  const handleAddressChange = useChangeHandler(actions.setAddress);
  const handleStreetChange = useChangeHandler(actions.setStreet);
  const handleAddressShippingChange = useChangeHandler(actions.setAddressShipping);
  const handleStreetShippingChange = useChangeHandler(actions.setStreetShipping);

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

  const handleProceedToCheckout = async () => {
    setLoading(true);

    try {
      await addingBillingAddress({
        variables: {
          fullName: name,
          streetLine1: streetLine,
          city: address,
          countryCode: countryValue || '',
        }
      });
      await addAddress({
        variables: {
          fullName: name,
          streetLine1: streetLineShipping,
          city: addressShipping,
          countryCode: countryShippingValue || '',
        }
      });
      console.log(addAddress);
      if (shippingMethodValue) {
        await addShippingMethod({ variables: { shippingMethodId: shippingMethodValue } });
      }

      console.log("shipping method:", shippingMethodValue);
      navigation.navigate('Checkout');
    } catch (error) {
      console.error("Error during checkout: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading) {
      emailInputRef.current?.blur();
      addressInputRef.current?.blur();
    }
  }, [loading]);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header title='Shipping info' goBackIcon={true} />
    );
  };

  const renderContent = (): JSX.Element => {
    const regex = /^[a-zA-Zа-яА-Я\s]*$/;

    const contentData = [
      {
        id: 'name',
        component: (
          <custom.InputField
            label='Name'
            value={name}
            innerRef={nameInputRef}
            onChangeText={handleNameChange}
            placeholder='Enter your full name'
            containerStyle={styles.inputContainer}
            checkIcon={name.trim() && regex.test(name) ? true : false}
          />
        )
      },
      {
        id: 'email',
        component: (
          <custom.InputField
            label='Email'
            editable={false}
            value={user?.email}
            innerRef={emailInputRef}
            containerStyle={styles.inputContainer}
          />
        )
      },
      {
        id: 'phone',
        component: (
          <custom.InputField
            label='Phone number'
            editable={true}
            value={user?.phoneNumber}
            innerRef={addressInputRef}
            containerStyle={styles.inputContainer}
          />
        )
      },
      {
        id: 'billingHeader',
        component: <text.H4 style={styles.header}>Billing Address</text.H4>
      },
      {
        id: 'streetBilling',
        component: (
          <custom.InputField
            label='Street Line'
            value={streetLine}
            innerRef={streetInputRef}
            placeholder='Enter your street line'
            onChangeText={handleStreetChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      {
        id: 'cityBilling',
        component: (
          <custom.InputField
            label='City'
            value={address}
            innerRef={addressInputRef}
            placeholder='Enter your city'
            onChangeText={handleAddressChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      {
        id: 'countryBilling',
        component: (
          <View style={styles.dropdownContainer}>
            {/* <Text style={styles.dropdownLabel}>COUNTRY</Text> */}
            <DropDownPicker
              open={countryOpen}
              value={countryValue}
              items={countryItems}
              setOpen={setCountryOpen}
              setValue={setCountryValue}
              setItems={setCountryItems}
              placeholder="Select your country"
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownMenu}
              listMode="MODAL"
              searchable={true}
            />
          </View>
        )
      },
      {
        id: 'shippingHeader',
        component: <text.H4 style={styles.header}>Shipping Address</text.H4>
      },
      {
        id: 'streetShipping',
        component: (
          <custom.InputField
            label='Street Line'
            value={streetLineShipping}
            innerRef={streetShippingInputRef}
            placeholder='Enter your street line'
            onChangeText={handleStreetShippingChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      {
        id: 'cityShipping',
        component: (
          <custom.InputField
            label='City'
            value={addressShipping}
            innerRef={addresshippingInputRef}
            placeholder='Enter your city'
            onChangeText={handleAddressShippingChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      {
        id: 'countryShipping',
        component: (
          <View style={styles.dropdownContainer}>
            {/* <Text style={styles.dropdownLabel}>COUNTRY</Text> */}
            <DropDownPicker
              open={countryShippingOpen}
              value={countryShippingValue}
              items={countryItems}
              setOpen={setCountryShippingOpen}
              setValue={setCountryShippingValue}
              setItems={setCountryItems}
              placeholder="Select your country"
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownMenu}
               listMode="MODAL"
               searchable={true}
            />
          </View>
        )
      },
      {
        id: 'shippingMethod',
        component: (
          <View style={styles.dropdownContainer}>
            {/* <Text style={styles.dropdownLabel}>SHIPPING METHOD</Text> */}
            <DropDownPicker
              open={shippingMethodOpen}
              value={shippingMethodValue}
              items={shippingMethodItems}
              setOpen={setShippingMethodOpen}
              setValue={setShippingMethodValue}
              setItems={setShippingMethodItems}
              placeholder="Select shipping method"
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownMenu}
              //  listMode="MODAL"
              //  searchable={true}
            />
          </View>
        )
      },
    ];

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <FlatList
              data={contentData}
              renderItem={({ item }) => item?.component}
              keyExtractor={item => item?.id}
              contentContainerStyle={styles.container}
              keyboardShouldPersistTaps="handled"
            />
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <View style={styles.buttonContainer}>
        <components.Button
          title='Proceed to Checkout'
          onPress={handleProceedToCheckout}
          loading={loading}
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: utils.responsiveHeight(35),
    zIndex: 1
  },
  inputContainer: {
    marginBottom: utils.responsiveHeight(15),
    zIndex: 1
  },
  header: {
    marginBottom: 20,
    color: 'gray'
  },
  dropdownContainer: {
    marginBottom: utils.responsiveHeight(30),
    zIndex: 1000,
  },
  dropdownContainerStyle: {
    height: 40,
    zIndex: 1000,
  },
  dropdownLabel: {
    fontSize: 12,
    paddingLeft: 10,
    color: 'gray',
    marginBottom: 5,
  },
  dropdownStyle: {
    backgroundColor: '#fafafa',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E7EBEB'
  },
  dropdownMenu: {
    backgroundColor: '#fafafa',
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E7EBEB'
  },
  buttonContainer: {
    padding: 20,
  },
});

export default ShippingAndPaymentInfo;
