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
import Svg, { Path } from 'react-native-svg';
import { useMutation, useQuery } from '@apollo/client';
import { text } from '../text';
import { hooks } from '../hooks';
import { items } from '../items';
import { utils } from '../utils';
import { custom } from '../custom';
import { svg } from '../assets/svg';
import { theme } from '../constants';
import { product } from '../product';
import { components } from '../components';
import { queryHooks } from '../store/slices/apiSlice';
import { GET_PRODUCT_DETAILS } from '../Api/get_collectiongql';
import { ADDTOCART } from '../Api/order_gql';
import { ProductType, ViewableItemsChanged } from '../types';
import {showMessage} from 'react-native-flash-message';

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

const Product: React.FC<any> = ({ route }) => {
  const { item, slug } = route.params;
  const { responsiveHeight } = utils;
  const productId = item?.id;
  const { data } = useQuery(GET_PRODUCT_DETAILS(slug, productId));
  const productDesc = data?.collection?.FilteredProduct?.items[0];
  const previewUrls = productDesc?.assets
  ? productDesc.assets.map((asset: any) => ({ uri: asset.preview }))
  : (item?.assets?.map((asset: any) => ({ uri: asset.preview })) || item?.featuredAsset?.preview);
  const [loading, setLoading] = useState(false);

  const user = hooks.useAppSelector(state => state.userSlice.user);
  const cart = hooks.useAppSelector(state => state.cartSlice.list);
  const dispatch = hooks.useAppDispatch();
  const navigation = hooks.useAppNavigation();

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const [, setActiveIndex] = useState<number>(0);
  const variantItems = data?.collection?.productVariants?.items.map((variant: any) => ({
    label: variant?.name,
    value: variant?.id,
    stock: variant?.stockLevel
  })) || [];

  console.log("variant in list", variantItems)
  // Map through the additional variant list items
  const additionalVariantItems = item?.variantList?.items.map((variant: any) => ({
    label: variant?.name,
    value: variant?.id,
  })) || [];

  const variantItemsFromHome = item?.collection?.productVariants?.items.map((variant: any) => ({
    label: variant?.name,
    value: variant?.id,
  })) || [];

  // Combine both arrays
  const combinedVariantItems = [...variantItems, ...additionalVariantItems, ...variantItemsFromHome];

  const [open, setOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(
    combinedVariantItems.length > 0 ? combinedVariantItems[0].value : null
  );

  useEffect(() => {
    if (combinedVariantItems.length > 0) {
      setSelectedVariant(combinedVariantItems[0].value);
    }
  }, [combinedVariantItems]);
  const [quantity, setQuantity] = useState<number>(1);

  // console.log("selected variant:", selectedVariant);

  const onViewableItemsChanged = useRef((info: ViewableItemsChanged) => {
    const index = info.viewableItems[0]?.index ?? 0;
    setActiveIndex(index);
  }).current;
  
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

  const [addItemToOrder] = useMutation(ADDTOCART, {
    // onCompleted: (data) => {
    //   Alert.alert("Success", "Item added to order successfully!");
    // },
    onError: (error) => {
      Alert.alert("Error", "Failed to add item to order.");
    },
  });

  const handleAddToCart = async () => {
    const productVariantId = selectedVariant;
    const quantityToApi = quantity;
    const selectedVariantItem = combinedVariantItems.find(variant => variant.value === selectedVariant);
    if (selectedVariantItem?.stock === ("OUT_OF_STOCK" || "LOW_STOCK")) {
      showMessage({
        message: 'Error',
        description: `This variant is out of stock.`,
        type: 'danger',
        icon: 'danger',
      });
      return;
    }
    setLoading(true);
    try {
      if (!exist(productDesc)) {
        showMessage({
          message: 'Success',
          description: `${productDesc?.name || item?.name || item?.productVariant?.name} added to cart`,
          type: 'success',
          icon: 'success',
        })
        await addItemToOrder({ variables: { productVariantId, quantityToApi } });
      }
    } catch (error) {
      console.error("Error during cart: ", error);
    } finally {
      setLoading(false);
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
            <custom.ImageBackground
              resizeMode='cover'
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
            {/* {<Image source={{ uri: previewUrls }} style={{ width: 430, height: 500 }} />} */}
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

    if (previewUrls?.length > 0) {
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
        <text.H3 numberOfLines={1}>{productDesc?.name || item?.name || item?.productVariant?.name}</text.H3>
        <product.ProductRating rating={productDesc?.rating || item?.rating} />
      </View>
    );
  };

  const renderPriceWithQuantity = (): JSX.Element => {
    // Combine both arrays
    const combinedVariantItems = [
      ...data?.collection?.productVariants?.items || [],
      ...item?.variantList?.items || [],
    ];

    // Find the selected variant
    const selectedVariantItem = combinedVariantItems.find(variant => variant.id === selectedVariant);
    const price = selectedVariantItem ? selectedVariantItem.price : 0;

    return (
      <View
        style={{
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
          ₹{price / 100}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              setQuantity(prevQuantity => Math.max(prevQuantity - 1, 0));
            }}
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
            {quantity}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setQuantity(prevQuantity => prevQuantity + 1);
            }}
            style={{ paddingHorizontal: 20, paddingVertical: 23 }}
          >
            {renderPlusSvg()}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVariantDropdown = (): JSX.Element => {

    return (
      <View style={{ marginHorizontal: 20, marginBottom: 30 }}>
        <Text style={{ marginBottom: 10, color: theme.colors.mainColor }}>Select Variant</Text>
        <DropDownPicker
          open={open}
          value={selectedVariant}
          items={combinedVariantItems}
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
          {productDesc?.description || item?.description || item?.productVariant?.description}
        </text.T16>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Description', {
              description: productDesc?.description || item?.description || item?.productVariant?.description,
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
    const selectedVariantItem = combinedVariantItems.find(variant => variant.value === selectedVariant);
    const isOutOfStock = selectedVariantItem?.stock === ("OUT_OF_STOCK" || "LOW_STOCK");
  
    return (
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          backgroundColor: 'white',
        }}
      >
        <components.Button
          title={isOutOfStock ? 'OUT OF STOCK' : '+ ADD to cart'}
          onPress={handleAddToCart}
          containerStyle={{
            paddingBottom: ifInOrderExist ? responsiveHeight(14) : 0,
          }}
          loading={loading}
          // disabled={isOutOfStock}
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
    // { key: 'button', render: renderButton },
  ];

  const renderItem = ({ item }: { item: any }) => item.render();

  return (
    <custom.SafeAreaView insets={['top', 'bottom']} style={{ flex: 1 }}>
      {renderHeader()}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
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
      {renderButton()}
    </custom.SafeAreaView>
  );
};

export default Product;