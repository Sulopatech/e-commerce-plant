import React from 'react';
import {Text, TextStyle} from 'react-native';

import {text} from '../text';
import {theme} from '../constants';
import {ProductType} from '../types';

type Props = {item: any; style?: TextStyle};

const ProductName: React.FC<Props> = ({item, style}) => {
  return <text.T14 style={style}>{item}</text.T14>;
};

export default ProductName;
