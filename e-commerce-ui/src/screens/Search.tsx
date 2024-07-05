import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useQuery} from '@apollo/client';
import {SEARCH_QUERY} from '../Api/search_gql';
import {hooks} from '../hooks';
import {custom} from '../custom';
import {theme} from '../constants';
import {ProductType} from '../types';
import {components} from '../components';
import Product from './Product';

const Search: React.FC = () => {
  const navigation = hooks.useAppNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const {data, loading, error} = useQuery(SEARCH_QUERY, {
    variables: {term: searchQuery},
    skip: !searchQuery, // Skip query if searchQuery is empty
  });
  console.log(data);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const renderSearchBar = () => {
    return (
      <View
        style={{
          paddingTop: 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomColor: `${theme.colors.antiFlashWhite}80`,
        }}
      >
        <View style={{flex: 1, height: 40, marginRight: 20}}>
          <TextInput
            ref={ref}
            placeholder='Enter product name'
            clearButtonMode='always'
            placeholderTextColor={`${theme.colors.textColor}80`}
            autoCapitalize='none'
            autoCorrect={false}
            autoFocus={true}
            value={searchQuery}
            onChangeText={text => handleSearch(text)}
            style={{
              height: 40,
              padding: 0,
              borderRadius: 4,
              paddingHorizontal: 20,
              backgroundColor: `${theme.colors.antiFlashWhite}50`,
              color: theme.colors.textColor,
              ...theme.fonts.DM_Sans_400Regular,
            }}
          />
        </View>
        <TouchableOpacity
          style={{
            height: 40,
            justifyContent: 'center',
          }}
          onPress={() => navigation.goBack()}
        >
          <Text
            style={{
              color: theme.colors.textColor,
              ...theme.fonts.DM_Sans_400Regular,
              fontSize: Platform.OS === 'ios' ? 14 : 12,
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({item}: {item: ProductType}) => {
    return (
      <TouchableOpacity
        style={{
          marginHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: `${theme.colors.antiFlashWhite}80`,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => {
          navigation.navigate('Product', {item: item});
        }}
      >
        <Image
          source={{uri: item.productAsset.preview}}
          style={{width: 50, height: 50, marginRight: 10}}
        />
        <Text
          style={{
            marginLeft: 10,
            color: theme.colors.textColor,
            ...theme.fonts.DM_Sans_400Regular,
            fontSize: Platform.OS === 'ios' ? 14 : 12,
          }}
        >
          {item.productName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            ...theme.fonts.DM_Sans_400Regular,
            fontSize: Platform.OS === 'ios' ? 16 : 14,
            color: theme.colors.textColor,
          }}
        >
          No results found
        </Text>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (loading) {
      return <components.Loader />;
    }

    if (error) {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
        >
          <Text
            style={{
              ...theme.fonts.DM_Sans_400Regular,
              fontSize: Platform.OS === 'ios' ? 16 : 14,
              color: theme.colors.textColor,
            }}
          >
            Error fetching data
          </Text>
        </View>
      );
    }

    const filteredProducts = data?.search?.items;

    return (
      <FlatList
        data={filteredProducts}
        keyExtractor={(item: ProductType, index: number) =>
          `${item.productAsset.id}-${item.productName}-${index}`
        }
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps='handled' // when user taps on the screen, the keyboard will be hidden
        keyboardDismissMode='on-drag' // when user drags the screen, the keyboard will be hidden
        ListEmptyComponent={() => renderEmptyComponent()}
        renderItem={({item}) => renderItem({item})}
      />
    );
  };

  const renderContent = () => {
    return (
      <>
        {renderSearchBar()}
        {renderSearchResults()}
      </>
    );
  };

  return (
    <custom.SafeAreaView insets={['top', 'bottom']}>
      {renderContent()}
    </custom.SafeAreaView>
  );
};

export default Search;
