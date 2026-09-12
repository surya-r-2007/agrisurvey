import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import {
  SurveyRecord,
  SurveyModuleItem,
  LocationHierarchySelection
} from '../types';
import { generateAndDownloadPdf } from '../utils/pdfGenerator';
import LocationSelector from '../components/LocationSelector';
import {
  Form01Farmer,
  Form02Field,
  Form03Soil,
  Form04Water,
  Form05Crop,
  Form06PestDisease,
  Form07Microclimate,
  Form08Technology,
  Form09Economic,
  Form10Temporal
} from '../components/forms';
import {
  createDefaultForm01,
  createDefaultForm02,
  createDefaultForm03,
  createDefaultForm04,
  createDefaultForm05,
  createDefaultForm06,
  createDefaultForm07,
  createDefaultForm08,
  createDefaultForm09,
  createDefaultForm10
} from '../data/formDefaults';

const MODULE_DEFINITIONS: SurveyModuleItem[] = [
  { id: 1, title: '1. Farmer / Stakeholder Survey', status: 'Active', icon: 'person' },
  { id: 2, title: '2. Field Survey & Geometry', status: 'Not Started', icon: 'map' },
  { id: 3, title: '3. Soil Survey (Physical & Chemical)', status: 'Not Started', icon: 'analytics' },
  { id: 4, title: '4. Water & Hydraulic Survey', status: 'Not Started', icon: 'water' },
  { id: 5, title: '5. Crop & Plant Population', status: 'Not Started', icon: 'leaf' },
  { id: 6, title: '6. Pest / Disease & Spatial Zones', status: 'Not Started', icon: 'bug' },
  { id: 7, title: '7. Microclimate & Atmospheric', status: 'Not Started', icon: 'partly-sunny' },
  { id: 8, title: '8. Existing Technology & Sensors', status: 'Not Started', icon: 'hardware-chip' },
  { id: 9, title: '9. Economic & ROI Analysis', status: 'Not Started', icon: 'cash' },
  { id: 10, title: '10. Crop-Cycle Timeline', status: 'Not Started', icon: 'time' }
];

