import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useMutation, useQuery, gql } from '@apollo/client';
import { text } from '../text';
import { alert } from '../alert';
import { hooks } from '../hooks';
import { items } from '../items';
import { utils } from '../utils';
import { custom } from '../custom';
import { svg } from '../assets/svg';
import { theme } from '../constants';
import { product } from '../product';
import { components } from '../components';
import { queryHooks } from '../store/slices/apiSlice';
import { addToCart } from '../store/slices/cartSlice';
import { ProductScreenProps } from '../types/ScreenProps';
import { GET_PRODUCT_DETAILS } from '../Api/get_collectiongql';
import { ProductType, ViewableItemsChanged } from '../types';

export const ADDTOCART = gql`
  mutation AddItemToOrder($productVariantId: ID!, $quantity: Int!) {
    addItemToOrder(productVariantId: $productVariantId, quantity: $quantity) {
      __typename
      ...ActiveOrder
    }
  }
  fragment ActiveOrder on Order {
    id
    code
    state
    couponCodes
    subTotalWithTax
    shippingWithTax
    totalWithTax
    totalQuantity
    lines {
      id
      productVariant {
        id
        name
      }
      featuredAsset {
        id
        preview
      }
      quantity
      linePriceWithTax
    }
  }
`;

const Product: React.FC<any> = ({ route }) => {
  const { item, slug } = route.params;
  const { responsiveHeight } = utils;

  const productId = item?.id;

  const { data } = useQuery(GET_PRODUCT_DETAILS(slug, productId));
  const productDesc = data?.collection?.FilteredProduct?.items[0];

  const previewUrls = productDesc?.assets?.map((asset: any) => ({ uri: asset?.preview })) || [];

  const user = hooks.useAppSelector(state => state.userSlice.user);
  const dispatch = hooks.useAppDispatch();
  const navigation = hooks.useAppNavigation();

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<string>(data?.collection?.productVariants?.items[0]?.id);
  const [open, setOpen] = useState(false);

  const onViewableItemsChanged = useRef((info: ViewableItemsChanged) => {
    const index = info.viewableItems[0]?.index ?? 0;
    setActiveIndex(index);
  }).current;

  const cart = hooks.useAppSelector(state => state.cartSlice.list);
  const exist = (item: ProductType) => cart.find(i => i.id === item?.id);

  const {
    data: reviewsData,
    error: reviewsError,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = queryHooks.useGetReviewsQuery(productDesc?.id || 0);

  const {
    data: ordersData,
    error: ordersError,
    isLoading: ordersLoading,
  } = queryHooks.useGetOrdersQuery(user?.id || 0);

  const ifInOrderExist = ordersData?.orders?.find((order: any) =>
    order?.products?.find((product: ProductType) => product?.id === productDesc?.id),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetchReviews();
    });

    return unsubscribe;
  }, [navigation]);

  const modifedItem = { ...productDesc };

  const [addItemToOrder] = useMutation(ADDTOCART, {
    onCompleted: (data) => {
      Alert.alert("Success", "Item added to order successfully!");
    },
    onError: (error) => {
      Alert.alert("Error", "Failed to add item to order.");
    },
  });

  const handleAddToCart = async () => {
    const productVariantId = selectedVariant;
    const quantity = 1;
    try {
      if (!exist(productDesc)) {
        dispatch(addToCart(modifedItem));
        await addItemToOrder({ variables: { productVariantId, quantity } });
      } else {
        alert.alreadyAdded();
      }
    } catch (error) {
      console.error("Error during cart: ", error);
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        logoIcon={true}
        goBackIcon={true}
        basketIcon={true}
        bottomLine={true}
      />
    );
  };

  const renderImages = (): JSX.Element => {
    return (
      <FlatList
        bounces={false}
        horizontal={true}
        data={previewUrls}
        pagingEnabled={true}
        style={{ flexGrow: 0 }}
        viewabilityConfig={viewabilityConfig}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => {
          return (
            <custom.Image
              resizeMode='contain'
              source={{ uri: item.uri }}
              style={{
                aspectRatio: 375 / 500,
                width: theme.sizes.deviceWidth,
                backgroundColor: theme.colors.imageBackground,
              }}
            />
          );
        }}
      />
    );
  };

  const renderCarousel = (): JSX.Element | null => {
    const renderIndicator = (): JSX.Element | null => {
      if (previewUrls.length > 1) {
        return (
          <View
            style={{
              bottom: 31,
              flexDirection: 'row',
              alignItems: 'center',
              position: 'absolute',
              alignSelf: 'center',
            }}
          >
            <Image
              source={{
                uri: previewUrls,
              }}
              style={{ width: 430, height: 500 }}
            />
          </View>
        );
      }

      return null;
    };

    const renderInWishlist = (): JSX.Element => {
      return (
        <product.ProductInWishlist
          item={productDesc}
          containerStyle={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
          version={2}
        />
      );
    };

    if (previewUrls.length > 0) {
      return (
        <View style={{ marginBottom: utils.rsHeight(30) }}>
          {renderImages()}
          {renderIndicator()}
          {renderInWishlist()}
        </View>
      );
    }

    return null;
  };

  const renderNameWithRating = (): JSX.Element => {
    return (
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: utils.rsHeight(30),
          ...theme.flex.rowCenterSpaceBetween,
        }}
      >
        <text.H3 numberOfLines={1}>{productDesc?.name}</text.H3>
        <product.ProductRating rating={productDesc?.rating || item?.rating} />
      </View>
    );
  };

  const renderPriceWithQuantity = (): JSX.Element => {
    const selectedVariantItem = data?.collection?.productVariants?.items.find((variant: any) => variant.id === selectedVariant);
    const price = selectedVariantItem ? selectedVariantItem.price : 0;
    
    return (
      <View
        style={{
          marginLeft: 20,
          paddingLeft: 20,
          marginBottom: 30,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderBottomWidth: 1,
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          borderColor: theme.colors.antiFlashWhite,
          ...theme.flex.rowCenterSpaceBetween,
        }}
      >
        <Text
          style={{
            ...theme.fonts.DM_Sans_700Bold,
            fontSize: Platform.OS === 'ios' ? 20 : 18,
            color: theme.colors.mainColor,
          }}
        >
          ${price / 100}
        </Text>
        <product.ProductCounterInner item={modifedItem} />
      </View>
    );
  };

  const renderVariantDropdown = (): JSX.Element => {
    const variantItems = data?.collection?.productVariants?.items.map((variant: any) => ({
      label: variant.name,
      value: variant.id,
    })) || [];

    return (
      <View style={{ marginHorizontal: 20, marginBottom: 30 }}>
        <Text style={{ marginBottom: 10, color: theme.colors.mainColor }}>Select Variant</Text>
        <DropDownPicker
          open={open}
          value={selectedVariant}
          items={variantItems}
          setOpen={setOpen}
          setValue={setSelectedVariant}
          setItems={() => {}}
          style={{
            borderWidth: 1,
            borderColor: '#E7EBEB',
            borderRadius: 4,
          }}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E7EBEB',
          }}
          listMode="SCROLLVIEW"
          onChangeValue={(value: any) => {
            setSelectedVariant(value);
          }}
        />
      </View>
    );
  };

  const renderDescription = (): JSX.Element => {
    return (
      <View
        style={{
          paddingHorizontal: 20,
          marginBottom: 30,
        }}
      >
        <text.H5 style={{ marginBottom: 14, color: theme.colors.mainColor }}>
          Description
        </text.H5>
        <text.T16
          style={{
            color: theme.colors.textColor,
            marginBottom: utils.responsiveHeight(14),
          }}
          numberOfLines={6}
        >
          {productDesc?.description}
        </text.T16>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Description', {
              description: productDesc?.description,
              title: productDesc?.name,
            });
          }}
        >
          <svg.ReadMoreSvg />
        </TouchableOpacity>
      </View>
    );
  };

  const renderReviews = (): JSX.Element | null => {
    if (!reviewsData?.reviews.length) return null;

    const reversedReviews = [...reviewsData.reviews].reverse();
    const slice = reversedReviews.slice(0, 2);

    return (
      <View style={{ paddingLeft: 20 }}>
        <components.BlockHeading
          title={`Reviews (${reviewsData?.reviews.length})`}
          containerStyle={{ marginRight: 20, marginBottom: responsiveHeight(20) }}
          viewAllOnPress={() => {
            navigation.navigate('Reviews', { reviews: reviewsData?.reviews });
          }}
          viewAllVisible={reversedReviews.length > 2}
        />
        {slice.map((item: any, index: number, array: any) => {
          const isLast = index === array.length - 1;
          return (
            <items.ReviewItem
              key={item.id.toString()}
              item={item}
              isLast={isLast}
            />
          );
        })}
      </View>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <View style={{ padding: 20 }}>
        <components.Button
          title='+ ADD to cart'
          onPress={handleAddToCart}
          containerStyle={{
            paddingBottom: ifInOrderExist ? responsiveHeight(14) : 0,
          }}
        />
        {ifInOrderExist && (
          <components.Button
            title='Leave a review'
            touchableOpacityStyle={{ backgroundColor: theme.colors.pastelMint }}
            onPress={() => {
              navigation.navigate('LeaveAReview', { productId: productDesc?.id });
            }}
            textStyle={{ color: theme.colors.steelTeal }}
          />
        )}
      </View>
    );
  };

  // Define data for FlatList
  const listData = [
    { key: 'carousel', render: renderCarousel },
    { key: 'nameWithRating', render: renderNameWithRating },
    { key: 'priceWithQuantity', render: renderPriceWithQuantity },
    { key: 'variantDropdown', render: renderVariantDropdown },
    { key: 'description', render: renderDescription },
    { key: 'reviews', render: renderReviews },
    { key: 'button', render: renderButton },
  ];

  const renderItem = ({ item }: { item: any }) => item.render();

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderHeader()}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View style={{ padding: 20 }}>
            {ifInOrderExist && (
              <components.Button
                title='Leave a review'
                touchableOpacityStyle={{ backgroundColor: theme.colors.pastelMint }}
                onPress={() => {
                  navigation.navigate('LeaveAReview', { productId: productDesc?.id });
                }}
                textStyle={{ color: theme.colors.steelTeal }}
              />
            )}
          </View>
        )}
      />
    </custom.SafeAreaView>
  );
};

export default Product;