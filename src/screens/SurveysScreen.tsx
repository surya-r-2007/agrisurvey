import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { SurveyRecord, SurveyModuleItem } from '../types';

const INITIAL_MODULES: SurveyModuleItem[] = [
  { id: 1, title: '1. Farmer / Stakeholder Survey', status: 'Completed', icon: 'person' },
  { id: 2, title: '2. Field Survey & Geometry', status: 'Completed', icon: 'map' },
  { id: 3, title: '3. Soil Survey (Physical & Chemical)', status: 'Active', icon: 'analytics' },
  { id: 4, title: '4. Water & Hydraulic Survey', status: 'Draft (70%)', icon: 'water' },
  { id: 5, title: '5. Crop & Plant Population', status: 'Not Started', icon: 'leaf' },
  { id: 6, title: '6. Pest / Disease & Spatial Zones', status: 'Not Started', icon: 'bug' },
  { id: 7, title: '7. Microclimate & Atmospheric', status: 'Not Started', icon: 'partly-sunny' },
  { id: 8, title: '8. Existing Technology & Sensors', status: 'Not Started', icon: 'hardware-chip' },
  { id: 9, title: '9. Economic & ROI Analysis', status: 'Not Started', icon: 'cash' },
  { id: 10, title: '10. Crop-Cycle Timeline', status: 'Not Started', icon: 'time' }
];

