/**
 * HissabKitaab — Receipt Capture Screen
 * Camera/gallery picker with image preview and upload button
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme/typography';
import { Button } from '../../components';
import { uploadReceipt } from '../../api/uploads';
import type { CaptureStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<CaptureStackParamList, 'CaptureHome'>;

interface SelectedImage {
  uri: string;
  fileName: string;
  type: string;
}

export default function CaptureScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {return;}
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to pick image');
      return;
    }
    const asset = response.assets?.[0];
    if (asset?.uri) {
      setSelectedImage({
        uri: asset.uri,
        fileName: asset.fileName || 'receipt.jpg',
        type: asset.type || 'image/jpeg',
      });
    }
  };

  const openCamera = () => {
    launchCamera(
      { mediaType: 'photo', quality: 0.8, maxWidth: 2000, maxHeight: 2000 },
      handleResponse,
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, maxWidth: 2000, maxHeight: 2000 },
      handleResponse,
    );
  };

  const handleUpload = async () => {
    if (!selectedImage) {return;}
    setUploading(true);
    try {
      const result = await uploadReceipt(
        selectedImage.uri,
        selectedImage.fileName,
        selectedImage.type,
      );
      navigation.navigate('ReceiptResult', { result });
    } catch (err: any) {
      Alert.alert(
        'Upload Failed',
        err?.response?.data?.error?.message || err.message || 'Something went wrong',
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Scan Receipt</Text>
        <Text style={styles.subtitle}>
          Take a photo or choose from gallery to extract expense data
        </Text>
      </View>

      {/* Image Preview Area */}
      <View style={styles.previewArea}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSelectedImage(null)}>
              <Icon name="close" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconCircle}>
              <Icon name="receipt-long" size={48} color={colors.primary} />
            </View>
            <Text style={styles.placeholderText}>No receipt selected</Text>
            <Text style={styles.placeholderDesc}>
              Use the camera or gallery buttons below
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.captureButton} onPress={openCamera} activeOpacity={0.8}>
          <View style={styles.captureIconWrap}>
            <Icon name="photo-camera" size={28} color={colors.white} />
          </View>
          <Text style={styles.captureLabel}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={openGallery} activeOpacity={0.8}>
          <View style={[styles.captureIconWrap, { backgroundColor: colors.accent }]}>
            <Icon name="photo-library" size={28} color={colors.white} />
          </View>
          <Text style={styles.captureLabel}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Button */}
      {selectedImage && (
        <View style={styles.uploadArea}>
          <Button
            title={uploading ? 'Analyzing Receipt...' : 'Upload & Scan'}
            onPress={handleUpload}
            loading={uploading}
            disabled={uploading}
            icon={!uploading ? <Icon name="cloud-upload" size={20} color={colors.white} /> : undefined}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  previewArea: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    minHeight: 300,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 350,
    backgroundColor: colors.backgroundSecondary,
  },
  clearButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  placeholderText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  placeholderDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  captureButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  captureIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  captureLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  uploadArea: {
    marginTop: spacing.sm,
  },
});
