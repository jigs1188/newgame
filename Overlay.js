import React from 'react';
import { View, StyleSheet } from 'react-native';

const Overlay = () => {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.unfilled} />
        <View style={styles.row}>
          <View style={styles.unfilled} />
          <View style={styles.frame} />
          <View style={styles.unfilled} />
        </View>
        <View style={styles.unfilled} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  unfilled: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  row: {
    flexDirection: 'row',
    height: 300, 
  },
  frame: {
    width: 300, 
    borderColor: '#fff',
    borderWidth: 2,
  },
});

export default Overlay;