import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Modal, Button, ActivityIndicator, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Overlay from './Overlay';

const QRScannerScreen = ({ onScanComplete, onCancel }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      onScanComplete?.(data);
    }
  };
  
  const pickImageAndScan = async () => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access gallery is required!');
        setLoading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: false,
      });
      if (!result.canceled) {
        if (Platform.OS === 'web') {
          // You could use jsQR here for web only
          Alert.alert('Not supported', 'QR scan from image is not supported on web in this app.');
        } else {
          Alert.alert('Not supported', 'QR scan from gallery is not supported on this platform.');
        }
      }
    } catch (error) {
      console.error('QR scanning error:', error);
      Alert.alert('Error', 'Failed to scan QR from image.');
    }
    setLoading(false);
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
          }}
          focusDepth={1}
          zoom={0}
          ratio="16:9"
        >
          <Overlay />
          <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 }}>
              Hold QR code inside the frame and steady
            </Text>
          </View>
        </CameraView>
        <View style={styles.bottomBar}>
          <Button title="Pick QR from Gallery" onPress={pickImageAndScan} />
          <Button title="Cancel" onPress={onCancel} />
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: '#fff' }}>Scanning image...</Text>
          </View>
        )}
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
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#222',
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
  loadingOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default QRScannerScreen;