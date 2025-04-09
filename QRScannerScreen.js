import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as ExpoCamera from 'expo-camera';
const { Camera } = ExpoCamera;

const QRScannerScreen = ({ onScanComplete, onCancel }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Remove check for !Camera—if the import isn’t working, this code won’t mount.
  if (hasPermission === null) {
    return <Text style={styles.message}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.message}>No access to camera</Text>;
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onScanComplete?.(data);
  };

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.instruction}>Scan the Quiz QR Code</Text>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        {scanned && (
          <TouchableOpacity onPress={() => setScanned(false)} style={styles.rescanButton}>
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    color: 'white',
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelText: { fontSize: 18, color: 'blue' },
  rescanButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  rescanText: { fontSize: 18, color: 'blue' },
  message: { flex: 1, alignSelf: 'center', justifyContent: 'center', fontSize: 18, marginTop: 40 },
});

export default QRScannerScreen;