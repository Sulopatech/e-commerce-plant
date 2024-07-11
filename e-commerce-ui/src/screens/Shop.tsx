import React, { useState, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import Modal from 'react-native-modal';
import {
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { text } from '../text';
import { hooks } from '../hooks';
import { items } from '../items';
import { utils } from '../utils';
import { custom } from '../custom';
import { svg } from '../assets/svg';
import { theme } from '../constants';
import { actions } from '../store/actions';
import { components } from '../components';
import { ShopScreenProps } from '../types/ScreenProps';
import ProductCard from '../items/ProductCard';
import { GET_ALL_PRODUCTS, GET_COLLECTION } from '../Api/get_collectiongql';

const sortingBy = [
  { id: 1, title: 'Top' },
  { id: 2, title: 'Price: low to high' },
  { id: 3, title: 'Price: high to low' },
  { id: 4, title: 'Newest' },
  { id: 5, title: 'Sale' },
];

const Shop: React.FC<ShopScreenProps> = ({ route }) => {
  const { title } = route.params;
  const dispatch = hooks.useAppDispatch();
  const navigation = hooks.useAppNavigation();
  const [sort, setSort] = useState(sortingBy[0]);
  const [showModal, setShowModal] = useState(false);

  const { loading, error, data } = useQuery(GET_COLLECTION(title));

  const isLoading = loading;
  // if (loading) {
  //   return <ActivityIndicator size='large' color={theme.colors.mainColor} />;
  // }

  if (error) {
    return (
      <View>
        <Text>Error loading products</Text>
      </View>
    );
  }

  const products = data?.collection?.FilteredProduct?.items || [];

  const applyFilters = (products) => {
    // Add your filtering logic here, for example:
    return products.filter((product) => {
      // Example filter: Return all products (Modify this logic based on actual filters)
      return true;
    });
  };

  const filteredProducts = applyFilters(products);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sort.title) {
      case 'Price: low to high':
        return a.price - b.price;
      case 'Price: high to low':
        return b.price - a.price;
      case 'Newest':
        return a.product.createdAt === b.product.createdAt ? 0 : new Date(a.product.createdAt) > new Date(b.product.createdAt) ? -1 : 1;
      case 'Top':
        return a.isTop === b.isTop ? 0 : a.isTop ? -1 : 1;
      case 'Sale':
        return a.oldPrice === b.oldPrice ? 0 : a.oldPrice ? -1 : 1;
      case 'Featured':
        return a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1;
      default:
        return 0;
    }
  });

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title={title ?? 'Shop'}
        onGoBack={() => {
          dispatch(actions.resetFilters());
          navigation.goBack();
        }}
        bottomLine={true}
        basketIcon={true}
      />
    );
  };

  const renderOptions = (): JSX.Element => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            paddingTop: 20,
            paddingRight: 20,
            paddingBottom: 14,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
          onPress={() => navigation.navigate('Filter')}
        >
          <svg.FiltersSvg />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 14,
            paddingLeft: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
          onPress={() => setShowModal(true)}
        >
          <svg.SortingBySvg />
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (isLoading) return <components.Loader />;
    if (filteredProducts.length === 0) return <components.NoData />;

    return (
      <FlatList
        data={sortedProducts}
        renderItem={({ item }) => {
          return <ProductCard item={item} slug={title} version={1} />;
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        numColumns={2}
        horizontal={false}
        contentContainerStyle={{ paddingHorizontal: 20, flexGrow: 1 }}
      />
    );
  };

  const renderModal = () => {
    return (
      <Modal
        isVisible={showModal}
        onBackdropPress={() => setShowModal(false)}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}
        style={{ margin: 0, flex: 1 }}
        animationIn='zoomIn'
        animationOut='zoomOut'
        statusBarTranslucent={true}
        coverScreen={true}
        deviceHeight={
          theme.sizes.deviceHeight +
          (Platform.OS === 'android' ? utils.statusBarHeight() : 0)
        }
      >
        <View
          style={{
            backgroundColor: theme.colors.white,
            marginHorizontal: 40,
            borderRadius: 5,
            paddingLeft: 20,
            paddingTop: 10,
          }}
        >
          {sortingBy.map((item, index, array) => {
            return (
              <TouchableOpacity
                key={index}
                style={{
                  paddingTop: 10,
                  marginBottom: 4,
                  paddingRight: 20,
                  paddingBottom: 18,
                  ...theme.flex.rowCenterSpaceBetween,
                  borderBottomColor: theme.colors.antiFlashWhite,
                  borderBottomWidth: array.length - 1 === index ? 0 : 1,
                }}
                onPress={() => {
                  setSort(item);
                  setShowModal(false);
                }}
              >
                <text.T14
                  style={{ color: theme.colors.mainColor }}
                  numberOfLines={1}
                >
                  {item.title}
                </text.T14>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderWidth: 1,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderColor: theme.colors.steelTeal,
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        sort === item
                          ? theme.colors.steelTeal
                          : theme.colors.white,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                    }}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    );
  };

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderHeader()}
      {renderOptions()}
      {renderContent()}
      {renderModal()}
    </custom.SafeAreaView>
  );
};

export default Shop;
