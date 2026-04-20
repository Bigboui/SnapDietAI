import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { aiService } from '../services/aiService';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function BarcodeScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBarcodeScan = async (result: BarcodeScanningResult) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const analysis = await aiService.analyzeBarcodeFood(result.data);
      navigation.replace('NutritionResult', { analysisJson: JSON.stringify(analysis) });
    } catch {
      Alert.alert('Scan Failed', 'Could not find this product. Try scanning again.', [
        { text: 'Try Again', onPress: () => { setScanned(false); setLoading(false); } },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permContainer}>
        <Text style={styles.permEmoji}>📊</Text>
        <Text style={styles.permTitle}>Camera needed for barcode scanning</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128'] }}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Barcode Scanner</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.viewfinder}>
            <View style={styles.corner_TL} />
            <View style={styles.corner_TR} />
            <View style={styles.corner_BL} />
            <View style={styles.corner_BR} />
          </View>

          <View style={styles.footer}>
            {loading ? (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.scanningText}>Looking up product...</Text>
              </View>
            ) : (
              <Text style={styles.hint}>Point at the barcode on food packaging</Text>
            )}
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 18, fontWeight: FONT.weights.bold },
  title: { color: '#fff', fontSize: FONT.sizes.lg, fontWeight: FONT.weights.bold },
  viewfinder: {
    alignSelf: 'center', width: 280, height: 180,
    marginTop: 80, position: 'relative',
  },
  corner_TL: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary },
  corner_TR: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary },
  corner_BL: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: COLORS.primary },
  corner_BR: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: COLORS.primary },
  footer: { position: 'absolute', bottom: 80, left: 0, right: 0, alignItems: 'center' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: FONT.sizes.md, textAlign: 'center' },
  scanningIndicator: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: RADIUS.lg, padding: SPACING.md },
  scanningText: { color: COLORS.white, fontSize: FONT.sizes.md },
  permContainer: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  permEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  permTitle: { fontSize: FONT.sizes.xl, color: COLORS.white, fontWeight: FONT.weights.bold, textAlign: 'center', marginBottom: SPACING.xl },
  permBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, marginBottom: SPACING.md },
  permBtnText: { color: COLORS.white, fontWeight: FONT.weights.bold, fontSize: FONT.sizes.md },
  backLink: { color: COLORS.secondaryText, fontSize: FONT.sizes.md },
});