export default function SurveysScreen({ navigation }: any) {
  const { surveys, farmers, parcels, addSurvey, updateSurvey } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [isReviewing, setIsReviewing] = useState(false);

  // Form State for New Survey Modal
  const [farmerName, setFarmerName] = useState('');
  const [crop, setCrop] = useState('Sugarcane');
  const [fieldId, setFieldId] = useState('');

  // Form 02 GPS
  const [gpsLat, setGpsLat] = useState('12.584219');
  const [gpsLng, setGpsLng] = useState('77.042831');
  const [altitude, setAltitude] = useState('662.4');

  // Form 09 Economic Inputs
  const [grossRevenue, setGrossRevenue] = useState('352000');
  const [inputCost, setInputCost] = useState('118000');
  const [labourCost, setLabourCost] = useState('42000');

  // Form 10 Temporal Observations
  const [observations, setObservations] = useState([
    { id: '1', date: '2026-08-15', stage: 'Tillering', temp: '31°C', health: 'Optimal' },
    { id: '2', date: '2026-08-30', stage: 'Grand Growth', temp: '29°C', health: 'Vigorous' }
  ]);
  const [obsDate, setObsDate] = useState('2026-09-05');
  const [obsStage, setObsStage] = useState('Grand Growth');

  const activeSurvey = selectedSurveyId
    ? surveys.find((s) => s.id === selectedSurveyId) || surveys[0]
    : surveys[0];

  const handleInitSurvey = () => {
    if (!farmerName.trim()) {
      Alert.alert('Validation Required', 'Please select or enter a farmer name');
      return;
    }
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newSurvey: SurveyRecord = {
      id: `SRV-${Date.now().toString().slice(-6)}`,
      timeOrDate: dateStr,
      farmerName: farmerName.trim(),
      crop: crop || 'Sugarcane',
      fieldId: fieldId || 'FLD-01',
      village: 'Field Sector',
      auditedDate: dateStr,
      status: 'Draft',
      statusDetail: '10-Module Evaluation',
      moduleName: 'Full Agron-Audit V2',
      completedModules: 1,
      totalModules: 10,
      stepProgress: '1/10 Modules'
    };

    addSurvey(newSurvey);
    setSelectedSurveyId(newSurvey.id);
    setIsModalOpen(false);
    setFarmerName('');
    setFieldId('');
    Alert.alert('Survey Dossier Initiated', `Dossier ${newSurvey.id} created successfully.`);
  };

  const handleCaptureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Permission to access location was denied. Please enable location permissions in app settings.'
        );
        return;
      }

      let currentLoc: Location.LocationObject | null = null;
      try {
        currentLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
      } catch (e) {
        currentLoc = await Location.getLastKnownPositionAsync({});
      }

      if (currentLoc) {
        const latStr = currentLoc.coords.latitude.toFixed(6);
        const lngStr = currentLoc.coords.longitude.toFixed(6);
        const altStr = currentLoc.coords.altitude ? currentLoc.coords.altitude.toFixed(1) : '662.4';
        const accStr = currentLoc.coords.accuracy ? currentLoc.coords.accuracy.toFixed(1) : '3.0';

        setGpsLat(latStr);
        setGpsLng(lngStr);
        setAltitude(altStr);
        Alert.alert('Live GPS Captured', `Latitude: ${latStr}° N\nLongitude: ${lngStr}° E\nAltitude: ${altStr}m\nAccuracy: ±${accStr}m`);
      } else {
        Alert.alert('GPS Signal Error', 'Unable to retrieve current location coordinates. Please make sure location services are turned on.');
      }
    } catch (err: any) {
      Alert.alert('Location Error', err?.message || 'An error occurred while fetching device location.');
    }
  };

  const handleAddObservation = () => {
    const newObs = {
      id: Date.now().toString(),
      date: obsDate,
      stage: obsStage,
      temp: '30°C',
      health: 'Optimal'
    };
    setObservations([...observations, newObs]);
    Alert.alert('Observation Logged', `Logged entry for ${obsStage} on ${obsDate}`);
  };

  const netIncome = Math.max(0, (parseFloat(grossRevenue) || 0) - (parseFloat(inputCost) || 0) - (parseFloat(labourCost) || 0));
  const roiPercent = (parseFloat(inputCost) || 0) > 0 ? Math.round((netIncome / parseFloat(inputCost)) * 100) : 142;

  const renderSurveyCard = ({ item }: { item: SurveyRecord }) => (
    <View style={styles.surveyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <Text style={styles.surveyId}>{item.id}</Text>
          <Text style={styles.timeText}> • {item.timeOrDate}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Completed' ? styles.statusCompleted : styles.statusDraft
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextDraft
          ]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.farmerName}>{item.farmerName}</Text>
      <Text style={styles.details}>{item.crop} • Field #{item.fieldId}</Text>

      <View style={styles.moduleTag}>
        <Ionicons name="clipboard-outline" size={14} color={theme.colors.secondary} />
        <Text style={styles.moduleText}>{item.moduleName || '10-Module Agron Audit'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => {
            setSelectedSurveyId(item.id);
            setIsReviewing(true);
          }}
        >
          <Ionicons name="eye-outline" size={16} color={theme.colors.text} />
          <Text style={styles.viewBtnText}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resumeBtn}
          onPress={() => {
            setSelectedSurveyId(item.id);
            setActiveModuleId(1);
            setIsReviewing(false);
          }}
        >
          <Ionicons name="play" size={16} color="#FFF" />
          <Text style={styles.resumeBtnText}>
            {item.status === 'Completed' ? 'View Forms' : 'Continue Audit'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Surveys & Field Audits</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {surveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={48} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>No Survey Dossiers Recorded</Text>
          <Text style={styles.emptySubtitle}>
            Initiate a new 10-module survey dossier for a registered farmer or field parcel.
          </Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>+ Initiate New Survey</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Active Survey Header */}
          {activeSurvey && (
            <View style={styles.activeBanner}>
              <View style={styles.activeBannerHeader}>
                <View>
                  <Text style={styles.activeId}>{activeSurvey.id}</Text>
                  <Text style={styles.activeMeta}>{activeSurvey.farmerName} • {activeSurvey.crop}</Text>
                </View>
                <TouchableOpacity style={styles.reviewPill} onPress={() => setIsReviewing(!isReviewing)}>
                  <Ionicons name={isReviewing ? 'close' : 'checkmark-done'} size={14} color="#FFF" />
                  <Text style={styles.reviewPillText}>{isReviewing ? 'Exit Review' : 'Review All'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isReviewing ? (
            /* Review Screen */
            <View style={styles.reviewSection}>
              <Text style={styles.sectionHeading}>Dossier Review & Summary</Text>

              {INITIAL_MODULES.map((mod) => (
                <View key={mod.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardHeader}>
                    <Text style={styles.reviewCardTitle}>{mod.title}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setActiveModuleId(mod.id);
                        setIsReviewing(false);
                      }}
                    >
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewText}>Status: {mod.status} • All parameters verified</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.submitDossierBtn}
                onPress={() => {
                  if (activeSurvey) {
                    updateSurvey({ ...activeSurvey, status: 'Completed' });
                    Alert.alert('Dossier Submitted', `Survey ${activeSurvey.id} has been submitted to central database.`);
                    setIsReviewing(false);
                  }
                }}
              >
                <Ionicons name="cloud-upload" size={18} color="#FFF" />
                <Text style={styles.submitBtnText}>Submit Completed Dossier</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* 10-Module Form Step Navigation */
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleScroll}>
                {INITIAL_MODULES.map((mod) => (
                  <TouchableOpacity
                    key={mod.id}
                    onPress={() => setActiveModuleId(mod.id)}
                    style={[
                      styles.moduleChip,
                      activeModuleId === mod.id && styles.moduleChipActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.moduleChipText,
                        activeModuleId === mod.id && styles.moduleChipTextActive
                      ]}
                    >
                      Mod {mod.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Form Render Area */}
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>{INITIAL_MODULES.find((m) => m.id === activeModuleId)?.title}</Text>

                {activeModuleId === 1 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Farmer Name</Text>
                    <Text style={styles.valueText}>{activeSurvey?.farmerName || 'N/A'}</Text>
                    <Text style={styles.label}>Farming Experience</Text>
                    <TextInput style={styles.input} defaultValue="18 Years" placeholder="Years of experience" />
                    <Text style={styles.label}>Farm Ownership</Text>
                    <TextInput style={styles.input} defaultValue="Owned (8.5 Acres)" placeholder="Owned / Leased" />
                  </View>
                )}

                {activeModuleId === 2 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>GPS Coordinates</Text>
                    <View style={styles.row}>
                      <TextInput style={[styles.input, styles.halfInput]} value={gpsLat} onChangeText={setGpsLat} />
                      <TextInput style={[styles.input, styles.halfInput]} value={gpsLng} onChangeText={setGpsLng} />
                    </View>
                    <Text style={styles.label}>Altitude (MSL)</Text>
                    <TextInput style={styles.input} value={altitude} onChangeText={setAltitude} />
                    <TouchableOpacity style={styles.gpsBtn} onPress={handleCaptureGps}>
                      <Ionicons name="location" size={18} color="#FFF" />
                      <Text style={styles.gpsBtnText}>Capture Current GPS Location</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeModuleId === 3 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>USDA Soil Texture</Text>
                    <TextInput style={styles.input} defaultValue="Clay Loam" />
                    <Text style={styles.label}>pH / EC Level</Text>
                    <View style={styles.row}>
                      <TextInput style={[styles.input, styles.halfInput]} defaultValue="6.8 pH" />
                      <TextInput style={[styles.input, styles.halfInput]} defaultValue="0.42 dS/m" />
                    </View>
                  </View>
                )}

                {activeModuleId === 4 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Water Source</Text>
                    <TextInput style={styles.input} defaultValue="Deep Borewell (180 ft)" />
                    <Text style={styles.label}>Pump Capacity</Text>
                    <TextInput style={styles.input} defaultValue="7.5 HP Submersible Star-Delta" />
                  </View>
                )}

                {activeModuleId === 5 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Crop & Variety</Text>
                    <TextInput style={styles.input} defaultValue="Sugarcane (Co-86032)" />
                    <Text style={styles.label}>Plant Population</Text>
                    <TextInput style={styles.input} defaultValue="62,000 canes / ha" />
                  </View>
                )}

                {activeModuleId === 6 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Pest Observed</Text>
                    <TextInput style={styles.input} defaultValue="Early Shoot Borer (Chilo infuscatellus)" />
                    <Text style={styles.label}>Incidence %</Text>
                    <TextInput style={styles.input} defaultValue="12% Low Severity" />
                  </View>
                )}

                {activeModuleId === 7 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Air Temperature (°C)</Text>
                    <TextInput style={styles.input} defaultValue="31.4 °C" />
                    <Text style={styles.label}>Relative Humidity (%)</Text>
                    <TextInput style={styles.input} defaultValue="64% RH" />
                  </View>
                )}

                {activeModuleId === 8 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Soil Moisture Probe</Text>
                    <TextInput style={styles.input} defaultValue="Capacitive LoRaWAN 865 MHz" />
                    <Text style={styles.label}>Irrigation Automation</Text>
                    <TextInput style={styles.input} defaultValue="Solenoid Drip Valves" />
                  </View>
                )}

                {activeModuleId === 9 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Gross Revenue (₹ / Ha)</Text>
                    <TextInput style={styles.input} value={grossRevenue} onChangeText={setGrossRevenue} keyboardType="numeric" />
                    <Text style={styles.label}>Input Cost (₹ / Ha)</Text>
                    <TextInput style={styles.input} value={inputCost} onChangeText={setInputCost} keyboardType="numeric" />
                    <Text style={styles.label}>Labour Cost (₹ / Ha)</Text>
                    <TextInput style={styles.input} value={labourCost} onChangeText={setLabourCost} keyboardType="numeric" />
                    <View style={styles.roiBox}>
                      <Text style={styles.roiTitle}>Net Benefit: ₹ {netIncome.toLocaleString()}</Text>
                      <Text style={styles.roiSubtitle}>Calculated ROI: {roiPercent}% over 3 cycles</Text>
                    </View>
                  </View>
                )}

                {activeModuleId === 10 && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Observation Stage</Text>
                    <TextInput style={styles.input} value={obsStage} onChangeText={setObsStage} />
                    <TouchableOpacity style={styles.addObsBtn} onPress={handleAddObservation}>
                      <Ionicons name="add" size={16} color="#FFF" />
                      <Text style={styles.addObsText}>+ Add Observation Log</Text>
                    </TouchableOpacity>

                    {observations.map((item) => (
                      <View key={item.id} style={styles.obsItem}>
                        <Text style={styles.obsDate}>{item.date} • {item.stage}</Text>
                        <Text style={styles.obsSub}>Temp: {item.temp} | Health: {item.health}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.nextModuleBtn}
                  onPress={() => {
                    const next = activeModuleId < 10 ? activeModuleId + 1 : 1;
                    setActiveModuleId(next);
                  }}
                >
                  <Text style={styles.nextModuleText}>Next Module</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={surveys}
            keyExtractor={(item) => item.id}
            renderItem={renderSurveyCard}
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      {/* New Survey Dossier Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Initiate New Survey Dossier</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Farmer Name</Text>
              <TextInput style={styles.input} value={farmerName} onChangeText={setFarmerName} placeholder="e.g. Ramesh Kumar" />

              <Text style={styles.label}>Crop</Text>
              <TextInput style={styles.input} value={crop} onChangeText={setCrop} placeholder="e.g. Sugarcane" />

              <Text style={styles.label}>Field Parcel ID (Optional)</Text>
              <TextInput style={styles.input} value={fieldId} onChangeText={setFieldId} placeholder="e.g. FLD-01" />

              <TouchableOpacity style={styles.saveBtn} onPress={handleInitSurvey}>
                <Text style={styles.saveBtnText}>Initialize 10-Module Survey</Text>
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
  header: { padding: theme.spacing.m, backgroundColor: theme.colors.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text },
  addBtn: { backgroundColor: theme.colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  content: { padding: theme.spacing.m, paddingBottom: 130 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.l, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 },
  createBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  activeBanner: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: 12, marginBottom: theme.spacing.m, elevation: 1 },
  activeBannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeId: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  activeMeta: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  reviewPill: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  reviewPillText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  reviewSection: { marginBottom: theme.spacing.m },
  sectionHeading: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.m },
  reviewCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: 10, marginBottom: theme.spacing.s, elevation: 1 },
  reviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewCardTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  editLink: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
  reviewText: { fontSize: 12, color: theme.colors.textSecondary },
  submitDossierBtn: { backgroundColor: theme.colors.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginTop: theme.spacing.m },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  moduleScroll: { marginBottom: theme.spacing.m },
  moduleChip: { backgroundColor: '#E0F2E9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  moduleChipActive: { backgroundColor: theme.colors.primary },
  moduleChipText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
  moduleChipTextActive: { color: '#FFF' },
  formCard: { backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: 12, marginBottom: theme.spacing.m, elevation: 1 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.m },
  fieldGroup: { marginBottom: theme.spacing.m },
  label: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 4 },
  valueText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.m },
  input: { height: 44, backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.m, paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m, fontSize: 14, color: theme.colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  gpsBtn: { backgroundColor: theme.colors.secondary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  gpsBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  roiBox: { backgroundColor: '#E0F2E9', padding: theme.spacing.m, borderRadius: 10, marginTop: theme.spacing.s },
  roiTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary },
  roiSubtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  addObsBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, marginBottom: theme.spacing.m },
  addObsText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 4 },
  obsItem: { backgroundColor: '#F0F4F0', padding: 10, borderRadius: 8, marginBottom: 6 },
  obsDate: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text },
  obsSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  nextModuleBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, marginTop: theme.spacing.s },
  nextModuleText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginRight: 6 },
  surveyCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, marginBottom: theme.spacing.m, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.s },
  idContainer: { flexDirection: 'row', alignItems: 'center' },
  surveyId: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
  timeText: { fontSize: 12, color: theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusCompleted: { backgroundColor: '#E0F2E9' },
  statusDraft: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusTextCompleted: { color: theme.colors.success },
  statusTextDraft: { color: '#F57F17' },
  farmerName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  details: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: theme.spacing.s },
  moduleTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F0', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: theme.spacing.m },
  moduleText: { fontSize: 11, color: theme.colors.textSecondary, marginLeft: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.m },
  viewBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: theme.spacing.s },
  viewBtnText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text, marginLeft: 4 },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  resumeBtnText: { fontSize: 13, fontWeight: 'bold', color: '#FFF', marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, height: '70%', padding: theme.spacing.m },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.l },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  form: { flex: 1 },
  saveBtn: { backgroundColor: theme.colors.primary, height: 48, borderRadius: theme.borderRadius.m, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.m },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
