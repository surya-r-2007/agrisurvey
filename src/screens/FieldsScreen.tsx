import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { FieldParcel, LocationHierarchySelection } from '../types';
import LocationSelector from '../components/LocationSelector';

export default function FieldsScreen({ navigation }: any) {
  const { parcels, addParcel } = useStore();
  const [selectedParcel, setSelectedParcel] = useState<FieldParcel | null>(parcels[0] || null);
  const [liveLocation, setLiveLocation] = useState<Location.LocationObject | null>(null);

  // Modal State for Add Field Parcel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [cropType, setCropType] = useState('');
  const [hectares, setHectares] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [drainage, setDrainage] = useState('');
  const [parcelLocation, setParcelLocation] = useState<LocationHierarchySelection>({
    districtId: '',
    districtName: '',
    talukId: '',
    talukName: '',
    villageId: '',
    villageName: ''
  });

  const getLiveLocation = async () => {
    try {
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please enable Location / GPS services on your mobile device.'
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission was denied. Please allow location access in settings.'
        );
        return;
      }

      let currentLocation: Location.LocationObject | null = null;
      try {
        currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch (e) {
        currentLocation = await Location.getLastKnownPositionAsync({});
      }

      if (currentLocation) {
        setLiveLocation(currentLocation);
        Alert.alert(
          'Live GPS Captured',
          `Latitude: ${currentLocation.coords.latitude.toFixed(6)}° N\nLongitude: ${currentLocation.coords.longitude.toFixed(6)}° E\nAltitude: ${currentLocation.coords.altitude ? `${currentLocation.coords.altitude.toFixed(1)}m` : 'N/A'}\nAccuracy: ±${currentLocation.coords.accuracy?.toFixed(1) || '3.0'}m`
        );
      }
    } catch (err: any) {
      Alert.alert('Location Error', err?.message || 'Failed to obtain live location.');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && isMounted) {
          const loc = await Location.getLastKnownPositionAsync({});
          if (loc && isMounted) {
            setLiveLocation(loc);
          }
        }
      } catch (e) {
        // Safe non-blocking catch
      }
    };
    initLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddField = () => {
    if (!fieldName.trim()) {
      Alert.alert('Validation Error', 'Please enter a valid Field / Parcel Name.');
      return;
    }
    if (!ownerName.trim()) {
      Alert.alert('Validation Error', 'Please enter Farmer / Owner Name.');
      return;
    }
    if (!cropType.trim()) {
      Alert.alert('Validation Error', 'Please enter Crop Type.');
      return;
    }
    if (!hectares.trim() || isNaN(Number(hectares))) {
      Alert.alert('Validation Error', 'Please enter valid area in Hectares.');
      return;
    }

    const nextId = parcels.length + 1;
    const parcelId = `FLD-${String(nextId).padStart(3, '0')}`;
    const newParcel: FieldParcel = {
      id: parcelId,
      name: fieldName.trim(),
      crop: cropType.trim(),
      hectares: Number(hectares),
      vigourPercent: 88,
      vigourStatus: 'Optimal',
      status: 'Optimal',
      owner: ownerName.trim(),
      ownerCode: `FMR-REG-${nextId}`,
      farmId: `FRM-${nextId}`,
      imageUrl: '',
      perimeterMeters: Math.round(Number(hectares) * 400),
      gpsAccuracy: liveLocation ? `±${liveLocation.coords.accuracy?.toFixed(1) || 2.5}m` : '±3.0m',
      shape: 'Rectangular',
      boundaryStructure: 'Live Hedge / Trench',
      highestElev: liveLocation?.coords.altitude ? `${liveLocation.coords.altitude.toFixed(0)}m` : '285m',
      lowestElev: liveLocation?.coords.altitude ? `${(liveLocation.coords.altitude - 4).toFixed(0)}m` : '281m',
      slope: '1.2%',
      slopeFlow: 'South-East',
      surfaceTilth: 'Fine granular tilth',
      tilthNote: 'Well ploughed',
      erosionRisk: 'Low',
      erosionNote: 'Protected by bunds',
      waterlogging: 'None',
      waterloggingNote: 'Good natural slope',
      drainage: drainage.trim() || 'Natural drainage',
      drainageNote: 'Adequate runoff',
      waterSource: waterSource.trim() || 'Borewell',
      pumpingUnit: '7.5 HP Submersible',
      lateralSpecs: '16mm inline drippers @ 40cm',
      primaryFiltration: 'Disc Filter 50m³/hr',
      districtId: parcelLocation.districtId,
      talukId: parcelLocation.talukId,
      villageId: parcelLocation.villageId
    };

    addParcel(newParcel);
    setSelectedParcel(newParcel);
    setIsModalOpen(false);

    // Reset inputs
    setFieldName('');
    setOwnerName('');
    setCropType('');
    setHectares('');
    setWaterSource('');
    setDrainage('');
    setParcelLocation({
      districtId: '',
      districtName: '',
      talukId: '',
      talukName: '',
      villageId: '',
      villageName: ''
    });

    Alert.alert('Field Parcel Added', `Parcel ${newParcel.id} (${newParcel.name}) registered successfully.`);
  };

  const renderParcelCard = ({ item }: { item: FieldParcel }) => {
    const isSelected = selectedParcel?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.parcelCard, isSelected && styles.parcelCardSelected]}
        onPress={() => setSelectedParcel(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.parcelName}>{item.name}</Text>
          <View style={[styles.statusBadge, item.status === 'Optimal' ? styles.statusOptimal : styles.statusAlert]}>
            <Text style={[styles.statusText, item.status === 'Optimal' ? styles.statusTextOptimal : styles.statusTextAlert]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.parcelOwner}>Owner: {item.owner} ({item.ownerCode})</Text>
        <Text style={styles.cropText}>{item.crop} • {item.hectares} ha</Text>

        <View style={styles.specRow}>
          <View style={styles.specItem}>
            <Ionicons name="water-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.specText}>{item.waterSource}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="locate-outline" size={14} color={theme.colors.secondary} />
            <Text style={styles.specText}>{item.gpsAccuracy}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Field Parcels & Cadastre</Text>
          <Text style={styles.headerSubtitle}>GIS Geometry, Irrigation Layout & Telemetry</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Live GPS Telemetry Strip */}
        <View style={styles.gpsStrip}>
          <View style={styles.gpsInfo}>
            <Ionicons name="navigate-circle" size={24} color={theme.colors.primary} />
            <View>
              <Text style={styles.gpsTitle}>Device GPS Telemetry</Text>
              {liveLocation ? (
                <Text style={styles.gpsCoords}>
                  {liveLocation.coords.latitude.toFixed(6)}° N, {liveLocation.coords.longitude.toFixed(6)}° E (±{liveLocation.coords.accuracy?.toFixed(1)}m)
                </Text>
              ) : (
                <Text style={styles.gpsCoordsNone}>No live GPS acquired yet</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.gpsCaptureBtn} onPress={getLiveLocation}>
            <Ionicons name="refresh" size={16} color="#FFF" />
            <Text style={styles.gpsCaptureBtnText}>Get GPS</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Field Parcel Details Card */}
        {selectedParcel && (
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View>
                <Text style={styles.detailId}>{selectedParcel.id}</Text>
                <Text style={styles.detailTitle}>{selectedParcel.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.surveyShortcutBtn}
                onPress={() => navigation.navigate('Surveys')}
              >
                <Ionicons name="clipboard-outline" size={16} color="#FFF" />
                <Text style={styles.surveyShortcutText}>Audit Form 02</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Owner: <Text style={styles.metaVal}>{selectedParcel.owner}</Text></Text>
              <Text style={styles.metaLabel}>Crop: <Text style={styles.metaVal}>{selectedParcel.crop}</Text></Text>
              <Text style={styles.metaLabel}>Area: <Text style={styles.metaVal}>{selectedParcel.hectares} ha</Text></Text>
            </View>

            <View style={styles.specsGrid}>
              <View style={styles.specBox}>
                <Text style={styles.specBoxLabel}>Slope / Elevation</Text>
                <Text style={styles.specBoxVal}>{selectedParcel.slope} ({selectedParcel.highestElev})</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specBoxLabel}>Drainage</Text>
                <Text style={styles.specBoxVal}>{selectedParcel.drainage}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specBoxLabel}>Water Source</Text>
                <Text style={styles.specBoxVal}>{selectedParcel.waterSource}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specBoxLabel}>Pump Unit</Text>
                <Text style={styles.specBoxVal}>{selectedParcel.pumpingUnit}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Parcels List */}
        <Text style={styles.sectionHeading}>Registered Parcels ({parcels.length})</Text>
        {parcels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={48} color={theme.colors.primary} />
            <Text style={styles.emptyTitle}>No Field Parcels Mapped</Text>
            <Text style={styles.emptySubtitle}>
              Register a field plot with area, water source, and administrative location.
            </Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
              <Ionicons name="add-circle-outline" size={18} color="#FFF" />
              <Text style={styles.createBtnText}>+ Register Field Parcel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={parcels}
            keyExtractor={(item) => item.id}
            renderItem={renderParcelCard}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Add Parcel Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register Field Parcel</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Field / Parcel Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. North Sector Sugarcane Plot"
                value={fieldName}
                onChangeText={setFieldName}
              />

              <Text style={styles.label}>Farmer / Owner Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Owner name"
                value={ownerName}
                onChangeText={setOwnerName}
              />

              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Crop Type *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Sugarcane"
                    value={cropType}
                    onChangeText={setCropType}
                  />
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Area (Hectares) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2.5"
                    keyboardType="numeric"
                    value={hectares}
                    onChangeText={setHectares}
                  />
                </View>
              </View>

              {/* Universal Location Selector */}
              <LocationSelector
                title="Field Location Hierarchy"
                initialSelection={parcelLocation}
                onLocationChange={(loc) => setParcelLocation(loc)}
              />

              <Text style={styles.label}>Water Source & Pump</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Borewell (7.5 HP Submersible)"
                value={waterSource}
                onChangeText={setWaterSource}
              />

              <Text style={styles.label}>Drainage System</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Open field ditch / Subsurface"
                value={drainage}
                onChangeText={setDrainage}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddField}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={styles.saveBtnText}>Save Field Parcel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  headerSubtitle: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  addBtn: {
    backgroundColor: theme.colors.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: theme.spacing.m, paddingBottom: 130 },
  gpsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  gpsInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  gpsTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  gpsCoords: { fontSize: 11, color: '#166534', fontWeight: '500' },
  gpsCoordsNone: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic' },
  gpsCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  gpsCaptureBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  detailCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  detailId: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  detailTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  surveyShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  surveyShortcutText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaLabel: { fontSize: 12, color: theme.colors.textSecondary },
  metaVal: { fontWeight: '700', color: theme.colors.text },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    width: '48%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specBoxLabel: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  specBoxVal: { fontSize: 12, color: '#1E293B', fontWeight: '700', marginTop: 2 },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 10 },
  parcelCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  parcelCardSelected: { borderColor: theme.colors.primary, backgroundColor: '#F0FDF4' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  parcelName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusOptimal: { backgroundColor: '#D1FAE5' },
  statusAlert: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextOptimal: { color: '#065F46' },
  statusTextAlert: { color: '#991B1B' },
  parcelOwner: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  cropText: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
  specRow: { flexDirection: 'row', gap: 16, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  specItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specText: { fontSize: 11, color: '#64748B' },
  emptyContainer: { alignItems: 'center', padding: 32, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 16 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  formScroll: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: theme.colors.text,
  },
  row: { flexDirection: 'row', gap: 10 },
  halfCol: { flex: 1 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.m,
    marginTop: 8,
    marginBottom: 24,
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
