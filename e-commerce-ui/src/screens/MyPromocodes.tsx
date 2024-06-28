import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { text } from '../text';
import { items } from '../items';
import { alert } from '../alert';
import { hooks } from '../hooks';
import { utils } from '../utils';
import { custom } from '../custom';
import { theme } from '../constants';
import { PromocodeType } from '../types';
import { components } from '../components';
import { validation } from '../validation';
import { actions } from '../store/actions';
import { handleTextChange } from '../utils/handleTextChange';
import { APPLY_COUPON } from '../Api/apply_coupon';

const MyPromocodes: React.FC = () => {
  const dispatch = hooks.useAppDispatch();
  const user = hooks.useAppSelector(state => state.userSlice.user);
  const allPromocodes: PromocodeType[] = hooks.useAppSelector(state => state.promocodeSlice.list);
  const [promocodes, setPromocodes] = useState<PromocodeType[]>([]);
  const [voucher, setVoucher] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setPromocodes(allPromocodes.filter(item => item.userId === user?.id));
  }, [allPromocodes, user]);

  const [applyCouponMutation] = useMutation(APPLY_COUPON, {
    onError: (error) => {
      console.error('Mutation Error:', error);
      Alert.alert('Error', 'Something went wrong');
      setLoading(false);
    },
    onCompleted: (data) => {
      setLoading(false);
      if (data && data.applyCouponCode) {
        const { __typename, message, discounts, id, couponCodes } = data.applyCouponCode;
        console.log('Mutation Data:', data);
        console.log(id);
        

        if (__typename === 'CouponCodeExpiredError' || __typename === 'CouponCodeInvalidError' || __typename === 'CouponCodeLimitError') {
          Alert.alert('Error', message);
        } else if (__typename === 'Order') {
          if (discounts && discounts.length > 0 && discounts[0].amount !== undefined) {
            const newPromocode: PromocodeType = {
              id: id,
              userId: user?.id,
              code: voucher,
              discount: discounts[0].amount,
              expires_at: new Date().toISOString(), // Use actual expiration date if available
            };
            dispatch(actions.addPromocode(newPromocode));
            setPromocodes((prevPromocodes) => [...prevPromocodes, newPromocode]); // Update the local state
            Alert.alert('Success', 'Coupon applied successfully');
          } else {
            console.error('Discounts:', discounts);
            Alert.alert('Error', 'No valid discount found for this coupon code');
          }
        } else {
          console.error('Unexpected typename:', __typename);
          Alert.alert('Error', 'Unexpected response from server');
        }
      } else {
        console.error('Invalid data structure:', data);
        Alert.alert('Error', 'Unexpected response from server');
      }
      setVoucher('');
    },
  });

  const onVoucherChange = handleTextChange(setVoucher);

  const handleAddPromocode = () => {
    setLoading(true);
    if (voucherAlreadyExists(voucher)) {
      Alert.alert('Error', 'Promocode already exists');
      setLoading(false);
      return;
    }
    if (validation({ promoCode: voucher })) {
      applyCouponMutation({
        variables: {
          couponCode: voucher,
        },
      }).catch((error) => {
        console.error('Mutation Error:', error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  const voucherAlreadyExists = (voucher: string): boolean => {
    return promocodes.some(item => item.code === voucher);
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header goBackIcon={true} title={'My promocodes'} />;
  };

  const renderEmpty = (): JSX.Element | null => {
    if (promocodes.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
        >
          <custom.Image
            source={require('../assets/icons/08.png')}
            style={{
              height: utils.responsiveHeight(120),
              aspectRatio: 123.39 / 120,
              marginBottom: utils.responsiveHeight(14),
            }}
          />
          <text.H2
            style={{ marginBottom: utils.responsiveHeight(14) }}
            numberOfLines={2}
          >
            You don’t have {'\n'}promocodes yet!
          </text.H2>
          <text.T16>
            Stay tuned for exclusive offers to elevate{'\n'}your plant shopping
            experience.
          </text.T16>
        </ScrollView>
      );
    }

    return null;
  };

  const renderEnterVoucherIfEmpty = (): JSX.Element | null => {
    if (promocodes.length === 0) {
      return (
        <View style={{ paddingHorizontal: 20 }}>
          <custom.InputField
            value={voucher}
            label='Enter the voucher'
            placeholder='Code2024'
            onChangeText={onVoucherChange}
          />
        </View>
      );
    }
    return null;
  };

  const renderButton = (): JSX.Element | null => {
    if (promocodes.length === 0) {
      return (
        <components.Button
          loading={loading}
          title={'Add promocode'}
          onPress={() => {
            if (voucherAlreadyExists(voucher)) {
              return Alert.alert('Error', 'Promocode already exists');
            }
            if (validation({ promoCode: voucher })) {
              handleAddPromocode();
            }
          }}
          containerStyle={{ padding: 20 }}
        />
      );
    }
    return null;
  };

  const renderItem = ({ item }: { item: PromocodeType }): JSX.Element => {
    const isLast = promocodes.indexOf(item) === promocodes.length - 1;
    return <items.PromocodeItem item={item} isLast={isLast} />;
  };

  const renderFlatList = (): JSX.Element | null => {
    if (promocodes.length > 0) {
      return (
        <FlatList
          data={promocodes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{
            flexGrow: 1,
            paddingLeft: 20,
            paddingTop: utils.responsiveHeight(25),
            paddingBottom: utils.responsiveHeight(20),
          }}
          ListFooterComponent={renderEnterVoucher()}
          ListFooterComponentStyle={{
            paddingRight: 20,
          }}
        />
      );
    }
    return null;
  };

  const renderEnterVoucher = (): JSX.Element | null => {
    return (
      <View style={{ ...theme.flex.rowCenterSpaceBetween }}>
        <custom.InputField
          value={voucher}
          label='Enter the voucher'
          placeholder='Code2024'
          onChangeText={onVoucherChange}
          containerStyle={{ width: utils.responsiveWidth(225, true) }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.steelTeal,
            width: utils.responsiveWidth(100, true),
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 50,
          }}
          onPress={() => {
            if (voucherAlreadyExists(voucher)) {
              return Alert.alert('Error', 'Promocode already exists');
            }
            if (validation({ promoCode: voucher })) {
              handleAddPromocode();
            }
          }}
        >
          <Text
            style={{
              ...theme.fonts.DM_Sans_700Bold,
              color: theme.colors.white,
              fontSize: Platform.OS === 'ios' ? 14 : 12,
              lineHeight: Platform.OS === 'ios' ? 14 * 1.5 : 12 * 1.5,
              textTransform: 'capitalize',
            }}
            numberOfLines={1}
          >
            + add
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <React.Fragment>
        {renderEmpty()}
        {renderFlatList()}
        {renderEnterVoucherIfEmpty()}
        {renderButton()}
      </React.Fragment>
    );
  };

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderHeader()}
      {renderContent()}
    </custom.SafeAreaView>
  );
};

export default MyPromocodes;
