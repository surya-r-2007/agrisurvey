import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { GeotaggedPhoto } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GeotagPhotoCaptureProps {
  photos?: GeotaggedPhoto[];
  onChange: (photos: GeotaggedPhoto[]) => void;
  title?: string;
  description?: string;
  category?: GeotaggedPhoto['category'];
  maxPhotos?: number;
  singleMode?: boolean;
}

export default function GeotagPhotoCapture({
  photos = [],
  onChange,
  title = 'Geotagged Photographic Evidence',
  description = 'Capture photos with verified GPS coordinates and timestamp.',
  category = 'general',
  maxPhotos = 8,
  singleMode = false
}: GeotagPhotoCaptureProps) {
  const [loading, setLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState<GeotaggedPhoto | null>(null);

  // Helper to get GPS location with high accuracy
  const fetchCurrentGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      return loc?.coords || null;
    } catch {
      try {
        const lastLoc = await Location.getLastKnownPositionAsync();
        return lastLoc?.coords || null;
      } catch {
        return null;
      }
    }
  };

  const handleTakePhoto = async () => {
    if (!singleMode && photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos Reached', `You can attach up to ${maxPhotos} photos.`);
      return;
    }

    try {
      setLoading(true);

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Access Required',
          'Camera permission is required to capture field evidence photos.'
        );
        setLoading(false);
        return;
      }

      // Concurrently query GPS while launching camera for instant coordinates
      const gpsPromise = fetchCurrentGps();

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
        base64: true,
        exif: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false);
        return;
      }

      const asset = result.assets[0];
      const coords = await gpsPromise;

      const formattedDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const newPhoto: GeotaggedPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        uri: asset.uri,
        base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
        timestamp: formattedDate,
        latitude: coords ? Number(coords.latitude.toFixed(6)) : null,
        longitude: coords ? Number(coords.longitude.toFixed(6)) : null,
        altitude: coords?.altitude ? Number(coords.altitude.toFixed(1)) : null,
        accuracy: coords?.accuracy ? Number(coords.accuracy.toFixed(1)) : null,
        category,
        caption: ''
      };

      if (singleMode) {
        onChange([newPhoto]);
      } else {
        onChange([...photos, newPhoto]);
      }

      const gpsStatus = coords
        ? `📍 Geotagged: ${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E (±${coords.accuracy?.toFixed(1) ?? '3'}m)`
        : '⚠️ Photo saved without GPS lock';

      if (Platform.OS !== 'web') {
        Alert.alert('Photo Captured', gpsStatus);
      }
    } catch (err: any) {
      Alert.alert('Capture Error', err?.message || 'Could not capture photo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickPhoto = async () => {
    if (!singleMode && photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos Reached', `You can attach up to ${maxPhotos} photos.`);
      return;
    }

    try {
      setLoading(true);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Gallery Access Required',
          'Permission to access device photos is required.'
        );
        setLoading(false);
        return;
      }

      const gpsPromise = fetchCurrentGps();

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.7,
        base64: true,
        exif: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false);
        return;
      }

      const asset = result.assets[0];
      const coords = await gpsPromise;

      const formattedDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const newPhoto: GeotaggedPhoto = {
        id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        uri: asset.uri,
        base64: asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : undefined,
        timestamp: formattedDate,
        latitude: coords ? Number(coords.latitude.toFixed(6)) : null,
        longitude: coords ? Number(coords.longitude.toFixed(6)) : null,
        altitude: coords?.altitude ? Number(coords.altitude.toFixed(1)) : null,
        accuracy: coords?.accuracy ? Number(coords.accuracy.toFixed(1)) : null,
        category,
        caption: ''
      };

      if (singleMode) {
        onChange([newPhoto]);
      } else {
        onChange([...photos, newPhoto]);
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', err?.message || 'Could not pick photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove this geotagged photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onChange(photos.filter((p) => p.id !== photoId));
            if (activePhoto?.id === photoId) {
              setActivePhoto(null);
            }
          }
        }
      ]
    );
  };

  const handleUpdateCaption = (photoId: string, caption: string) => {
    const updated = photos.map((p) => (p.id === photoId ? { ...p, caption } : p));
    onChange(updated);
    if (activePhoto?.id === photoId) {
      setActivePhoto({ ...activePhoto, caption });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.countBadge}>
            {photos.length} {singleMode ? '' : `/ ${maxPhotos}`}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={handleTakePhoto}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="camera" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>Take Geotagged Photo</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.secondaryBtn]}
          onPress={handlePickPhoto}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="images-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.secondaryBtnText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Photo Cards Grid / List */}
      {photos.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="location-outline" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>No geotagged photos attached yet.</Text>
          <Text style={styles.emptySubText}>
            Tap "Take Geotagged Photo" to capture live photos with verified GPS coordinates.
          </Text>
        </View>
      ) : (
        <View style={styles.photosGrid}>
          {photos.map((item, idx) => {
            const hasGps = item.latitude !== null && item.longitude !== null;
            return (
              <View key={item.id} style={styles.photoCard}>
                {/* Thumbnail with Zoom Click */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setActivePhoto(item)}
                  style={styles.imageWrapper}
                >
                  <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="cover" />
                  <View style={styles.zoomPill}>
                    <Ionicons name="expand" size={13} color="#FFFFFF" />
                  </View>
                  <View style={styles.idxPill}>
                    <Text style={styles.idxPillText}>#{idx + 1}</Text>
                  </View>
                </TouchableOpacity>

                {/* Metadata & Controls */}
                <View style={styles.photoInfo}>
                  {/* GPS Pill */}
                  <View style={[styles.gpsPill, hasGps ? styles.gpsPillValid : styles.gpsPillMissing]}>
                    <Ionicons
                      name={hasGps ? 'location' : 'alert-circle'}
                      size={13}
                      color={hasGps ? theme.colors.primary : theme.colors.error}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.gpsText, !hasGps && { color: theme.colors.error }]}
                      numberOfLines={1}
                    >
                      {hasGps
                        ? `${item.latitude?.toFixed(5)}°, ${item.longitude?.toFixed(5)}°${
                            item.accuracy ? ` (±${item.accuracy}m)` : ''
                          }`
                        : 'No GPS Lock'}
                    </Text>
                  </View>

                  {/* Timestamp & Altitude */}
                  <View style={styles.metaRow}>
                    <Text style={styles.timeText} numberOfLines={1}>
                      🕒 {item.timestamp}
                    </Text>
                    {item.altitude !== null && item.altitude !== undefined ? (
                      <Text style={styles.elevText}>⛰️ {item.altitude}m</Text>
                    ) : null}
                  </View>

                  {/* Caption Input */}
                  <View style={styles.captionWrapper}>
                    <TextInput
                      style={styles.captionInput}
                      value={item.caption || ''}
                      onChangeText={(val) => handleUpdateCaption(item.id, val)}
                      placeholder="Add observation caption (e.g. NW boundary)..."
                      placeholderTextColor="#999"
                    />
                  </View>

                  {/* Action Bar */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => setActivePhoto(item)}
                    >
                      <Ionicons name="eye-outline" size={14} color={theme.colors.primary} />
                      <Text style={styles.viewDetailsText}>Inspect</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeletePhoto(item.id)}
                    >
                      <Ionicons name="trash-outline" size={14} color={theme.colors.error} />
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Fullscreen Inspection Modal */}
      <Modal
        visible={!!activePhoto}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActivePhoto(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Geotagged Evidence Inspection</Text>
                <Text style={styles.modalSub}>{activePhoto?.timestamp}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setActivePhoto(null)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {activePhoto && (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                <Image
                  source={{ uri: activePhoto.uri }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />

                {/* Coordinate Audit Box */}
                <View style={styles.auditBox}>
                  <Text style={styles.auditBoxTitle}>📍 GEODETIC TELEMETRY</Text>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Latitude:</Text>
                    <Text style={styles.auditVal}>
                      {activePhoto.latitude !== null ? `${activePhoto.latitude}° N` : 'Unavailable'}
                    </Text>
                  </View>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Longitude:</Text>
                    <Text style={styles.auditVal}>
                      {activePhoto.longitude !== null ? `${activePhoto.longitude}° E` : 'Unavailable'}
                    </Text>
                  </View>
                  {activePhoto.altitude !== null && (
                    <View style={styles.auditRow}>
                      <Text style={styles.auditLabel}>Elevation (ASL):</Text>
                      <Text style={styles.auditVal}>{activePhoto.altitude} meters</Text>
                    </View>
                  )}
                  {activePhoto.accuracy !== null && (
                    <View style={styles.auditRow}>
                      <Text style={styles.auditLabel}>GPS Accuracy:</Text>
                      <Text style={styles.auditVal}>±{activePhoto.accuracy} meters</Text>
                    </View>
                  )}
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Audit Category:</Text>
                    <Text style={[styles.auditVal, { textTransform: 'capitalize' }]}>
                      {activePhoto.category?.replace('_', ' ') || 'General'}
                    </Text>
                  </View>
                  <View style={styles.auditRow}>
                    <Text style={styles.auditLabel}>Timestamp:</Text>
                    <Text style={styles.auditVal}>{activePhoto.timestamp}</Text>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.auditLabel}>Field Notes / Caption:</Text>
                    <TextInput
                      style={styles.modalCaptionInput}
                      value={activePhoto.caption || ''}
                      onChangeText={(val) => handleUpdateCaption(activePhoto.id, val)}
                      placeholder="Add specific notes or observations about this image..."
                      placeholderTextColor="#777"
                      multiline
                    />
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E8F5E9',
    borderRadius: 12
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  primaryBtn: {
    flex: 1.6,
    backgroundColor: theme.colors.primary
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#EDF5EE',
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  secondaryBtnText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600'
  },
  emptyCard: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text
  },
  emptySubText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 3,
    maxWidth: 260
  },
  photosGrid: {
    gap: 12,
    marginTop: 6
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E6E4',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#F0F0F0'
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  zoomPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    padding: 6
  },
  idxPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(5,96,58,0.85)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3
  },
  idxPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  photoInfo: {
    padding: 10
  },
  gpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 6
  },
  gpsPillValid: {
    backgroundColor: '#E8F5E9'
  },
  gpsPillMissing: {
    backgroundColor: '#FFEBEE'
  },
  gpsText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    flex: 1
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  timeText: {
    fontSize: 11,
    color: theme.colors.textSecondary
  },
  elevText: {
    fontSize: 11,
    color: theme.colors.textSecondary
  },
  captionWrapper: {
    marginBottom: 8
  },
  captionInput: {
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#DFE5DF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: theme.colors.text
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.error
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center'
  },
  modalContent: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  modalSub: {
    fontSize: 12,
    color: '#A0A0A0'
  },
  modalCloseBtn: {
    padding: 6
  },
  fullImage: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    marginBottom: 14
  },
  auditBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333'
  },
  auditBoxTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#81C784',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A'
  },
  auditLabel: {
    fontSize: 12,
    color: '#BBB'
  },
  auditVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF'
  },
  modalCaptionInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
    color: '#FFF',
    minHeight: 60,
    marginTop: 6,
    textAlignVertical: 'top'
  }
});
