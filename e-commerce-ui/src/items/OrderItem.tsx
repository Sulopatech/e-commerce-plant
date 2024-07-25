import { View, Text, TouchableOpacity, Platform } from 'react-native';
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { hooks } from '../hooks';
import { custom } from '../custom';
import { product } from '../product';
import { theme } from '../constants';
import { text } from '../text';
import Svg, { Path } from 'react-native-svg';
import { ADDTOCART, ADJUST_ORDER_LINE } from '../Api/order_gql';
import { showMessage } from 'react-native-flash-message';

const renderMinusSvg = () => (
  <Svg width={14} height={14} fill='none'>
    <Path
      stroke='#23374A'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.2}
      d='M2.898 7h8.114'
    />
  </Svg>
);

const renderPlusSvg = () => (
  <Svg width={14} height={14} fill='none'>
    <Path
      stroke='#23374A'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.2}
      d='M6.955 2.917v8.166M2.898 7h8.114'
    />
  </Svg>
);

type Props = { item: any; isLast: boolean };

const OrderItem: React.FC<Props> = ({ item, isLast }) => {
  const [,setQuantity] = useState<number>(1);
  const navigation = hooks.useAppNavigation();
  const [addToCart] = useMutation(ADDTOCART);
  const [adjustOrderLine] = useMutation(ADJUST_ORDER_LINE);

  const handleMinusClick = () => {
    const newQuantity = Math.max(item?.quantity - 1, 0);
    setQuantity(newQuantity);
    showMessage({
      message: 'Success',
      description: `${item?.name || item?.productVariant?.name} remove from cart`,
      type: 'success',
      icon: 'success',
    })
    adjustOrderLine({
      variables: {
        orderLineId: item.id,
        quantity: newQuantity,
      },
    }).then(response => {
      if (response.data?.adjustOrderLine?.__typename === 'Order') {
        console.log('Order updated successfully');
      } else {
        console.error('Failed to update order', response.data?.adjustOrderLine);
      }
    }).catch(error => {
      console.error('Error adjusting order line', error);
    });
  };

  const imageUrl = item?.featuredAsset?.preview || '';
  const renderImage = () => {
    return (
      <custom.ImageBackground
        source={{ uri: imageUrl }}
        style={{ width: 100, height: '100%' }}
        imageStyle={{
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          backgroundColor: theme.colors.imageBackground,
        }}
        resizeMode='cover'
      >
        {item.oldPrice && (
          <product.ProductSaleBadge
            containerStyle={{
              position: 'absolute',
              padding: 4,
              bottom: 0,
              left: 0,
            }}
          />
        )}
      </custom.ImageBackground>
    );
  };

  const renderInfo = () => {
    return (
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme.colors.antiFlashWhite,
          width: '100%',
          paddingRight: 0,
          flexDirection: 'row',
          flex: 1,
        }}
      >
        <View
          style={{
            marginRight: 'auto',
            paddingLeft: 14,
            paddingTop: 14,
            paddingBottom: 14,
          }}
        >
          <product.ProductName item={item?.productVariant?.name} style={{ marginBottom: 3 }} />
          <product.ProductPrice item={item?.productVariant?.price / 100} />
          <text.T14>Qty: {item?.quantity}</text.T14>
          {item.color && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 'auto',
              }}
            >
              <Text
                style={{
                  fontSize: Platform.OS === 'ios' ? 12 : 10,
                  color: theme.colors.textColor,
                  marginRight: 14,
                }}
              >
                Color: {item.color}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          {/* click minus */}
          <TouchableOpacity
             onPress={handleMinusClick}
            style={{ paddingHorizontal: 20, paddingVertical: 23 }}
          >
            {renderMinusSvg()}
          </TouchableOpacity>
          <Text
            style={{
              ...theme.fonts.DM_Sans_700Bold,
              fontSize: Platform.OS === 'ios' ? 14 : 12,
              color: theme.colors.textColor,
              lineHeight: Platform.OS === 'ios' ? 14 * 1.5 : 12 * 1.5,
            }}
          >
            {item?.quantity}
          </Text>

          {/* click plus */}
          <TouchableOpacity
            onPress={() => {
              showMessage({
                message: 'Success',
                description: `${item?.name || item?.productVariant?.name} added to cart`,
                type: 'success',
                icon: 'success',
              })
              setQuantity(prevQuantity => prevQuantity + 1);
              addToCart({ variables: { productVariantId: item?.productVariant?.id, quantityToApi: 1 } });
            }}
            style={{ paddingHorizontal: 20, paddingVertical: 23 }}
          >
            {renderPlusSvg()}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        width: '100%',
        height: 100,
        marginBottom: isLast ? 0 : 14,
      }}
      onPress={() => navigation.navigate('Product', { item })}
    >
      {renderImage()}
      {renderInfo()}
    </TouchableOpacity>
  );
};

export default OrderItem;