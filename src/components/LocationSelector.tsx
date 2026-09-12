import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';
import { District, Taluk, Village, LocationHierarchySelection } from '../types';
import {
  MASTER_DISTRICTS,
  getTaluksByDistrictId,
  getVillagesByTalukId,
  normalizeLocationName
} from '../data/locationData';
import { useStore } from '../store/useStore';

interface LocationSelectorProps {
  initialSelection?: Partial<LocationHierarchySelection>;
  onLocationChange: (selection: LocationHierarchySelection) => void;
  title?: string;
  compact?: boolean;
}

type ModalType = 'district' | 'taluk' | 'village' | 'add-taluk' | 'add-village' | null;

export default function LocationSelector({
  initialSelection,
  onLocationChange,
  title = 'Administrative Location',
  compact = false
}: LocationSelectorProps) {
  const { customTaluks, customVillages, addCustomTaluk, addCustomVillage } = useStore();

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(() => {
    if (initialSelection?.districtId) {
      return MASTER_DISTRICTS.find((d) => d.id === initialSelection.districtId) || null;
    }
    if (initialSelection?.districtName) {
      return (
        MASTER_DISTRICTS.find(
          (d) => normalizeLocationName(d.name) === normalizeLocationName(initialSelection.districtName!)
        ) || null
      );
    }
    return null;
  });

  const [selectedTaluk, setSelectedTaluk] = useState<Taluk | null>(() => {
    if (initialSelection?.talukId) {
      const taluks = initialSelection.districtId
        ? getTaluksByDistrictId(initialSelection.districtId, customTaluks)
        : [];
      return taluks.find((t) => t.id === initialSelection.talukId) || null;
    }
    if (initialSelection?.talukName && initialSelection.districtId) {
      const taluks = getTaluksByDistrictId(initialSelection.districtId, customTaluks);
      return (
        taluks.find(
          (t) => normalizeLocationName(t.name) === normalizeLocationName(initialSelection.talukName!)
        ) || null
      );
    }
    return null;
  });

  const [selectedVillage, setSelectedVillage] = useState<Village | null>(() => {
    if (initialSelection?.villageId && initialSelection.talukId) {
      const villages = getVillagesByTalukId(initialSelection.talukId, customVillages);
      return villages.find((v) => v.id === initialSelection.villageId) || null;
    }
    if (initialSelection?.villageName && initialSelection.talukId) {
      const villages = getVillagesByTalukId(initialSelection.talukId, customVillages);
      return (
        villages.find(
          (v) => normalizeLocationName(v.name) === normalizeLocationName(initialSelection.villageName!)
        ) || null
      );
    }
    return null;
  });

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTalukName, setNewTalukName] = useState('');
  const [newVillageName, setNewVillageName] = useState('');

  // Available Taluks strictly filtered by selected District (including custom taluks)
  const availableTaluks = useMemo(() => {
    if (!selectedDistrict) return [];
    return getTaluksByDistrictId(selectedDistrict.id, customTaluks);
  }, [selectedDistrict, customTaluks]);

  // Available Villages strictly filtered by selected Taluk
  const availableVillages = useMemo(() => {
    if (!selectedTaluk) return [];
    return getVillagesByTalukId(selectedTaluk.id, customVillages);
  }, [selectedTaluk, customVillages]);

  // Filtered lists based on search query
  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MASTER_DISTRICTS;
    return MASTER_DISTRICTS.filter(
      (d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredTaluks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableTaluks;
    return availableTaluks.filter((t) => t.name.toLowerCase().includes(q));
  }, [availableTaluks, searchQuery]);

  const filteredVillages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableVillages;
    return availableVillages.filter((v) => v.name.toLowerCase().includes(q));
  }, [availableVillages, searchQuery]);

  // Handler for selecting District (Dependency Reset Rule: Taluk and Village reset)
  const handleSelectDistrict = (district: District) => {
    setSelectedDistrict(district);
    setSelectedTaluk(null);
    setSelectedVillage(null);
    setActiveModal(null);
    setSearchQuery('');

    onLocationChange({
      districtId: district.id,
      districtName: district.name,
      talukId: '',
      talukName: '',
      villageId: '',
      villageName: ''
    });
  };

  // Handler for selecting Taluk (Dependency Reset Rule: Village resets)
  const handleSelectTaluk = (taluk: Taluk) => {
    setSelectedTaluk(taluk);
    setSelectedVillage(null);
    setActiveModal(null);
    setSearchQuery('');

    if (selectedDistrict) {
      onLocationChange({
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        talukId: taluk.id,
        talukName: taluk.name,
        villageId: '',
        villageName: ''
      });
    }
  };

  // Handler for selecting Village
  const handleSelectVillage = (village: Village) => {
    setSelectedVillage(village);
    setActiveModal(null);
    setSearchQuery('');

    if (selectedDistrict && selectedTaluk) {
      onLocationChange({
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        talukId: selectedTaluk.id,
        talukName: selectedTaluk.name,
        villageId: village.id,
        villageName: village.name
      });
    }
  };

  // Handler for adding a custom taluk
  const handleAddNewTaluk = () => {
    if (!selectedDistrict) {
      Alert.alert('Selection Error', 'Please select a District first.');
      return;
    }
    const cleanName = newTalukName.trim();
    if (!cleanName) {
      Alert.alert('Validation Error', 'Please enter a valid Taluk / Block name.');
      return;
    }

    const savedTaluk = addCustomTaluk({
      name: cleanName,
      districtId: selectedDistrict.id
    });

    if (savedTaluk) {
      setSelectedTaluk(savedTaluk);
      setSelectedVillage(null);
      setActiveModal(null);
      setNewTalukName('');
      setSearchQuery('');

      onLocationChange({
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        talukId: savedTaluk.id,
        talukName: savedTaluk.name,
        villageId: '',
        villageName: ''
      });

      Alert.alert('Taluk Added', `Taluk / Block "${savedTaluk.name}" was saved successfully.`);
    }
  };

  // Handler for adding a custom village
  const handleAddNewVillage = () => {
    if (!selectedDistrict || !selectedTaluk) {
      Alert.alert('Selection Error', 'Please select District and Taluk first.');
      return;
    }
    const cleanName = newVillageName.trim();
    if (!cleanName) {
      Alert.alert('Validation Error', 'Please enter a valid Village name.');
      return;
    }

    const savedVillage = addCustomVillage({
      name: cleanName,
      talukId: selectedTaluk.id,
      districtId: selectedDistrict.id
    });

    if (savedVillage) {
      setSelectedVillage(savedVillage);
      setActiveModal(null);
      setNewVillageName('');
      setSearchQuery('');

      onLocationChange({
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        talukId: selectedTaluk.id,
        talukName: selectedTaluk.name,
        villageId: savedVillage.id,
        villageName: savedVillage.name
      });

      Alert.alert('Village Added', `Village "${savedVillage.name}" was saved successfully.`);
    }
  };

  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Handler for auto-detecting current location via GPS reverse geocoding
  const handleAutoDetectGps = async () => {
    try {
      setIsDetectingGps(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to automatically identify your District and Taluk/Village.'
        );
        setIsDetectingGps(false);
        return;
      }

      let pos: Location.LocationObject | null = null;
      try {
        pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      } catch {
        pos = await Location.getLastKnownPositionAsync({});
      }

      if (!pos || !pos.coords) {
        Alert.alert('GPS Error', 'Could not obtain current GPS coordinates.');
        setIsDetectingGps(false);
        return;
      }

      const reverseResults = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });

      if (!reverseResults || reverseResults.length === 0) {
        Alert.alert('Geocoding Result', 'GPS coordinates acquired, but no postal address was returned.');
        setIsDetectingGps(false);
        return;
      }

      const geo = reverseResults[0];
      const detectedDistrictName = geo.district || geo.subregion || geo.city || '';
      const detectedTalukOrCity = geo.city || geo.subregion || geo.street || '';
      const detectedVillageOrArea = geo.name || geo.street || '';

      // Match district in MASTER_DISTRICTS
      let matchedDistrict: District | null = null;
      if (detectedDistrictName) {
        const normDetected = normalizeLocationName(detectedDistrictName);
        matchedDistrict =
          MASTER_DISTRICTS.find((d) => normalizeLocationName(d.name) === normDetected) ||
          MASTER_DISTRICTS.find((d) => normDetected.includes(normalizeLocationName(d.name))) ||
          null;
      }

      // If subregion or region matches
      if (!matchedDistrict && geo.subregion) {
        const normSub = normalizeLocationName(geo.subregion);
        matchedDistrict = MASTER_DISTRICTS.find((d) => normalizeLocationName(d.name) === normSub) || null;
      }

      if (matchedDistrict) {
        setSelectedDistrict(matchedDistrict);

        // Try to match taluk
        const taluks = getTaluksByDistrictId(matchedDistrict.id, customTaluks);
        let matchedTaluk: Taluk | null = null;
        if (detectedTalukOrCity) {
          const normTlk = normalizeLocationName(detectedTalukOrCity);
          matchedTaluk =
            taluks.find((t) => normalizeLocationName(t.name) === normTlk) ||
            taluks.find((t) => normTlk.includes(normalizeLocationName(t.name))) ||
            null;
        }

        // If no predefined taluk matches, auto-create custom taluk if detected name is non-empty
        if (!matchedTaluk && detectedTalukOrCity && detectedTalukOrCity !== matchedDistrict.name) {
          matchedTaluk = addCustomTaluk({
            name: detectedTalukOrCity,
            districtId: matchedDistrict.id
          });
        }

        setSelectedTaluk(matchedTaluk);

        // Try to match village
        let matchedVillage: Village | null = null;
        if (matchedTaluk && detectedVillageOrArea) {
          const villages = getVillagesByTalukId(matchedTaluk.id, customVillages);
          const normVlg = normalizeLocationName(detectedVillageOrArea);
          matchedVillage = villages.find((v) => normalizeLocationName(v.name) === normVlg) || null;

          if (!matchedVillage && detectedVillageOrArea !== matchedTaluk.name) {
            matchedVillage = addCustomVillage({
              name: detectedVillageOrArea,
              talukId: matchedTaluk.id,
              districtId: matchedDistrict.id
            });
          }
        }

        setSelectedVillage(matchedVillage);

        onLocationChange({
          districtId: matchedDistrict.id,
          districtName: matchedDistrict.name,
          talukId: matchedTaluk ? matchedTaluk.id : '',
          talukName: matchedTaluk ? matchedTaluk.name : '',
          villageId: matchedVillage ? matchedVillage.id : '',
          villageName: matchedVillage ? matchedVillage.name : ''
        });

        Alert.alert(
          'Location Detected via GPS',
          `District: ${matchedDistrict.name}\nTaluk/Block: ${
            matchedTaluk ? matchedTaluk.name : 'Please select'
          }\nVillage/Area: ${matchedVillage ? matchedVillage.name : 'Please select'}\n\n(Lat: ${pos.coords.latitude.toFixed(
            4
          )}, Lng: ${pos.coords.longitude.toFixed(4)})`
        );
      } else {
        Alert.alert(
          'GPS Located',
          `Acquired location: ${detectedDistrictName || geo.city || 'Unknown'}${
            geo.region ? ', ' + geo.region : ''
          }.\nPlease select the closest matching District from the list.`
        );
      }
    } catch (err: any) {
      Alert.alert('GPS Error', err?.message || 'Failed to detect location from GPS.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.gpsAutoBtn}
          onPress={handleAutoDetectGps}
          disabled={isDetectingGps}
        >
          {isDetectingGps ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons name="navigate-circle" size={16} color={theme.colors.primary} />
          )}
          <Text style={styles.gpsAutoBtnText}>
            {isDetectingGps ? 'Detecting...' : 'Auto-Detect GPS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 1. DISTRICT SELECTOR */}
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>District *</Text>
        <TouchableOpacity
          style={styles.selectorBtn}
          onPress={() => {
            setSearchQuery('');
            setActiveModal('district');
          }}
        >
          <Text style={selectedDistrict ? styles.selectorText : styles.placeholderText}>
            {selectedDistrict ? selectedDistrict.name : 'Select District...'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. TALUK / BLOCK SELECTOR */}
      <View style={styles.fieldBlock}>
        <View style={styles.villageLabelRow}>
          <Text style={styles.fieldLabel}>Taluk / Block *</Text>
          {selectedDistrict && (
            <TouchableOpacity
              onPress={() => {
                setNewTalukName('');
                setActiveModal('add-taluk');
              }}
            >
              <Text style={styles.addVillageLink}>+ Add Taluk</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.selectorBtn,
            !selectedDistrict && styles.disabledSelectorBtn
          ]}
          disabled={!selectedDistrict}
          onPress={() => {
            setSearchQuery('');
            setActiveModal('taluk');
          }}
        >
          <Text
            style={
              !selectedDistrict
                ? styles.disabledText
                : selectedTaluk
                ? styles.selectorText
                : styles.placeholderText
            }
          >
            {!selectedDistrict
              ? '[ Select District first ]'
              : selectedTaluk
              ? selectedTaluk.name
              : 'Select Taluk / Block...'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={!selectedDistrict ? '#CCC' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* 3. VILLAGE SELECTOR */}
      <View style={styles.fieldBlock}>
        <View style={styles.villageLabelRow}>
          <Text style={styles.fieldLabel}>Village *</Text>
          {selectedTaluk && (
            <TouchableOpacity
              onPress={() => {
                setNewVillageName('');
                setActiveModal('add-village');
              }}
            >
              <Text style={styles.addVillageLink}>+ Add New Village</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.selectorBtn,
            !selectedTaluk && styles.disabledSelectorBtn
          ]}
          disabled={!selectedTaluk}
          onPress={() => {
            setSearchQuery('');
            setActiveModal('village');
          }}
        >
          <Text
            style={
              !selectedTaluk
                ? styles.disabledText
                : selectedVillage
                ? styles.selectorText
                : styles.placeholderText
            }
          >
            {!selectedTaluk
              ? '[ Select Taluk first ]'
              : selectedVillage
              ? selectedVillage.name
              : 'Select Village...'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color={!selectedTaluk ? '#CCC' : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH / SELECTION MODAL */}
      <Modal
        visible={activeModal === 'district' || activeModal === 'taluk' || activeModal === 'village'}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeModal === 'district' && 'Select District'}
                {activeModal === 'taluk' && `Taluks in ${selectedDistrict?.name || ''}`}
                {activeModal === 'village' && `Villages in ${selectedTaluk?.name || ''}`}
              </Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search Box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  activeModal === 'district'
                    ? 'Search district...'
                    : activeModal === 'taluk'
                    ? 'Search taluk / block...'
                    : 'Search village...'
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Add Bar for Taluk */}
            {activeModal === 'taluk' && selectedDistrict && (
              <TouchableOpacity
                style={styles.quickAddBar}
                onPress={() => {
                  setNewTalukName(searchQuery.trim());
                  setActiveModal('add-taluk');
                }}
              >
                <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
                <Text style={styles.quickAddText}>
                  + Add &quot;{searchQuery.trim() || 'New Taluk'}&quot; to {selectedDistrict?.name}
                </Text>
              </TouchableOpacity>
            )}

            {/* If selecting Village, provide quick "+ Add New Village" bar */}
            {activeModal === 'village' && (
              <TouchableOpacity
                style={styles.quickAddBar}
                onPress={() => {
                  setNewVillageName(searchQuery.trim());
                  setActiveModal('add-village');
                }}
              >
                <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
                <Text style={styles.quickAddText}>
                  + Add &quot;{searchQuery.trim() || 'New Village'}&quot; to {selectedTaluk?.name}
                </Text>
              </TouchableOpacity>
            )}

            {/* Items List */}
            <FlatList
              data={
                activeModal === 'district'
                  ? (filteredDistricts as any[])
                  : activeModal === 'taluk'
                  ? (filteredTaluks as any[])
                  : (filteredVillages as any[])
              }
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected =
                  (activeModal === 'district' && selectedDistrict?.id === item.id) ||
                  (activeModal === 'taluk' && selectedTaluk?.id === item.id) ||
                  (activeModal === 'village' && selectedVillage?.id === item.id);

                return (
                  <TouchableOpacity
                    style={[styles.listItem, isSelected && styles.listItemSelected]}
                    onPress={() => {
                      if (activeModal === 'district') handleSelectDistrict(item);
                      else if (activeModal === 'taluk') handleSelectTaluk(item);
                      else if (activeModal === 'village') handleSelectVillage(item);
                    }}
                  >
                    <View style={styles.itemTextContainer}>
                      <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                        {item.name}
                      </Text>
                      {item.state && <Text style={styles.itemSub}>{item.state}</Text>}
                      {item.isCustom && <Text style={styles.customBadge}>Custom</Text>}
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>No results matching &quot;{searchQuery}&quot;</Text>
                  {activeModal === 'taluk' && selectedDistrict && (
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={() => {
                        setNewTalukName(searchQuery.trim());
                        setActiveModal('add-taluk');
                      }}
                    >
                      <Text style={styles.emptyAddBtnText}>+ Add As New Taluk / Block</Text>
                    </TouchableOpacity>
                  )}
                  {activeModal === 'village' && selectedTaluk && (
                    <TouchableOpacity
                      style={styles.emptyAddBtn}
                      onPress={() => {
                        setNewVillageName(searchQuery.trim());
                        setActiveModal('add-village');
                      }}
                    >
                      <Text style={styles.emptyAddBtnText}>+ Add As New Village</Text>
                    </TouchableOpacity>
                  )}
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* ADD NEW TALUK MODAL */}
      <Modal
        visible={activeModal === 'add-taluk'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal('taluk')}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.addVillageContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Taluk / Block</Text>
              <TouchableOpacity onPress={() => setActiveModal('taluk')}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.addInfoCard}>
              <Text style={styles.addInfoLabel}>Associated District:</Text>
              <Text style={styles.addInfoVal}>{selectedDistrict?.name} ({selectedDistrict?.state})</Text>
            </View>

            <Text style={styles.fieldLabel}>Taluk / Block Name *</Text>
            <TextInput
              style={styles.addVillageInput}
              value={newTalukName}
              onChangeText={setNewTalukName}
              placeholder="Enter exact taluk / block name"
              autoFocus
            />

            <View style={styles.addBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActiveModal('taluk')}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveVillageBtn} onPress={handleAddNewTaluk}>
                <Ionicons name="save-outline" size={16} color="#FFF" />
                <Text style={styles.saveVillageBtnText}>Save Taluk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD NEW VILLAGE MODAL */}
      <Modal
        visible={activeModal === 'add-village'}
        animationType="fade"
        transparent
        onRequestClose={() => setActiveModal('village')}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.addVillageContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Village</Text>
              <TouchableOpacity onPress={() => setActiveModal('village')}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.addInfoCard}>
              <Text style={styles.addInfoLabel}>Associated Administrative Hierarchy:</Text>
              <Text style={styles.addInfoVal}>District: {selectedDistrict?.name}</Text>
              <Text style={styles.addInfoVal}>Taluk / Block: {selectedTaluk?.name}</Text>
            </View>

            <Text style={styles.fieldLabel}>Village Name *</Text>
            <TextInput
              style={styles.addVillageInput}
              value={newVillageName}
              onChangeText={setNewVillageName}
              placeholder="Enter exact village name"
              autoFocus
            />

            <View style={styles.addBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActiveModal('village')}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveVillageBtn} onPress={handleAddNewVillage}>
                <Ionicons name="save-outline" size={16} color="#FFF" />
                <Text style={styles.saveVillageBtnText}>Save Village</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAF9',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compactContainer: {
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gpsAutoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  gpsAutoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fieldBlock: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  villageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addVillageLink: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: theme.borderRadius.s,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledSelectorBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  placeholderText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  disabledText: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  addVillageContent: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: theme.colors.text,
  },
  quickAddBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  quickAddText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  listItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  itemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  itemTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  customBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyList: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  emptyAddBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  addInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  addInfoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  addInfoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addVillageInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 16,
  },
  addBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  saveVillageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveVillageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
});
