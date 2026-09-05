import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { Farmer } from '../types';

export default function FarmersScreen({ navigation }: any) {
  const { farmers, addFarmer, deleteFarmer } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [totalAcres, setTotalAcres] = useState('');

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter farmer name');
      return;
    }
    const nextNum = farmers.length + 41;
    const code = `FMR-0${nextNum}`;
    const newFarmer: Farmer = {
      id: `fmr-${Date.now()}`,
      code,
      name,
      initials: name.substring(0, 2).toUpperCase(),
      phone: phone || '+91 98000 00000',
      location: `${village || 'Mandya'}, Maddur`,
      village: village || 'Mandya',
      taluk: 'Maddur',
      district: 'Mandya District',
      totalAcres: Number(totalAcres) || 10,
      irrigatedAcres: 6,
      rainfedAcres: 4,
      numFarms: 1,
      numFields: 1,
      numSurveys: 0,
      date: new Date().toISOString().split('T')[0],
      surveyRef: `SRV-${code}-2024`,
      kycVerified: true,
      cropsRotation: 'Sugarcane, Paddy',
      rotationScheme: 'Paddy -> Legume',
      irrigationMode: 'Borewell',
      machinery: ['Tractor'],
      farmId: `FRM-${nextNum}`
    };

    addFarmer(newFarmer);
    setIsModalOpen(false);
    setName('');
    setPhone('');
    setVillage('');
    setTotalAcres('');
  };

  const renderFarmer = ({ item }: { item: Farmer }) => (
    <View style={styles.farmerCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.code}</Text>
        </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalAcres}</Text>
          <Text style={styles.statLabel}>Acres</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.numFarms}</Text>
          <Text style={styles.statLabel}>Farms</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.numFields}</Text>
          <Text style={styles.statLabel}>Fields</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimaryContainer} onPress={() => navigation.navigate('Surveys')}>
          <Text style={styles.btnPrimaryContainerText}>Surveys ({item.numSurveys})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDelete} onPress={() => deleteFarmer(item.id)}>
          <Ionicons name="trash" size={18} color={theme.colors.error} />
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
            placeholder="Search name, phone, village..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="person-add" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>New Farmer</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredFarmers}
        keyExtractor={(item) => item.id}
        renderItem={renderFarmer}
        contentContainerStyle={styles.list}
      />

      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Farmer Entry</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Ramesh Kumar" />
              
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+91 98000 00000" />
              
              <Text style={styles.label}>Village</Text>
              <TextInput style={styles.input} value={village} onChangeText={setVillage} placeholder="e.g. Maddur" />
              
              <Text style={styles.label}>Total Acres</Text>
              <TextInput style={styles.input} value={totalAcres} onChangeText={setTotalAcres} keyboardType="numeric" placeholder="10" />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Farmer Record</Text>
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
  header: { padding: theme.spacing.m, backgroundColor: theme.colors.surface, elevation: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.m, paddingHorizontal: theme.spacing.s, height: 44, marginBottom: theme.spacing.s },
  searchInput: { flex: 1, marginLeft: theme.spacing.s, fontSize: 14, color: theme.colors.text },
  addBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: theme.borderRadius.m },
  addBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  list: { padding: theme.spacing.m, paddingBottom: 80 },
  farmerCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, marginBottom: theme.spacing.m, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.m },
  avatar: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#E0F2E9', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.s },
  avatarText: { color: theme.colors.primary, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  location: { fontSize: 12, color: theme.colors.textSecondary },
  badge: { backgroundColor: '#E0F2E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.s, padding: theme.spacing.s, marginBottom: theme.spacing.m },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSecondary: { paddingHorizontal: 12, height: 36, justifyContent: 'center', backgroundColor: '#F0F4F0', borderRadius: 8 },
  btnSecondaryText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text },
  btnPrimaryContainer: { paddingHorizontal: 12, height: 36, justifyContent: 'center', backgroundColor: '#E0F2E9', borderRadius: 8 },
  btnPrimaryContainerText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
  btnDelete: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFEBEE', borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.borderRadius.xl, borderTopRightRadius: theme.borderRadius.xl, height: '80%', padding: theme.spacing.m },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.l },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  form: { flex: 1 },
  label: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 4 },
  input: { height: 48, backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.m, paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m },
  saveBtn: { backgroundColor: theme.colors.primary, height: 48, borderRadius: theme.borderRadius.m, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.m },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
