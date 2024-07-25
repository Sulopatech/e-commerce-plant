import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Platform,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@apollo/client';

import { utils } from '../../utils';
import { hooks } from '../../hooks';
import { custom } from '../../custom';
import { theme } from '../../constants';
import { components } from '../../components';
import { GETCATEGORY } from '../../Api/get_collectiongql';

const Categories: React.FC = () => {
  const navigation = hooks.useAppNavigation();

  const { data, error, loading, refetch } = useQuery(GETCATEGORY, {
    variables: {
      options: { skip: 0, take: 10 },
    },
  });

  // console.log('data in category:', data);
  const [refreshing, setRefreshing] = useState(false);

  let collections = data?.collections?.items ?? [];

  const isError = !!error;
  const isLoading = loading;
  const isData = collections.length === 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch()
      .then(() => setRefreshing(false))
      .catch(error => {
        console.error(error);
        setRefreshing(false);
      });
  }, [refetch]);

  const renderCollections = (): JSX.Element | null => {
    if (collections?.length) {
      return (
        <View
          style={{
            flexWrap: 'wrap',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: utils.responsiveHeight(40 - 14),
          }}
        >
          {collections.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={{
                  width: utils.responsiveWidth(160, true),
                  height: utils.responsiveWidth(160, true),
                  marginBottom: 14,
                  justifyContent: 'space-between',
                }}
                onPress={() => {
                  navigation.navigate('Shop', {
                    title: item.slug,
                  });
                }}
              >
                <custom.ImageBackground
                  source={{
                    uri: item.featuredAsset?.preview ?? 'default_image_uri',
                  }}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingTop: 14,
                    paddingBottom: 12,
                  }}
                  imageStyle={{
                    borderRadius: 10,
                    backgroundColor: theme.colors.imageBackground,
                  }}
                  resizeMode='cover'
                >
                  <View
                    style={{
                      backgroundColor: '#CFF5CE',
                      alignSelf: 'flex-start',
                      paddingHorizontal: 9,
                      paddingVertical: 1,
                      borderRadius: 50,
                      minWidth: 23,
                      height: 23,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: Platform.OS === 'ios' ? 14 : 12,
                        color: '#50858B',
                        textTransform: 'capitalize',
                        ...theme.fonts.DM_Sans_400Regular,
                      }}
                    >
                      {item?.productVariants?.totalItems}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: Platform.OS === 'ios' ? 14 : 18,
                      color: theme.colors.mainColor,
                      textTransform: 'capitalize',
                      ...theme.fonts.DM_Sans_400Regular,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)', // Light gray background with 70% opacity
                      paddingHorizontal: 4,
                      borderRadius: 5,
                      alignSelf: 'flex-start'
                    }}

                  >
                    {item.name}
                  </Text>
                </custom.ImageBackground>
              </TouchableOpacity>
            )
          })}
        </View>
      );
    }

    return null;
  };

  const renderContent = (): JSX.Element => {
    if (isLoading) return <components.Loader />;
    if (isError) return <components.Error />;
    if (isData) return <components.NoData />;

    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderCollections()}
      </ScrollView>
    );
  };

  return renderContent();
};

export default Categories;
