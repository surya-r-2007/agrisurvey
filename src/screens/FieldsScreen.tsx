import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { FieldParcel } from '../types';

export default function FieldsScreen() {
  const { parcels } = useStore();
  const [selectedParcel, setSelectedParcel] = useState<FieldParcel | null>(parcels[0] || null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 12.5239,
    longitude: 76.8951,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0221,
  });

  const getLiveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    } catch (err: any) {
      // Fallback
    }
  };

  useEffect(() => {
    getLiveLocation();
    let subscription: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      }
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const renderParcelItem = ({ item }: { item: FieldParcel }) => (
    <TouchableOpacity
      style={[
        styles.parcelCard,
        selectedParcel?.id === item.id && styles.parcelCardSelected
      ]}
      onPress={() => setSelectedParcel(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.parcelName}>{item.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.parcelDetails}>{item.crop} • {item.hectares} ha</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
        >
          {location && (
            <>
              <Marker 
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
                }}
                title="Live Device Location"
                description={`Accuracy: ±${location.coords.accuracy?.toFixed(1) || '1.0'}m`}
              >
                <View style={styles.liveMarker}>
                  <Ionicons name="navigate-circle" size={32} color={theme.colors.secondary} />
                </View>
              </Marker>
              <Circle
                center={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude
                }}
                radius={location.coords.accuracy || 10}
                fillColor="rgba(0, 108, 72, 0.15)"
                strokeColor={theme.colors.secondary}
              />
            </>
          )}
        </MapView>

        {/* Live GPS Overlay Header */}
        <View style={styles.mapOverlay}>
          <TouchableOpacity style={styles.gpsBadge} onPress={getLiveLocation}>
            <Ionicons name="radio" size={16} color={theme.colors.secondary} />
            <Text style={styles.gpsText}>
              {location 
                ? ` LIVE GPS: ${location.coords.latitude.toFixed(4)}°, ${location.coords.longitude.toFixed(4)}° (±${location.coords.accuracy?.toFixed(1)}m)`
                : ' Fetching Live GPS...'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locateBtn} onPress={getLiveLocation}>
          <Ionicons name="locate" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Mapped Parcels ({parcels.length})</Text>
        <FlatList
          data={parcels}
          keyExtractor={(item) => item.id}
          renderItem={renderParcelItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
      
      {selectedParcel && (
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Parcel Details: {selectedParcel.id}</Text>
          <View style={styles.detailGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Owner</Text>
              <Text style={styles.detailValue}>{selectedParcel.owner}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Water Source</Text>
              <Text style={styles.detailValue}>{selectedParcel.waterSource}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Live GPS Accuracy</Text>
              <Text style={styles.detailValue}>
                {location ? `±${location.coords.accuracy?.toFixed(1)}m` : selectedParcel.gpsAccuracy}
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Drainage</Text>
              <Text style={styles.detailValue}>{selectedParcel.drainage}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  mapContainer: { height: height * 0.4, width: '100%', position: 'relative' },
  map: { flex: 1 },
  liveMarker: { alignItems: 'center', justifyContent: 'center' },
  mapOverlay: { position: 'absolute', top: 16, left: 16, right: 16, alignItems: 'center' },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2E9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 4 },
  gpsText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.secondary },
  locateBtn: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#FFF', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  listContainer: { paddingVertical: theme.spacing.m, backgroundColor: theme.colors.surface },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: theme.spacing.m, marginBottom: theme.spacing.s, color: theme.colors.text },
  list: { paddingHorizontal: theme.spacing.m },
  parcelCard: { width: 220, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m, padding: theme.spacing.m, marginRight: theme.spacing.m, borderWidth: 1, borderColor: theme.colors.border },
  parcelCardSelected: { borderColor: theme.colors.primary, backgroundColor: '#F0F4F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  parcelName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, flex: 1 },
  badge: { backgroundColor: '#E0F2E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: 'bold' },
  parcelDetails: { fontSize: 12, color: theme.colors.textSecondary },
  detailsContainer: { padding: theme.spacing.m, flex: 1 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailBox: { width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m, elevation: 1 },
  detailLabel: { fontSize: 11, color: theme.colors.textSecondary, marginBottom: 4 },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text }
});
