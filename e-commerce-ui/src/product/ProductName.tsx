import React from 'react';
import {Text, TextStyle} from 'react-native';

import {text} from '../text';
import {theme} from '../constants';
import {ProductType} from '../types';

type Props = {item: any; style?: TextStyle};

const ProductName: React.FC<Props> = ({item, style}) => {
  return <text.T16 style={style}>{item}</text.T16>;
};

export default ProductName;
