
import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { UPDATE_USER } from '../Api/editprofile_gql';
import { GET_CUSTOMER_PROFILE } from '../Api/getcustomer_gql';
import { alert } from '../alert';
import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { UserType } from '../types';
import { RootState } from '../store';
import { validation } from '../validation';
import { actions } from '../store/actions';
import { components } from '../components';
import { handleTextChange } from '../utils/handleTextChange';
import { setUser } from '../store/slices/userSlice';

const EditProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = hooks.useAppNavigation();

  const user: UserType | null = useSelector((state: RootState) => state.userSlice.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(user?.phoneNumber || '');

  const handleNameChange = handleTextChange(setName);
  const handleEmailChange = handleTextChange(setEmail);
  const handlePhoneNumberChange = handleTextChange(setPhoneNumber);

  const [updateUserMutation] = useMutation(UPDATE_USER);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneNumberInputRef = useRef<TextInput>(null);

  const { loading: queryLoading, error: queryError, data: queryData, refetch } = useQuery(GET_CUSTOMER_PROFILE);

  useEffect(() => {
    if (queryData && queryData.activeCustomer) {
      const { firstName, emailAddress, phoneNumber } = queryData.activeCustomer;
      setName(firstName);
      setEmail(emailAddress);
      setPhoneNumber(phoneNumber);
    }
  }, [queryData]);

  useEffect(() => {
    if (loading) {
      nameInputRef.current?.blur();
      emailInputRef.current?.blur();
      phoneNumberInputRef.current?.blur();
    }
  }, [loading]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const response = await updateUserMutation({
        variables: {
          input: {
            firstName: name,
            phoneNumber,
          },
        },
      });

      if (response.data && response.data.updateCustomer) {
        const updatedUser = response.data.updateCustomer;

        setName(updatedUser.firstName);
        setEmail(updatedUser.email);
        setPhoneNumber(updatedUser.phoneNumber);

        // dispatch(setUser(updatedUser)); 
        await refetch(); 

        navigation.navigate('InfoSaved');
      } else {
        alert.somethingWentWrong('Failed to update user.');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert.somethingWentWrong('Error updating user.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Edit personal info" goBackIcon={true} />;
  };

  const renderUserInfo = (): JSX.Element => {
    return (
      <components.UserData containerStyle={{ marginBottom: utils.responsiveHeight(40) }} />
    );
  };

  const renderInputFields = (): JSX.Element => {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <custom.InputField
          label="Name"
          value={name}
          keyboardType="default"
          innerRef={nameInputRef}
          placeholder="Enter name"
          onChangeText={handleNameChange}
          editable={true}
          containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
        />
        <custom.InputField
          value={email}
          label="Email"
          innerRef={emailInputRef}
          placeholder="Enter email"
          keyboardType="email-address"
          onChangeText={handleEmailChange}
          editable={false}
          containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
        />
        <custom.InputField
          value={phoneNumber}
          label="Phone number"
          keyboardType="phone-pad"
          innerRef={phoneNumberInputRef}
          placeholder="Enter phone number"
          onChangeText={handlePhoneNumberChange}
          editable={true}
          containerStyle={{ marginBottom: utils.responsiveHeight(20) }}
        />
      </View>
    );
  };

  const renderButton = (): JSX.Element => {
    const updatedUser = { name, email, phoneNumber };
    return (
      <components.Button
        title="Save changes"
        loading={loading}
        onPress={() => {
          validation(updatedUser) ? handleUpdate() : null;
        }}
        containerStyle={{ paddingHorizontal: 20 }}
      />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: utils.responsiveHeight(40),
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderUserInfo()}
        {renderInputFields()}
        {renderButton()}
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

export default EditProfile;
