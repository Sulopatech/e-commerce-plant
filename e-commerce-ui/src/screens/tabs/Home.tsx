import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  Platform,
  ViewToken,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

const GET_BANNER = gql`
query banner{
  banners{
    items{
      id
      description
      name
      asset{
        id
        source
        preview
      }
    }
    totalItems
  }
}
`

import { text } from '../../text';
import { items } from '../../items';
import { hooks } from '../../hooks';
import { utils } from '../../utils';
import { custom } from '../../custom';
import { svg } from '../../assets/svg';
import { theme } from '../../constants';
import { components } from '../../components';
import { queryHooks } from '../../store/slices/apiSlice';
import { GETCATEGORY, GET_COLLECTION } from '../../Api/get_collectiongql';
import { gql, useQuery } from '@apollo/client';
import ProductCard from '../../items/ProductCard';

type ViewableItemsChanged = {
  viewableItems: Array<ViewToken>;
  changed: Array<ViewToken>;
};

const Home: React.FC = () => {
  const navigation = hooks.useAppNavigation();

  const {
    data: plantsData,
    error: plantsError,
    isLoading: plantsLoading,
    refetch: refetchPlants,
  } = queryHooks.useGetPlantsQuery();

  const {
    data: bannersData,
    error: bannersError,
    isLoading: bannersLoading,
    refetch: refetchBanners,
  } = queryHooks.useGetBannersQuery();

  const { data, error: categoriesError, loading: categoriesLoading, refetch: refetchCategories } = useQuery(GETCATEGORY, {
    variables: {
      options: { skip: 0, take: 10 },
    },
  });

  const title = "featured-product"
  const titleBest = "best-selling"
  const { data: featuredData } = useQuery(GET_COLLECTION(title));
  const { data: bestSellersData } = useQuery(GET_COLLECTION(titleBest));

  const { data: bannerData } = useQuery(GET_BANNER);

  const {
    data: carouselData,
    error: carouselError,
    isLoading: carouselLoading,
    refetch: refetchCarousel,
  } = queryHooks.useGetCarouselQuery();

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const onViewableItemsChanged = useRef((info: ViewableItemsChanged) => {
    const index = info.viewableItems[0]?.index ?? 0;
    setActiveIndex(index);
  }).current;

  let bestSellers =
    plantsData?.plants.filter(item => item.isBestSeller === true) || [];

  let featured =
    plantsData?.plants.filter(item => item.isFeatured === true) || [];

  let carousel = carouselData?.carousel || [];

  let categories = data?.collections?.items ?? [];

  let banner = bannerData?.banners?.items || [];

  console.log("baNNER:",bannerData)

  const isData =
    banner.length === 0 &&
    featured.length === 0 &&
    categories.length === 0 &&
    bestSellers.length === 0 &&
    carousel.length === 0;

  const isError =
    plantsError || bannersError || categoriesError || carouselError;

  const isLoading =
    bannersLoading || plantsLoading || categoriesLoading || carouselLoading;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      refetchPlants(),
      refetchBanners(),
      refetchCarousel(),
      refetchCategories(),
    ])
      .then(() => setRefreshing(false))
      .catch(error => {
        console.error(error);
        setRefreshing(false);
      });
  }, [refetchPlants, refetchBanners, refetchCarousel, refetchCategories]);

  const renderCarouselItem = ({ item }) => {
    const products = plantsData?.plants.filter(plant => {
      return plant.promotion === item.promotion;
    });

    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          if (false) {
            Alert.alert(
              'Products do not exist',
              'Unfortunately, there are no products with the name of such promotion.',
              [
                {
                  text: 'OK',
                  onPress: () => console.log('OK Pressed'),
                },
              ],
            );

            return;
          }

          navigation.navigate('Shop', {
            title: 'featured-product',
          });
        }}
      >
        <custom.ImageBackground
          source={{ uri: item?.asset?.preview }}
          style={{
            width: theme.sizes.deviceWidth,
            aspectRatio: 375 / 500,
            paddingHorizontal: 20,
            paddingTop: 40,
            paddingBottom: 20,
            justifyContent: 'space-between',
          }}
          imageStyle={{ backgroundColor: theme.colors.imageBackground }}
        >
          <View style={{ marginBottom: 30 }}>
            {/* <text.H1 style={{ textTransform: 'capitalize' }}>
              {item?.name}
            </text.H1> */}
            <text.H1 style={{ textTransform: 'capitalize' }}>
              {item?.description}
            </text.H1>
            <View
              style={{
                marginTop: 30,
                backgroundColor: theme.colors.pastelMint,
                alignSelf: 'flex-start',
                paddingHorizontal: 24,
                paddingVertical: 15,
                borderRadius: 50,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <svg.ShoppingCartSvg />
              <Text
                style={{
                  ...theme.fonts.DM_Sans_500Medium,
                  fontSize: Platform.OS === 'ios' ? 12 : 13,
                  lineHeight: Platform.OS === 'ios' ? 12 * 1.7 : 10 * 1.7,
                  color: theme.colors.mainColor,
                }}
                numberOfLines={1}
              >
                Shop Now
              </Text>
            </View>
          </View>
        </custom.ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderFlatList = () => {
    // console.log("*****COMING TO FLAT LIST")
    // console.log("*****carousel********",carousel)
    return (
      <FlatList
        data={banner}
        // data={[{ "id": 1, "image": "https://everbloom.rn-admin.site/storage/rvmjqtilPLUFFT56Uztu1XyeluTKWBHaakSiXCLQ.jpg", "promotion": "Enjoy 30% Off On Select Items!", "title_line_1": "Enjoy 30% Off On", "title_line_2": "Select Items!" },
        // { "id": 2, "image": "https://everbloom.rn-admin.site/storage/2RxLwmDxKluhZp2FGrQXosmuIirqRFL8s0SY9o15.jpg", "promotion": "Enjoy 30% Off On Select Items!", "title_line_1": "Enjoy 30% Off On", "title_line_2": "Select Items!" }]}
        horizontal={true}
        pagingEnabled={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={renderCarouselItem}
      />
    );
  };

  const renderDots = (): JSX.Element | null => {
    // if (carousel.length && carousel.length > 0) {
    if (true) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            bottom: 0,
            position: 'absolute',
          }}
        >
          {banner?.map((_, current, array) => {
            const last = current === array.length - 1;
            return (
              <View
                key={current}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 6,
                  backgroundColor:
                    activeIndex === current
                      ? theme.colors.mainColor
                      : theme.colors.white,
                  marginRight: last ? 0 : 10,
                }}
              />
            );
          })}
        </View>
      );
    }

    return null;
  };

  const renderCarousel = (): JSX.Element | null => {
    if (true) {
      return (
        <View
          style={{
            width: theme.sizes.deviceWidth,
            marginBottom: utils.responsiveHeight(20),
          }}
        >
          {renderFlatList()}
          {renderDots()}
        </View>
      );
    }

    return null;
  };

  const renderCategories = (): JSX.Element => {

    if (!categories || categories.length === 0) {
      // console.log("No categories data available");
      return <View />;
    }

    return (
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 0,
        }}
        style={{
          marginBottom: utils.responsiveHeight(50),
          marginTop: carouselData?.carousel.length
            ? 0
            : utils.responsiveHeight(0),
          flexGrow: 0,
        }}
      >
        {categories?.map((item, index, array) => {
          const isLast = index === array.length - 1;


          const dataFilter = plantsData?.plants.filter(
            e => e.categories.includes(item.name),
          );
          const qty = item?.productVariants?.totalItems;

          return (
            <items.CategoryItem
              item={item}
              isLast={isLast}
              qty={qty}
              key={item.id.toString()}
              dataFilter={dataFilter}
            />
          );
        })}
      </ScrollView>
    );
  };


  const renderBestSellers = (): JSX.Element | null => {
    const bestSeller = bestSellersData?.collection?.FilteredProduct?.items || [];

    return (
      <View style={{ marginBottom: utils.responsiveHeight(50) }}>
        <components.BlockHeading
          title='Best sellers'
          containerStyle={{
            paddingHorizontal: 0,
            marginBottom: 11,
          }}
          viewAllOnPress={() => {
            navigation.navigate('Shop', {
              title: 'best-selling',
            });
          }}
        />
        <FlatList
          data={bestSeller}
          renderItem={({ item, index }) => {
            const isLast = index === featured.length - 1;
            return (
              <items.ProductCard
                item={item}
                key={item.id.toString()}
                version={1}
                isLast={isLast}
                slug={item.slug}
              />
            );
          }}
          horizontal={true}
          contentContainerStyle={{ paddingLeft: 0 }}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  };

  const renderBanner = (): JSX.Element | null => {
    //if (banner?.length === 0) return null;

    // const bannerPromotion = bannersData?.banners[0]?.promotion;
    // const bannerLength = bannersData?.banners?.length ?? 0;
    // const products =
    //   plantsData?.plants.filter(item => item.promotion === bannerPromotion) ??
    //   [];

    if (true) {
      return (
        <TouchableOpacity
          style={{ marginBottom: utils.responsiveHeight(50) }}
          onPress={() => {
            if (true) {
              Alert.alert('No data', 'No data available for this promotion');
              return;
            }

            navigation.navigate('Shop', {
              title: 'Shop',
            });
          }}
        >
          <custom.Image
            source={{ uri: 'https://everbloom.rn-admin.site/storage/MuVAapQZ8kQIVA5LquIIRMFHkdv0CD8hicIT6zg8.png' }}
            style={{
              width: theme.sizes.deviceWidth - 20,
              aspectRatio: 355 / 200,
            }}
            imageStyle={{
              borderTopRightRadius: 5,
              borderBottomRightRadius: 5,
              backgroundColor: theme.colors.imageBackground,
            }}
            resizeMode='cover'
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  const renderFeatured = (): JSX.Element | null => {
    const featured = featuredData?.collection?.FilteredProduct?.items || [];

    return (
      <View style={{ marginBottom: utils.responsiveHeight(20) }}>
        <components.BlockHeading
          title="Featured products"
          containerStyle={{
            paddingHorizontal: 0,
            marginBottom: utils.rsHeight(11),
          }}
          viewAllOnPress={() => {
            navigation.navigate('Shop', {
              title: 'featured-product',
            });
          }}
        />
        <FlatList
          data={featured}
          renderItem={({ item, index }) => {
            const isLast = index === featured.length - 1;
            return (
              <items.ProductCard
                item={item}
                key={item.id.toString()}
                version={1}
                isLast={isLast}
                slug={item.slug}
              />
            );
          }}
          horizontal={true}
          contentContainerStyle={{ paddingLeft: 0 }}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    );
  };


  const renderContent = (): JSX.Element => {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          // paddingTop: 20,
          paddingHorizontal: 10,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderCarousel()}
        {renderCategories()}
        {renderBanner()}
        {renderFeatured()}
        {renderBestSellers()}
      </ScrollView>
    );
  };

  return renderContent();
};

export default Home;
