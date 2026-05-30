// components/auth/AmbientBlobs.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { palette } from '../../../theme';

const AmbientBlobs: React.FC = () => (
  <>
    <View style={styles.topRight} />
    <View style={styles.bottomLeft} />
  </>
);

const styles = StyleSheet.create({
  topRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.primary}0D`,
    zIndex: 0,
  },
  bottomLeft: {
    position: 'absolute',
    top: '50%',
    left: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: `${palette.secondary}0D`,
    zIndex: 0,
  },
});

export default AmbientBlobs;