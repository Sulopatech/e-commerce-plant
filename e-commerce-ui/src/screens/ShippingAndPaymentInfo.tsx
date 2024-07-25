import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CheckBox from '@react-native-community/checkbox'; // Import CheckBox from @react-native-community/checkbox
import { useMutation, useQuery } from '@apollo/client';
import { showMessage } from 'react-native-flash-message';

import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { text } from '../text';
import { components } from '../components';
import { actions } from '../store/actions';
import { useChangeHandler } from '../utils/useChangeHandler';
import { COUNTRIES_LIST, SHIPPING_METHOD, ADD_ADDRESS, ADD_SHIPPING_METHOD, ADD_BILLING_ADDRESS } from '../Api/shipping_gql';
import { theme } from '../constants/colors';

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
  const [countryValue, setCountryValue] = useState<string | null>('IN'); // Set default value to 'IN' for India
  const [countryShippingValue, setCountryShippingValue] = useState<string | null>('IN');
  const [countryItems, setCountryItems] = useState<{ label: string; value: string }[]>([]);

  const [shippingMethodOpen, setShippingMethodOpen] = useState(false);
  const [shippingMethodValue, setShippingMethodValue] = useState<string | null>(null);
  const [shippingMethodItems, setShippingMethodItems] = useState<{ label: string; value: string }[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const { name, address, streetLine, streetLineShipping, addressShipping, pinBilling, pinShipping } = hooks.useAppSelector(state => state.paymentSlice);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const addressInputRef = useRef<TextInput>(null);
  const streetInputRef = useRef<TextInput>(null);
  const addressShippingInputRef = useRef<TextInput>(null);
  const pinShippingInputRef = useRef<TextInput>(null);
  const pinBillingInputRef = useRef<TextInput>(null);
  const streetShippingInputRef = useRef<TextInput>(null);

  const handleNameChange = useChangeHandler(actions.setName);
  const handleAddressChange = useChangeHandler(actions.setAddress);
  const handleStreetChange = useChangeHandler(actions.setStreet);
  const handleAddressShippingChange = useChangeHandler(actions.setAddressShipping);
  const handleStreetShippingChange = useChangeHandler(actions.setStreetShipping);
  const handlePinShippingChange = useChangeHandler(actions.setPinShipping);
  const handlePinBillingChange = useChangeHandler(actions.setPinBilling);

  const [selectedSection, setSelectedSection] = useState<'billing' | 'shipping'>('billing');
  const [sameAsBilling, setSameAsBilling] = useState(false);

  useEffect(() => {
    if (countriesData?.availableCountries) {
      const items = countriesData?.availableCountries?.map((country: { code: string; name: string }) => ({
        label: country?.name,
        value: country?.code,
      }));
      setCountryItems(items);
    }
  }, [countriesData]);

  useEffect(() => {
    if (shippingMethodsData?.eligibleShippingMethods) {
      const items = shippingMethodsData?.eligibleShippingMethods?.map((method: { id: string; name: string }) => ({
        label: method?.name,
        value: method?.id,
      }));
      setShippingMethodItems(items);
    }
  }, [shippingMethodsData]);

  const handleProceedToCheckout = async () => {
    if (!name || !streetLine || !address || !pinBilling || !countryValue || !shippingMethodValue || !streetLineShipping|| !addressShipping  || !pinShipping) {
      showMessage({
        message: 'Please fill in all required fields',
        type: 'danger',
      });
      return;
    }
  
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
          streetLine1: streetLine,
          city: address,
          countryCode: countryValue || '',
        }
      });
      if (shippingMethodValue) {
        await addShippingMethod({ variables: { shippingMethodId: shippingMethodValue } });
      }
  
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

  useEffect(() => {
    if (sameAsBilling) {
      handleAddressShippingChange(address);
      handleStreetShippingChange(streetLine);
      handlePinShippingChange(pinBilling);
      setCountryShippingValue(countryValue);
    }
  }, [sameAsBilling, address, streetLine, pinBilling, countryValue]);

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
            label='Name *'
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
            label='Email *'
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

      // Section toggle
      {
        id: 'sectionToggle',
        component: (
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedSection('billing')}
            >
              <View style={styles.radioCircle}>
                {selectedSection === 'billing' && <View style={styles.selectedRb} />}
              </View>
              <Text style={styles.radioText}>Billing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedSection('shipping')}
            >
              <View style={styles.radioCircle}>
                {selectedSection === 'shipping' && <View style={styles.selectedRb} />}
              </View>
              <Text style={styles.radioText}>Shipping</Text>
            </TouchableOpacity>
          </View>
        )
      },

      // Billing section
      selectedSection === 'billing' && {
        id: 'billingHeader',
        component: <text.H4 style={styles.header}>Billing Address</text.H4>
      },
      selectedSection === 'billing' && {
        id: 'streetBilling',
        component: (
          <custom.InputField
            label='Street Line *'
            value={streetLine}
            innerRef={streetInputRef}
            placeholder='Enter your street line'
            onChangeText={handleStreetChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      selectedSection === 'billing' && {
        id: 'cityBilling',
        component: (
          <custom.InputField
            label='City *'
            value={address}
            innerRef={addressInputRef}
            placeholder='Enter your city'
            onChangeText={handleAddressChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      selectedSection === 'billing' && {
        id: 'pinBilling',
        component: (
          <custom.InputField
            label='Pin code *'
            value={pinBilling}
            innerRef={pinBillingInputRef}
            placeholder='Enter your pin code'
            onChangeText={handlePinBillingChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      selectedSection === 'billing' && {
        id: 'countryBilling',
        component: (
          <View style={{ marginBottom: utils.responsiveHeight(30) }}>
            <DropDownPicker
              open={countryOpen}
              value={countryValue}
              items={countryItems}
              setOpen={setCountryOpen}
              setValue={setCountryValue}
              setItems={setCountryItems}
              placeholder="Select your country *"
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownMenu}
              listMode="MODAL"
              searchable={true}
            />
          </View>
        )
      },

      // Shipping section
      selectedSection === 'shipping' && {
        id: 'shippingHeader',
        component: <text.H4 style={styles.header}>Shipping Address</text.H4>
      },
      selectedSection === 'shipping' && {
        id: 'streetShipping',
        component: (
          <custom.InputField
            label='Street Line *'
            value={streetLineShipping}
            innerRef={streetShippingInputRef}
            placeholder='Enter your street line'
            onChangeText={handleStreetShippingChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      selectedSection === 'shipping' && {
        id: 'cityShipping',
        component: (
          <custom.InputField
            label='City *'
            value={addressShipping}
            innerRef={addressShippingInputRef}
            placeholder='Enter your city'
            onChangeText={handleAddressShippingChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      selectedSection === 'shipping' && {
        id: 'pinShipping',
        component: (
          <custom.InputField
            label='Pin code *'
            value={pinShipping}
            innerRef={pinShippingInputRef}
            placeholder='Enter your pin code'
            onChangeText={handlePinShippingChange}
            containerStyle={styles.inputContainer}
          />
        )
      },
      selectedSection === 'shipping' && {
        id: 'countryShipping',
        component: (
          <View style={{ marginBottom: utils.responsiveHeight(30) }}>
            <DropDownPicker
              open={countryShippingOpen}
              value={countryShippingValue}
              items={countryItems}
              setOpen={setCountryShippingOpen}
              setValue={setCountryShippingValue}
              setItems={setCountryItems}
              placeholder="Select your country *"
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownMenu}
              listMode="MODAL"
              searchable={true}
            />
          </View>
        )
      },

      // Checkbox
      {
        id: 'sameAsBilling',
        component: (
          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox}>
              <CheckBox
                value={sameAsBilling}
                onValueChange={setSameAsBilling}
                tintColors={{ true: '#50858B', false: '#E7EBEB' }}
              />
            </View>
            {/* <Text style={styles.checkboxLabel}>Same as</Text> */}
          </View>
        )
      },

      // Shipping Method
      {
        id: 'shippingMethod',
        component: (
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={shippingMethodOpen}
              value={shippingMethodValue}
              items={shippingMethodItems}
              setOpen={setShippingMethodOpen}
              setValue={setShippingMethodValue}
              setItems={setShippingMethodItems}
              placeholder="Select shipping method *"
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownMenu}
            />
          </View>
        )
      },
    ].filter(Boolean);

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <FlatList
              data={contentData}
              renderItem={({ item }: any) => item?.component}
              keyExtractor={(item: any) => item?.id}
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
    height: 110
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
    borderColor: '#E7EBEB',
  },
  buttonContainer: {
    padding: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#50858B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#50858B',
  },
  radioText: {
    fontSize: 16,
    color: '#000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -15
  },
  checkbox: {
    // borderWidth: 1,
    borderColor: '#E7EBEB', // Border color
    borderRadius: 4,
  },
  checkboxLabel: {
    color: '#000000',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ShippingAndPaymentInfo;