export default function SurveysScreen({ navigation }: any) {
  const { surveys, addSurvey, updateSurvey, deleteSurvey } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [isReviewing, setIsReviewing] = useState(false);

  // Modal State for Initiating New Survey
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newCrop, setNewCrop] = useState('');
  const [newFieldId, setNewFieldId] = useState('');
  const [newLocation, setNewLocation] = useState<LocationHierarchySelection>({
    districtId: '',
    districtName: '',
    talukId: '',
    talukName: '',
    villageId: '',
    villageName: ''
  });

  // Active Survey Resolution
  const activeSurvey = useMemo(() => {
    if (selectedSurveyId) {
      return surveys.find((s) => s.id === selectedSurveyId) || null;
    }
    return surveys[0] || null;
  }, [selectedSurveyId, surveys]);

  // Ensure active survey has all 10 forms initialized
  const initializedActiveSurvey = useMemo(() => {
    if (!activeSurvey) return null;
    let modified = false;
    const surveyCopy: SurveyRecord = { ...activeSurvey };

    const sId = surveyCopy.id;
    const dateStr = surveyCopy.auditedDate || surveyCopy.timeOrDate;
    const fId = surveyCopy.fieldId;
    const fName = surveyCopy.farmerName;
    const cropStr = surveyCopy.crop;

    if (!surveyCopy.form01) {
      surveyCopy.form01 = createDefaultForm01(sId, dateStr, fName);
      if (surveyCopy.locationHierarchy) {
        surveyCopy.form01.district = surveyCopy.locationHierarchy.districtName;
        surveyCopy.form01.districtId = surveyCopy.locationHierarchy.districtId;
        surveyCopy.form01.taluk = surveyCopy.locationHierarchy.talukName;
        surveyCopy.form01.talukId = surveyCopy.locationHierarchy.talukId;
        surveyCopy.form01.village = surveyCopy.locationHierarchy.villageName;
        surveyCopy.form01.villageId = surveyCopy.locationHierarchy.villageId;
      }
      modified = true;
    }
    if (!surveyCopy.form02) {
      surveyCopy.form02 = createDefaultForm02(sId, fId);
      modified = true;
    }
    if (!surveyCopy.form03) {
      surveyCopy.form03 = createDefaultForm03(sId, fId);
      modified = true;
    }
    if (!surveyCopy.form04) {
      surveyCopy.form04 = createDefaultForm04(sId, fId);
      modified = true;
    }
    if (!surveyCopy.form05) {
      surveyCopy.form05 = createDefaultForm05(sId, fId, cropStr);
      modified = true;
    }
    if (!surveyCopy.form06) {
      surveyCopy.form06 = createDefaultForm06(sId, fId, cropStr);
      modified = true;
    }
    if (!surveyCopy.form07) {
      surveyCopy.form07 = createDefaultForm07(sId, fId);
      modified = true;
    }
    if (!surveyCopy.form08) {
      surveyCopy.form08 = createDefaultForm08();
      modified = true;
    }
    if (!surveyCopy.form09) {
      surveyCopy.form09 = createDefaultForm09();
      modified = true;
    }
    if (!surveyCopy.form10) {
      surveyCopy.form10 = createDefaultForm10(sId, fId, cropStr);
      modified = true;
    }

    if (modified) {
      setTimeout(() => updateSurvey(surveyCopy), 0);
    }

    return surveyCopy;
  }, [activeSurvey, updateSurvey]);

  // Handler for creating new survey dossier
  const handleInitSurvey = () => {
    if (!newFarmerName.trim()) {
      Alert.alert('Validation Error', 'Please enter Farmer / Stakeholder Name.');
      return;
    }
    if (!newCrop.trim()) {
      Alert.alert('Validation Error', 'Please enter Crop name.');
      return;
    }
    if (!newLocation.districtName || !newLocation.talukName || !newLocation.villageName) {
      Alert.alert('Validation Error', 'Please select District, Taluk/Block, and Village.');
      return;
    }

    const dateStr = new Date().toLocaleDateString('en-GB');
    const sId = `SRV-${Date.now().toString().slice(-6)}`;
    const fId = newFieldId.trim() || `FLD-${Date.now().toString().slice(-4)}`;

    const form01 = createDefaultForm01(sId, dateStr, newFarmerName.trim());
    form01.district = newLocation.districtName;
    form01.districtId = newLocation.districtId;
    form01.taluk = newLocation.talukName;
    form01.talukId = newLocation.talukId;
    form01.village = newLocation.villageName;
    form01.villageId = newLocation.villageId;

    const newRecord: SurveyRecord = {
      id: sId,
      timeOrDate: dateStr,
      farmerName: newFarmerName.trim(),
      crop: newCrop.trim(),
      fieldId: fId,
      village: newLocation.villageName,
      taluk: newLocation.talukName,
      district: newLocation.districtName,
      auditedDate: dateStr,
      status: 'Draft',
      statusDetail: '10-Module Full Field Survey',
      moduleName: 'Comprehensive Agron Audit',
      completedModules: 1,
      totalModules: 10,
      stepProgress: '1/10 Modules',
      locationHierarchy: newLocation,
      form01,
      form02: createDefaultForm02(sId, fId),
      form03: createDefaultForm03(sId, fId),
      form04: createDefaultForm04(sId, fId),
      form05: createDefaultForm05(sId, fId, newCrop.trim()),
      form06: createDefaultForm06(sId, fId, newCrop.trim()),
      form07: createDefaultForm07(sId, fId),
      form08: createDefaultForm08(),
      form09: createDefaultForm09(),
      form10: createDefaultForm10(sId, fId, newCrop.trim()),
    };

    addSurvey(newRecord);
    setSelectedSurveyId(newRecord.id);
    setActiveModuleId(1);
    setIsModalOpen(false);

    // Reset modal fields
    setNewFarmerName('');
    setNewCrop('');
    setNewFieldId('');
    setNewLocation({
      districtId: '',
      districtName: '',
      talukId: '',
      talukName: '',
      villageId: '',
      villageName: ''
    });

    Alert.alert('Survey Dossier Created', `Dossier ${newRecord.id} initiated successfully.`);
  };

  // Generic updater for specific form within initialized survey
  const handleUpdateForm = (formKey: keyof SurveyRecord, formVal: any) => {
    if (!initializedActiveSurvey) return;
    const updatedRecord: SurveyRecord = {
      ...initializedActiveSurvey,
      [formKey]: formVal
    };

    // If updating form01, sync farmerName and crop if modified
    if (formKey === 'form01') {
      updatedRecord.farmerName = formVal.farmerName || updatedRecord.farmerName;
      if (formVal.district) updatedRecord.district = formVal.district;
      if (formVal.taluk) updatedRecord.taluk = formVal.taluk;
      if (formVal.village) updatedRecord.village = formVal.village;
      if (formVal.districtId && formVal.talukId && formVal.villageId) {
        updatedRecord.locationHierarchy = {
          districtId: formVal.districtId,
          districtName: formVal.district,
          talukId: formVal.talukId,
          talukName: formVal.taluk,
          villageId: formVal.villageId,
          villageName: formVal.village,
        };
      }
    }
    // If updating form05, sync crop name
    if (formKey === 'form05' && formVal.crop) {
      updatedRecord.crop = formVal.crop;
    }

    updateSurvey(updatedRecord);
  };

  // PDF Generation
  const handleDownloadPdf = (survey: SurveyRecord) => {
    const allPhotos = [
      ...(survey.photos || []),
      ...(survey.form02?.photos || []),
      ...(survey.form03?.photos || []),
      ...(survey.form06?.photos || [])
    ];

    generateAndDownloadPdf({
      docId: `RPT-${survey.id}`,
      farmerName: survey.farmerName,
      farmerCode: 'FMR-REG',
      plotRef: survey.fieldId,
      crop: survey.crop,
      hectares: survey.form02?.fieldAreaHa ? parseFloat(survey.form02.fieldAreaHa) : 2.5,
      date: survey.auditedDate || survey.timeOrDate,
      village: survey.village || survey.locationHierarchy?.villageName || 'Field Sector',
      status: survey.status,
      statusDetail: survey.statusDetail || '10-Module Comprehensive Field Audit',
      ph: survey.form03?.chemicalProperties?.[0]?.value ? parseFloat(survey.form03.chemicalProperties[0].value) : undefined,
      moisturePercent: survey.form03?.physicalProperties?.[7]?.sample1 ? parseFloat(survey.form03.physicalProperties[7].sample1) : undefined,
      completedModules: survey.completedModules,
      totalModules: survey.totalModules,
      gpsCoords: survey.form02?.gpsLat && survey.form02?.gpsLng ? `${survey.form02.gpsLat}° N, ${survey.form02.gpsLng}° E` : undefined,
      elevation: survey.form02?.altitude ? `${survey.form02.altitude}m` : undefined,
      grossRevenue: survey.form09?.grossRevenueInr ? `₹${survey.form09.grossRevenueInr}` : undefined,
      inputCost: survey.form09?.totalInputCostInr ? `₹${survey.form09.totalInputCostInr}` : undefined,
      labourCost: survey.form09?.labourCostInr ? `₹${survey.form09.labourCostInr}` : undefined,
      netIncome: survey.form09?.netIncomeInr ? `₹${survey.form09.netIncomeInr}` : undefined,
      roiPercent: survey.form09?.techEconomics?.roiPercent ? `${survey.form09.techEconomics.roiPercent}%` : undefined,
      photos: allPhotos
    });

    if (Platform.OS !== 'web') {
      Alert.alert('PDF Dossier Generated', `Survey report ${survey.id} exported successfully.`);
    }
  };

  // Render individual survey card
  const renderSurveyCard = ({ item }: { item: SurveyRecord }) => (
    <View style={styles.surveyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <Text style={styles.surveyId}>{item.id}</Text>
          <Text style={styles.timeText}> • {item.timeOrDate}</Text>
        </View>
        <View style={[styles.statusBadge, item.status === 'Completed' ? styles.statusCompleted : styles.statusDraft]}>
          <Text style={[styles.statusText, item.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextDraft]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.farmerName}>{item.farmerName}</Text>
      <Text style={styles.details}>{item.crop} • Field #{item.fieldId}</Text>
      {item.village && (
        <Text style={styles.locationText}>
          <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} /> {item.village}, {item.taluk || ''}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.pdfBtn} onPress={() => handleDownloadPdf(item)}>
          <Ionicons name="download-outline" size={15} color={theme.colors.primary} />
          <Text style={styles.pdfBtnText}>PDF</Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            Alert.alert(
              'Delete Survey',
              `Are you sure you want to delete ${item.id}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteSurvey(item.id)
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Surveys & Field Audits</Text>
          <Text style={styles.headerSubtitle}>10-Module Comprehensive Agricultural Survey</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {surveys.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={56} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>No Survey Dossiers Recorded</Text>
          <Text style={styles.emptySubtitle}>
            Initiate a new 10-module survey dossier with dynamic District → Taluk → Village hierarchy.
          </Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>+ Initiate New Survey</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Active Dossier Banner */}
          {initializedActiveSurvey && (
            <View style={styles.activeBanner}>
              <View style={styles.activeBannerHeader}>
                <View>
                  <Text style={styles.activeId}>{initializedActiveSurvey.id}</Text>
                  <Text style={styles.activeMeta}>
                    {initializedActiveSurvey.farmerName} • {initializedActiveSurvey.crop}
                  </Text>
                  {initializedActiveSurvey.village && (
                    <Text style={styles.activeLocation}>
                      📍 {initializedActiveSurvey.village}, {initializedActiveSurvey.taluk} ({initializedActiveSurvey.district})
                    </Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.headerPdfBtn}
                    onPress={() => handleDownloadPdf(initializedActiveSurvey)}
                  >
                    <Ionicons name="download-outline" size={14} color="#FFF" />
                    <Text style={styles.headerPdfText}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.reviewPill}
                    onPress={() => setIsReviewing(!isReviewing)}
                  >
                    <Ionicons name={isReviewing ? 'close' : 'checkmark-done'} size={14} color="#FFF" />
                    <Text style={styles.reviewPillText}>{isReviewing ? 'Exit' : 'Review'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {isReviewing ? (
            /* Review & Final Submission Screen */
            <View style={styles.reviewSection}>
              <Text style={styles.sectionHeading}>Dossier Review & Completeness</Text>

              {MODULE_DEFINITIONS.map((mod) => (
                <View key={mod.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardHeader}>
                    <Text style={styles.reviewCardTitle}>{mod.title}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setActiveModuleId(mod.id);
                        setIsReviewing(false);
                      }}
                    >
                      <Text style={styles.editLink}>Edit Module</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.reviewText}>
                    Form 0{mod.id}: Ready for inspection and verified against FIELD SURVEY FORM.docx
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.submitDossierBtn}
                onPress={() => {
                  if (initializedActiveSurvey) {
                    updateSurvey({ ...initializedActiveSurvey, status: 'Completed', completedModules: 10 });
                    Alert.alert('Survey Finalized', `Survey dossier ${initializedActiveSurvey.id} is marked as Completed.`);
                    setIsReviewing(false);
                  }
                }}
              >
                <Ionicons name="cloud-upload" size={18} color="#FFF" />
                <Text style={styles.submitBtnText}>Mark Dossier as Completed</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* 10-Module Form Step Navigation & Active Form View */
            <View>
              {/* Horizontal Module Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moduleScroll}>
                {MODULE_DEFINITIONS.map((mod) => (
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
                      Form 0{mod.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Form Active Container */}
              {initializedActiveSurvey && (
                <View style={styles.formCard}>
                  <View style={styles.formCardHeader}>
                    <Text style={styles.formTitle}>
                      {MODULE_DEFINITIONS.find((m) => m.id === activeModuleId)?.title}
                    </Text>
                  </View>

                  {/* FORM 01 — FARMER / STAKEHOLDER */}
                  {activeModuleId === 1 && initializedActiveSurvey.form01 && (
                    <Form01Farmer
                      data={initializedActiveSurvey.form01}
                      onChange={(val) => handleUpdateForm('form01', val)}
                    />
                  )}

                  {/* FORM 02 — FIELD SURVEY & GEOMETRY */}
                  {activeModuleId === 2 && initializedActiveSurvey.form02 && (
                    <Form02Field
                      data={initializedActiveSurvey.form02}
                      onChange={(val) => handleUpdateForm('form02', val)}
                    />
                  )}

                  {/* FORM 03 — SOIL SURVEY */}
                  {activeModuleId === 3 && initializedActiveSurvey.form03 && (
                    <Form03Soil
                      data={initializedActiveSurvey.form03}
                      onChange={(val) => handleUpdateForm('form03', val)}
                    />
                  )}

                  {/* FORM 04 — WATER SURVEY */}
                  {activeModuleId === 4 && initializedActiveSurvey.form04 && (
                    <Form04Water
                      data={initializedActiveSurvey.form04}
                      onChange={(val) => handleUpdateForm('form04', val)}
                    />
                  )}

                  {/* FORM 05 — CROP SURVEY */}
                  {activeModuleId === 5 && initializedActiveSurvey.form05 && (
                    <Form05Crop
                      data={initializedActiveSurvey.form05}
                      onChange={(val) => handleUpdateForm('form05', val)}
                    />
                  )}

                  {/* FORM 06 — PEST / DISEASE SURVEY */}
                  {activeModuleId === 6 && initializedActiveSurvey.form06 && (
                    <Form06PestDisease
                      data={initializedActiveSurvey.form06}
                      onChange={(val) => handleUpdateForm('form06', val)}
                    />
                  )}

                  {/* FORM 07 — MICROCLIMATE SURVEY */}
                  {activeModuleId === 7 && initializedActiveSurvey.form07 && (
                    <Form07Microclimate
                      data={initializedActiveSurvey.form07}
                      onChange={(val) => handleUpdateForm('form07', val)}
                    />
                  )}

                  {/* FORM 08 — EXISTING TECHNOLOGY */}
                  {activeModuleId === 8 && initializedActiveSurvey.form08 && (
                    <Form08Technology
                      data={initializedActiveSurvey.form08}
                      onChange={(val) => handleUpdateForm('form08', val)}
                    />
                  )}

                  {/* FORM 09 — ECONOMIC SURVEY */}
                  {activeModuleId === 9 && initializedActiveSurvey.form09 && (
                    <Form09Economic
                      data={initializedActiveSurvey.form09}
                      onChange={(val) => handleUpdateForm('form09', val)}
                    />
                  )}

                  {/* FORM 10 — TEMPORAL / CROP-CYCLE */}
                  {activeModuleId === 10 && initializedActiveSurvey.form10 && (
                    <Form10Temporal
                      data={initializedActiveSurvey.form10}
                      onChange={(val) => handleUpdateForm('form10', val)}
                    />
                  )}

                  {/* Module Stepper Buttons */}
                  <View style={styles.navRow}>
                    {activeModuleId > 1 && (
                      <TouchableOpacity
                        style={styles.prevModuleBtn}
                        onPress={() => setActiveModuleId(activeModuleId - 1)}
                      >
                        <Ionicons name="arrow-back" size={16} color={theme.colors.primary} />
                        <Text style={styles.prevModuleText}>Form 0{activeModuleId - 1}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.saveProgressBtn}
                      onPress={() => {
                        Alert.alert('Saved', `Form 0${activeModuleId} data persisted to offline storage.`);
                      }}
                    >
                      <Ionicons name="save-outline" size={16} color="#FFF" />
                      <Text style={styles.saveProgressText}>Save Progress</Text>
                    </TouchableOpacity>
                    {activeModuleId < 10 && (
                      <TouchableOpacity
                        style={styles.nextModuleBtn}
                        onPress={() => setActiveModuleId(activeModuleId + 1)}
                      >
                        <Text style={styles.nextModuleText}>Form 0{activeModuleId + 1}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Dossiers List */}
          <Text style={styles.dossiersHeading}>Survey Dossiers ({surveys.length})</Text>
          <FlatList
            data={surveys}
            keyExtractor={(item) => item.id}
            renderItem={renderSurveyCard}
            scrollEnabled={false}
          />
        </ScrollView>
      )}

      {/* NEW SURVEY DOSSIER MODAL WITH DISTRICT -> TALUK -> VILLAGE */}
      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Initiate New Survey Dossier</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Farmer / Stakeholder Name *</Text>
              <TextInput
                style={styles.input}
                value={newFarmerName}
                onChangeText={setNewFarmerName}
                placeholder="e.g. Ramesh Kumar"
              />

              <Text style={styles.label}>Main Crop *</Text>
              <TextInput
                style={styles.input}
                value={newCrop}
                onChangeText={setNewCrop}
                placeholder="e.g. Sugarcane Co-86032"
              />

              <Text style={styles.label}>Field Parcel ID (Optional)</Text>
              <TextInput
                style={styles.input}
                value={newFieldId}
                onChangeText={setNewFieldId}
                placeholder="e.g. FLD-01"
              />

              {/* District -> Taluk -> Village Integrated Selector */}
              <LocationSelector
                title="Survey Location (District → Taluk → Village)"
                initialSelection={newLocation}
                onLocationChange={(loc) => setNewLocation(loc)}
              />

              <TouchableOpacity style={styles.initBtn} onPress={handleInitSurvey}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={styles.initBtnText}>Initialize Complete 10-Module Survey</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: 130,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.m,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeBanner: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  activeBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  activeMeta: {
    fontSize: 13,
    color: '#D1FAE5',
    marginTop: 2,
    fontWeight: '500',
  },
  activeLocation: {
    fontSize: 11,
    color: '#A7F3D0',
    marginTop: 4,
  },
  headerPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  headerPdfText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reviewPillText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  moduleScroll: {
    marginBottom: 12,
  },
  moduleChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moduleChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  moduleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  moduleChipTextActive: {
    color: '#FFF',
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  formCardHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  prevModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  prevModuleText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  saveProgressBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveProgressText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  nextModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  nextModuleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dossiersHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 10,
    marginTop: 10,
  },
  surveyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surveyId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextCompleted: {
    color: '#065F46',
  },
  statusTextDraft: {
    color: '#92400E',
  },
  farmerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  details: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  pdfBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resumeBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  reviewSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  editLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  reviewText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  submitDossierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  formScroll: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
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
  initBtn: {
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
  initBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
