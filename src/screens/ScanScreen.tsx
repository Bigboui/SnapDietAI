import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { aiService } from '../services/aiService';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';
import { RootStackParamList } from '../navigation/RootNavigator';

const { width: SW, height: SH } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ScanScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Scan line animation
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    scanLoop.start();

    // Pulse corner markers
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    return () => {
      scanLoop.stop();
      pulseLoop.stop();
    };
  }, []);

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const analysis = await aiService.analyzeFoodImage(capturedImage);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('NutritionResult', {
        analysisJson: JSON.stringify(analysis),
      });
    } catch (e) {
      setAnalyzing(false);
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please try again.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSubtitle}>
          FlashDiet AI needs camera access to analyze your meals.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.galleryFallbackBtn} onPress={handlePickImage}>
          <Text style={styles.galleryFallbackText}>📁 Use Photo Library Instead</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: capturedImage }} style={styles.previewImage} />

        <LinearGradient
          colors={['transparent', 'rgba(10,10,15,0.95)']}
          style={styles.previewOverlay}
        >
          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <View style={styles.analyzingSpinner}>
                <ActivityIndicator color={COLORS.primary} size="large" />
              </View>
              <Text style={styles.analyzingTitle}>🤖 AI Analyzing Your Meal...</Text>
              <Text style={styles.analyzingSubtitle}>
                Detecting ingredients, calculating macros, scoring health...
              </Text>
              <View style={styles.analyzingDots}>
                {['Calories', 'Protein', 'Carbs', 'Fat', 'Health Score'].map((label, i) => (
                  <View key={label} style={styles.analyzingDot}>
                    <ActivityIndicator
                      color={COLORS.primary}
                      size="small"
                      style={{ opacity: 0.6 + i * 0.08 }}
                    />
                    <Text style={styles.analyzingDotLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.previewActions}>
              <Text style={styles.previewTitle}>Ready to analyze?</Text>
              <Text style={styles.previewSubtitle}>
                Make sure the meal is clearly visible
              </Text>
              <View style={styles.previewButtons}>
                <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                  <Text style={styles.retakeBtnText}>↩ Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
                  <LinearGradient
                    colors={['#00D68F', '#00B07A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.analyzeGradient}
                  >
                    <Text style={styles.analyzeBtnText}>🤖 Analyze Meal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Header */}
        <SafeAreaView style={styles.cameraHeader}>
          <TouchableOpacity style={styles.closeBtn2} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText2}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Snap Your Meal</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

        {/* Viewfinder */}
        <View style={styles.viewfinderContainer}>
          <Animated.View style={[styles.cornerTL, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.cornerTR, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.cornerBL, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.cornerBR, { opacity: pulseAnim }]} />

          {/* Scan line */}
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineY }] },
            ]}
          />
        </View>

        {/* Bottom Controls */}
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage}>
            <Text style={styles.galleryBtnIcon}>🖼</Text>
            <Text style={styles.galleryBtnLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
            <View style={styles.captureBtnOuter}>
              <View style={styles.captureBtnInner} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryBtn}
            onPress={() => navigation.navigate('Barcode')}
          >
            <Text style={styles.galleryBtnIcon}>📊</Text>
            <Text style={styles.galleryBtnLabel}>Barcode</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Point camera at your meal for instant AI analysis</Text>
      </CameraView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  cameraTitle: {
    fontSize: FONT.sizes.lg,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  closeBtn2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText2: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: FONT.weights.bold,
  },
  viewfinderContainer: {
    alignSelf: 'center',
    width: SW * 0.8,
    height: 280,
    marginTop: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primary,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
    marginTop: 60,
  },
  galleryBtn: {
    alignItems: 'center',
    gap: 4,
  },
  galleryBtnIcon: {
    fontSize: 30,
  },
  galleryBtnLabel: {
    fontSize: FONT.sizes.xs,
    color: COLORS.white,
    fontWeight: FONT.weights.medium,
  },
  captureBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.6)',
    fontSize: FONT.sizes.sm,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  // Preview
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: SPACING.lg,
  },
  previewActions: {
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.sm,
  },
  previewSubtitle: {
    fontSize: FONT.sizes.md,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  retakeBtnText: {
    color: COLORS.white,
    fontWeight: FONT.weights.semibold,
    fontSize: FONT.sizes.md,
  },
  analyzeBtn: {
    flex: 2,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  analyzeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  analyzeBtnText: {
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    fontSize: FONT.sizes.md,
  },
  // Analyzing
  analyzingContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  analyzingSpinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  analyzingTitle: {
    fontSize: FONT.sizes.xl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: FONT.sizes.md,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  analyzingDots: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  analyzingDot: {
    alignItems: 'center',
    gap: 4,
  },
  analyzingDotLabel: {
    fontSize: FONT.sizes.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  permissionEmoji: {
    fontSize: 72,
    marginBottom: SPACING.lg,
  },
  permissionTitle: {
    fontSize: FONT.sizes.xxl,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  permissionBtnText: {
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
    fontSize: FONT.sizes.lg,
  },
  galleryFallbackBtn: {
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  galleryFallbackText: {
    color: COLORS.primary,
    fontSize: FONT.sizes.md,
    fontWeight: FONT.weights.semibold,
  },
  closeBtn: {
    paddingVertical: SPACING.md,
  },
  closeBtnText: {
    color: COLORS.secondaryText,
    fontSize: FONT.sizes.md,
  },
});
