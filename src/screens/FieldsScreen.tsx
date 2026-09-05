import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { FieldParcel } from '../types';

export default function FieldsScreen() {
  const { parcels, addParcel } = useStore();
  const [selectedParcel, setSelectedParcel] = useState<FieldParcel | null>(parcels[0] || null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 12.5239,
    longitude: 76.8951,
    latitudeDelta: 0.0422,
    longitudeDelta: 0.0221,
  });

  // Modal State for Add Field Parcel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [cropType, setCropType] = useState('Sugarcane');
  const [hectares, setHectares] = useState('2.5');
  const [waterSource, setWaterSource] = useState('Borewell (7.5 HP)');
  const [drainage, setDrainage] = useState('Subsurface Drains');

  const getLiveLocation = async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable Location / GPS services on your mobile device to view your position on the map.'
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission was denied. Please allow location access in your phone settings.'
        );
        return;
      }

      let currentLocation: Location.LocationObject | null = null;
      try {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (e) {
        currentLocation = await Location.getLastKnownPositionAsync({});
      }

      if (currentLocation) {
        setLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      }
    } catch (err: any) {
      Alert.alert('Location Error', err?.message || 'Failed to obtain live location.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && isMounted) {
          const loc = await Location.getLastKnownPositionAsync({});
          if (loc && isMounted) {
            setLocation(loc);
            setRegion({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            });
          }
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (newLocation) => {
              if (isMounted) {
                setLocation(newLocation);
              }
            }
          );
        }
      } catch (e) {
        // Safe non-blocking catch
      }
    };

    initLocation();

    return () => {
      isMounted = false;
      if (subscription) subscription.remove();
    };
  }, []);

  const handleAddField = () => {
    if (!fieldName.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid Field / Parcel Name.');
      return;
    }

    const newParcel: FieldParcel = {
      id: `FLD-${Date.now().toString().slice(-4)}`,
      name: fieldName.trim(),
      crop: cropType || 'Sugarcane',
      hectares: parseFloat(hectares) || 1.0,
      status: 'Optimal',
      owner: ownerName.trim() || 'Ramesh Kumar',
      ownerCode: 'FARMER-01',
      farmId: 'FARM-01',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtifkS6dh3YRQ4xErgXOWt8z94WYbV8DoNi8mEH-lr-07qIB5r96Tw4Ok2z2OvgnjDeENhX_G_Ks7c3_uYcRaYQtJYIJbMIN5a-BfWVy2BRuzFD9nbDLVmoM9ltSm9KXGWS9KUwcEGJqlj2vWqzV6LdJdC8bmBDA-ZoX-G4EUaLxavt1L4WarSLmdsIuw9yNqjq7ApDhluauj7OzCDYpGapKFmsabu810481oX-k4guL-5IsYT73PK',
      perimeterMeters: Math.round((parseFloat(hectares) || 1.0) * 400),
      gpsAccuracy: location ? `±${location.coords.accuracy?.toFixed(1)}m` : '±1.2m',
      shape: 'Irregular Quadrilateral',
      boundaryStructure: 'Live Hedge & Trench',
      highestElev: '668m MSL',
      lowestElev: '662m MSL',
      slope: '1.2%',
      slopeFlow: 'North-East',
      surfaceTilth: 'Fine Tilth',
      tilthNote: 'Well cultivated',
      erosionRisk: 'Low',
      erosionNote: 'Contour ploughed',
      waterlogging: 'None',
      waterloggingNote: 'Good drainage',
      drainage: drainage || 'Subsurface Drains',
      drainageNote: 'Operational',
      waterSource: waterSource || 'Borewell (7.5 HP)',
      pumpingUnit: 'Star-Delta Submersible',
      lateralSpecs: '16mm Drip 0.4m spacing',
      primaryFiltration: 'Disc Filter 120 Mesh'
    };

    addParcel(newParcel);
    setSelectedParcel(newParcel);
    setIsModalOpen(false);
    setFieldName('');
    setOwnerName('');
    Alert.alert('Field Parcel Created', `Field "${newParcel.name}" (${newParcel.id}) added successfully!`);
  };

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
      {/* Header bar with Add Field button */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Fields & GIS Mapping</Text>
        <TouchableOpacity style={styles.addBtnHeader} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>+ Add Field</Text>
        </TouchableOpacity>
      </View>

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
                : ' Tap to Fetch GPS'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locateBtn} onPress={getLiveLocation}>
          <Ionicons name="locate" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Mapped Parcels ({parcels.length})</Text>
          <TouchableOpacity onPress={() => setIsModalOpen(true)}>
            <Text style={styles.addInlineText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        {parcels.length === 0 ? (
          <TouchableOpacity style={styles.emptyCard} onPress={() => setIsModalOpen(true)}>
            <Ionicons name="map-outline" size={28} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>No Field Parcels Registered</Text>
            <Text style={styles.emptySub}>Tap here to register your first agricultural field parcel.</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={parcels}
            keyExtractor={(item) => item.id}
            renderItem={renderParcelItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
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

      {/* Add Field Parcel Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>+ Register New Field Parcel</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Field / Parcel Name *</Text>
              <TextInput 
                style={styles.input} 
                value={fieldName} 
                onChangeText={setFieldName} 
                placeholder="e.g. North Plot Sugarcane #3" 
              />

              <Text style={styles.label}>Farmer / Owner Name</Text>
              <TextInput 
                style={styles.input} 
                value={ownerName} 
                onChangeText={setOwnerName} 
                placeholder="e.g. Ramesh Kumar" 
              />

              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Crop Type</Text>
                  <TextInput 
                    style={styles.input} 
                    value={cropType} 
                    onChangeText={setCropType} 
                    placeholder="e.g. Sugarcane" 
                  />
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Area (Hectares)</Text>
                  <TextInput 
                    style={styles.input} 
                    value={hectares} 
                    onChangeText={setHectares} 
                    keyboardType="numeric" 
                    placeholder="2.5" 
                  />
                </View>
              </View>

              <Text style={styles.label}>Water Source</Text>
              <TextInput 
                style={styles.input} 
                value={waterSource} 
                onChangeText={setWaterSource} 
                placeholder="e.g. Borewell 7.5 HP / Canal" 
              />

              <Text style={styles.label}>Drainage Infrastructure</Text>
              <TextInput 
                style={styles.input} 
                value={drainage} 
                onChangeText={setDrainage} 
                placeholder="e.g. Subsurface Drains" 
              />

              <TouchableOpacity style={styles.gpsCaptureBtn} onPress={getLiveLocation}>
                <Ionicons name="location" size={16} color="#FFF" />
                <Text style={styles.gpsCaptureBtnText}>Use Current Device GPS</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddField}>
                <Text style={styles.saveBtnText}>Save & Register Parcel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    elevation: 2
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  addBtnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 4 },
  mapContainer: { height: height * 0.35, width: '100%', position: 'relative' },
  map: { flex: 1 },
  liveMarker: { alignItems: 'center', justifyContent: 'center' },
  mapOverlay: { position: 'absolute', top: 12, left: 12, right: 12, alignItems: 'center' },
  gpsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2E9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 4 },
  gpsText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.secondary },
  locateBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#FFF', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  listContainer: { paddingVertical: theme.spacing.s, backgroundColor: theme.colors.surface },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: theme.spacing.m },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginHorizontal: theme.spacing.m, marginBottom: theme.spacing.xs || 4, color: theme.colors.text },
  addInlineText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary },
  list: { paddingHorizontal: theme.spacing.m },
  emptyCard: { marginHorizontal: theme.spacing.m, padding: theme.spacing.m, backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.m, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginTop: 4 },
  emptySub: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 2 },
  parcelCard: { width: 200, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.m, padding: theme.spacing.m, marginRight: theme.spacing.m, borderWidth: 1, borderColor: theme.colors.border },
  parcelCardSelected: { borderColor: theme.colors.primary, backgroundColor: '#F0F4F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  parcelName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, flex: 1 },
  badge: { backgroundColor: '#E0F2E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: 'bold' },
  parcelDetails: { fontSize: 12, color: theme.colors.textSecondary },
  detailsContainer: { padding: theme.spacing.m, flex: 1 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailBox: { width: '48%', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.s, elevation: 1 },
  detailLabel: { fontSize: 11, color: theme.colors.textSecondary, marginBottom: 2 },
  detailValue: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, maxHeight: '80%', padding: theme.spacing.m },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.primary },
  formScroll: { flexGrow: 0 },
  label: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 4 },
  input: { height: 44, backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.m, paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m, fontSize: 14, color: theme.colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCol: { width: '48%' },
  gpsCaptureBtn: { backgroundColor: theme.colors.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m },
  gpsCaptureBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  saveBtn: { backgroundColor: theme.colors.primary, height: 48, borderRadius: theme.borderRadius.m, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.m },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
