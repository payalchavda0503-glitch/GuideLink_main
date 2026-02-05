import {Dimensions, YellowBox} from 'react-native';
const {width, height, scale} = Dimensions.get('window');
export const COLORS = {
  // base colors
  primary: '#007bbd',
  darkPrimary: '#007bbd',
  blue1: '#007bbd',
  blu2: '#007bbd',

  // colors
  black: '#000',
  secodary: '#2c2c2c',

  white: '#ffffff',
  white2: '#F5F5F5',
  white3: '#EEEEEE',
  black2: '#545453',
  grayed: '#CCCCCC',

  gray: '#8C8C8C',
  disabled: '#cbcdce',
  darkgray: '#b1b3b5',
  lightGray: '#ebecf0',
  gray2: '#a8afba',
  shine: '#f2f4ff',
  gray2: '#f2f2f2',

  red: '#FF0000',
  darkRed: '#990f02',
  darkpink: '#e65cb3',
  pink: '#ff3853',
  pink1: '#ffb3b5',
  pink2: '#ff3d44',
  redwine: '#BC5448',
  blue: '#007bbd',

  border: '#FFDC9D',
  lightYellow: '#f7ec6a',
  Yellow: '#FFD700',
  Yellow1: '#fcccc7',
  Yellow2: '#f7c98d',

  purple1: '#d3c0fa',
  purple2: '#948af2',
  green: '#0B6623',
  lightgreen: '#7fcf3e',
  orange: '#FFA500',

  graySolid: '#EEF1F4'
};

export const SIZES = {
  // global sizes
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  padding2: 36,

  font14: 14,
  font15: 15,
  font16: 16,
  font17: 17,
  font18: 18,
  font19: 19,
  font20: 20,
  font21: 21,
  font22: 22,
  font24: 24,
  font25: 25,
  font26: 26,
  font28: 28,
  font30: 30,

  // font sizes
  largeTitle: 50,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  heading: 20,

  // app dimensions
  width,
  height,
  scale,
};

const appTheme = {COLORS, SIZES};

export default appTheme;
