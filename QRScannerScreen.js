import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Modal } from 'react-native';
import { CameraView } from 'expo-camera';
import Overlay from './Overlay';

const QRScannerScreen = ({ onScanComplete, onCancel }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    // (async () => {
    //   const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission( 'granted');
    // })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    // if (!scanned) {
    //   setScanned(true);
      console.log('Scanned data:', data);
      onScanComplete?.(data);
    // }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>No access to camera</Text>
      </View>
    );
  }

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barCodeTypes: ['qr'],
            isReadable: true,
          }}
          focusDepth={1}
          zoom={0}
          ratio="16:9"
        >
          <Overlay />
        </CameraView>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 16,
  },
});

export default QRScannerScreen;