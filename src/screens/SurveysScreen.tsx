import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStore } from '../store/useStore';
import { SurveyRecord } from '../types';

export default function SurveysScreen({ navigation }: any) {
  const { surveys, addSurvey } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [farmerName, setFarmerName] = useState('');
  const [crop, setCrop] = useState('');
  const [fieldId, setFieldId] = useState('');

  const handleSave = () => {
    if (!farmerName.trim() || !crop.trim()) {
      Alert.alert('Error', 'Please enter farmer name and crop');
      return;
    }
    const newSurvey: SurveyRecord = {
      id: `SRV-${Date.now().toString().slice(-6)}`,
      timeOrDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      farmerName,
      crop,
      fieldId: fieldId || 'FLD-01',
      village: 'Mandya',
      auditedDate: new Date().toISOString().split('T')[0],
      status: 'Draft',
      statusDetail: 'Pending Review',
      moduleName: 'General Crop Survey',
      stepProgress: '2/10 Modules'
    };

    addSurvey(newSurvey);
    setIsModalOpen(false);
    setFarmerName('');
    setCrop('');
    setFieldId('');
  };

  const renderSurvey = ({ item }: { item: SurveyRecord }) => (
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
        <Ionicons name={item.status === 'Completed' ? 'flask' : 'clipboard'} size={14} color={theme.colors.secondary} />
        <Text style={styles.moduleText}>{item.moduleName || 'Standard Survey'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.viewBtn}>
          <Ionicons name="eye" size={16} color={theme.colors.text} />
          <Text style={styles.viewBtnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resumeBtn}>
          <Ionicons name={item.status === 'Completed' ? 'document' : 'play'} size={16} color="#FFF" />
          <Text style={styles.resumeBtnText}>
            {item.status === 'Completed' ? 'Report' : 'Resume'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Surveys & Audits</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setIsModalOpen(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={surveys}
        keyExtractor={(item) => item.id}
        renderItem={renderSurvey}
        contentContainerStyle={styles.list}
      />

      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Survey Dossier</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.form}>
              <Text style={styles.label}>Farmer Name</Text>
              <TextInput style={styles.input} value={farmerName} onChangeText={setFarmerName} placeholder="e.g. Ramesh Kumar" />
              
              <Text style={styles.label}>Crop</Text>
              <TextInput style={styles.input} value={crop} onChangeText={setCrop} placeholder="e.g. Sugarcane" />
              
              <Text style={styles.label}>Field ID (Optional)</Text>
              <TextInput style={styles.input} value={fieldId} onChangeText={setFieldId} placeholder="e.g. FLD-01" />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Initialize Survey</Text>
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
  list: { padding: theme.spacing.m, paddingBottom: 80 },
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
  label: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 4 },
  input: { height: 48, backgroundColor: '#F0F4F0', borderRadius: theme.borderRadius.m, paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m },
  saveBtn: { backgroundColor: theme.colors.primary, height: 48, borderRadius: theme.borderRadius.m, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.m },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
