import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useMutation } from '@apollo/client';
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
import { ProductType, ViewableItemsChanged } from '../types';
import { gql, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS } from '../Api/get_products';

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

const Product: React.FC<ProductScreenProps> = ({ route }) => {
  const { item } = route.params;
  const { responsiveHeight } = utils;
  const prodSlug = item?.product?.slug;
  const { data } = useQuery(GET_ALL_PRODUCTS(prodSlug));
  const productDesc = data?.product;
  // console.log("data in product desc:", productDesc?.featuredAsset?.preview);

  console.log("prduct datas", item?.featuredAsset?.preview)

  const user = hooks.useAppSelector(state => state.userSlice.user);
  const dispatch = hooks.useAppDispatch();
  const navigation = hooks.useAppNavigation();

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const onViewableItemsChanged = useRef((info: ViewableItemsChanged) => {
    const index = info.viewableItems[0]?.index ?? 0;
    setActiveIndex(index);
  }).current;

  const cart = hooks.useAppSelector(state => state.cartSlice.list);
  const exist = (item: ProductType) => cart.find(i => i.id === item.id);

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

  const ifInOrderExist = ordersData?.orders.find((order: any) =>
    order.products.find((product: ProductType) => product.id === productDesc?.id),
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

  const handleAddToCart = () => {
    const productVariantId = productDesc?.variants[0]?.id;
    const quantity = 1;

    if (!exist(productDesc)) {
      dispatch(addToCart(modifedItem));
      addItemToOrder({ variables: { productVariantId, quantity } });
    } else {
      alert.alreadyAdded();
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
        data={productDesc?.featuredAsset?.preview}
        pagingEnabled={true}
        style={{ flexGrow: 0 }}
        viewabilityConfig={viewabilityConfig}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => {
          return (
            <custom.Image
              resizeMode='contain'
              source={{ uri: item }}
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
      if (productDesc?.featuredAsset?.preview?.length > 1) {
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
                uri: productDesc?.featuredAsset?.preview || item?.featuredAsset?.preview,
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

    if (productDesc?.featuredAsset?.preview?.length > 0) {
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
        <text.H3 numberOfLines={1}>{productDesc?.name || item?.name}</text.H3>
        <product.ProductRating rating={productDesc?.rating || item?.rating} />
      </View>
    );
  };

  const renderPriceWithQuantity = (): JSX.Element => {
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
          ${productDesc?.variants[0]?.price}
        </Text>
        <product.ProductCounterInner item={modifedItem} />
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
          {productDesc?.description || item?.description}
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

  const renderContent = (): JSX.Element => {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {renderCarousel()}
        {renderNameWithRating()}
        {renderPriceWithQuantity()}
        {renderDescription()}
        {renderReviews()}
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

export default Product;
