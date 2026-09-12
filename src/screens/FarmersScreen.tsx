import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { Farmer, LocationHierarchySelection } from '../types';
import LocationSelector from '../components/LocationSelector';

export default function FarmersScreen({ navigation }: any) {
  const { farmers, addFarmer, deleteFarmer } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for creating farmer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAcres, setTotalAcres] = useState('');
  const [irrigatedAcres, setIrrigatedAcres] = useState('');
  const [rainfedAcres, setRainfedAcres] = useState('');
  const [mainCrops, setMainCrops] = useState('');
  const [irrigationMode, setIrrigationMode] = useState('');
  const [location, setLocation] = useState<LocationHierarchySelection>({
    districtId: '',
    districtName: '',
    talukId: '',
    talukName: '',
    villageId: '',
    villageName: ''
  });

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.village?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter farmer name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter contact phone number');
      return;
    }
    if (!location.districtName || !location.talukName || !location.villageName) {
      Alert.alert('Validation Error', 'Please select District, Taluk/Block, and Village.');
      return;
    }

    const nextNum = farmers.length + 1;
    const code = `FMR-${String(nextNum).padStart(3, '0')}`;
    const totAcres = Number(totalAcres) || 0;
    const irrigAcres = Number(irrigatedAcres) || 0;
    const rainAcres = Number(rainfedAcres) || 0;

    const newFarmer: Farmer = {
      id: `fmr-${Date.now()}`,
      code,
      name: name.trim(),
      initials: name.trim().substring(0, 2).toUpperCase(),
      phone: phone.trim(),
      location: `${location.villageName}, ${location.talukName}`,
      village: location.villageName,
      taluk: location.talukName,
      district: location.districtName,
      districtId: location.districtId,
      talukId: location.talukId,
      villageId: location.villageId,
      totalAcres: totAcres,
      irrigatedAcres: irrigAcres,
      rainfedAcres: rainAcres,
      numFarms: 1,
      numFields: 1,
      numSurveys: 0,
      date: new Date().toLocaleDateString('en-GB'),
      surveyRef: `SRV-${code}`,
      kycVerified: true,
      cropsRotation: mainCrops.trim(),
      rotationScheme: '',
      irrigationMode: irrigationMode.trim(),
      machinery: [],
      farmId: `FRM-${String(nextNum).padStart(3, '0')}`
    };

    addFarmer(newFarmer);
    setIsModalOpen(false);

    // Reset fields
    setName('');
    setPhone('');
    setTotalAcres('');
    setIrrigatedAcres('');
    setRainfedAcres('');
    setMainCrops('');
    setIrrigationMode('');
    setLocation({
      districtId: '',
      districtName: '',
      talukId: '',
      talukName: '',
      villageId: '',
      villageName: ''
    });

    Alert.alert('Farmer Registered', `${newFarmer.name} (${newFarmer.code}) registered successfully.`);
  };

  const renderFarmer = ({ item }: { item: Farmer }) => (
    <View style={styles.farmerCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}>📍 {item.village}, {item.taluk} ({item.district})</Text>
          <Text style={styles.phoneText}>📞 {item.phone}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.code}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalAcres || '—'}</Text>
          <Text style={styles.statLabel}>Total Acres</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.irrigatedAcres || '—'}</Text>
          <Text style={styles.statLabel}>Irrigated</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.cropsRotation || 'Crops'}</Text>
          <Text style={styles.statLabel}>Main Crops</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.btnPrimaryContainer}
          onPress={() => navigation.navigate('Surveys')}
        >
          <Ionicons name="document-text-outline" size={16} color="#FFF" />
          <Text style={styles.btnPrimaryContainerText}>Launch Survey</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnDelete}
          onPress={() => {
            Alert.alert(
              'Delete Farmer',
              `Are you sure you want to remove ${item.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteFarmer(item.id) }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, code, village, district..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {farmers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={56} color={theme.colors.primary} />
          <Text style={styles.emptyTitle}>No Farmers Registered</Text>
          <Text style={styles.emptySubtitle}>
            Add a farmer profile with their authentic administrative location hierarchy.
          </Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setIsModalOpen(true)}>
            <Ionicons name="person-add-outline" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>+ Register First Farmer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredFarmers}
          keyExtractor={(item) => item.id}
          renderItem={renderFarmer}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Register Farmer Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Farmer</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Farmer / Stakeholder Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Contact Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              {/* Universal Location Selector */}
              <LocationSelector
                title="Farmer Administrative Location"
                initialSelection={location}
                onLocationChange={(loc) => setLocation(loc)}
              />

              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Total Land Area (Acres)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    value={totalAcres}
                    onChangeText={setTotalAcres}
                  />
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Irrigated (Acres)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 3"
                    keyboardType="numeric"
                    value={irrigatedAcres}
                    onChangeText={setIrrigatedAcres}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Rainfed (Acres)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2"
                    keyboardType="numeric"
                    value={rainfedAcres}
                    onChangeText={setRainfedAcres}
                  />
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.label}>Main Crops</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Paddy, Cotton"
                    value={mainCrops}
                    onChangeText={setMainCrops}
                  />
                </View>
              </View>

              <Text style={styles.label}>Main Irrigation Mode</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Borewell / Canal / Drip"
                value={irrigationMode}
                onChangeText={setIrrigationMode}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={styles.saveBtnText}>Register Farmer</Text>
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
    padding: theme.spacing.m,
    gap: theme.spacing.s,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.s,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: theme.spacing.s, fontSize: 14, color: theme.colors.text },
  addBtn: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: { padding: theme.spacing.m, paddingBottom: 120 },
  farmerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },
  avatarText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  location: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  phoneText: { fontSize: 12, color: '#64748B', marginTop: 1 },
  badge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.s,
  },
  badgeText: { color: '#0284C7', fontSize: 11, fontWeight: 'bold' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.s,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginBottom: theme.spacing.m,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s },
  btnPrimaryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.s,
  },
  btnPrimaryContainerText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  btnDelete: {
    padding: 9,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
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
