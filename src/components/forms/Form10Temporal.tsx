import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import {
  CropCycleSurveyData,
  RepeatedCropObservationRow,
  TemporalManagementEventRow,
  CropCycleSummaryRow
} from '../../types';

interface Form10TemporalProps {
  data: CropCycleSurveyData;
  onChange: (updated: CropCycleSurveyData) => void;
}

export default function Form10Temporal({ data, onChange }: Form10TemporalProps) {
  const updateField = (field: keyof CropCycleSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateEvent = (index: number, key: keyof TemporalManagementEventRow, val: string) => {
    const updated = [...data.managementEvents];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, managementEvents: updated });
  };

  const updateSummary = (index: number, key: keyof CropCycleSummaryRow, val: string) => {
    const updated = [...data.temporalSummary];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, temporalSummary: updated });
  };

  // Repeated Crop Observations modal state (Add / Edit)
  const [obsModalVisible, setObsModalVisible] = useState(false);
  const [editingObsId, setEditingObsId] = useState<string | null>(null);

  // Form states for single repeated observation row
  const [obsDate, setObsDate] = useState('');
  const [obsStage, setObsStage] = useState('');
  const [obsTemp, setObsTemp] = useState('');
  const [obsRh, setObsRh] = useState('');
  const [obsMoisture, setObsMoisture] = useState('');
  const [obsPh, setObsPh] = useState('');
  const [obsEc, setObsEc] = useState('');
  const [obsPest, setObsPest] = useState('');
  const [obsDisease, setObsDisease] = useState('');
  const [obsHealth, setObsHealth] = useState('');

  const openAddObsModal = () => {
    setEditingObsId(null);
    setObsDate(new Date().toLocaleDateString('en-GB'));
    setObsStage('Vegetative');
    setObsTemp('');
    setObsRh('');
    setObsMoisture('');
    setObsPh('');
    setObsEc('');
    setObsPest('');
    setObsDisease('');
    setObsHealth('Good');
    setObsModalVisible(true);
  };

  const openEditObsModal = (row: RepeatedCropObservationRow) => {
    setEditingObsId(row.id);
    setObsDate(row.date);
    setObsStage(row.stage);
    setObsTemp(row.tempC);
    setObsRh(row.rhPercent);
    setObsMoisture(row.soilMoisturePercent);
    setObsPh(row.ph);
    setObsEc(row.ec);
    setObsPest(row.pestPercent);
    setObsDisease(row.diseasePercent);
    setObsHealth(row.health);
    setObsModalVisible(true);
  };

  const handleSaveObservation = () => {
    if (!obsStage.trim()) {
      Alert.alert('Validation Error', 'Please enter crop stage.');
      return;
    }

    if (editingObsId) {
      // Edit existing row
      const updated = data.repeatedObservations.map((r) =>
        r.id === editingObsId
          ? {
              ...r,
              date: obsDate,
              stage: obsStage,
              tempC: obsTemp,
              rhPercent: obsRh,
              soilMoisturePercent: obsMoisture,
              ph: obsPh,
              ec: obsEc,
              pestPercent: obsPest,
              diseasePercent: obsDisease,
              health: obsHealth,
            }
          : r
      );
      onChange({ ...data, repeatedObservations: updated });
    } else {
      // Add new row
      const newRow: RepeatedCropObservationRow = {
        id: `obs-${Date.now()}`,
        date: obsDate || new Date().toLocaleDateString('en-GB'),
        stage: obsStage,
        tempC: obsTemp,
        rhPercent: obsRh,
        soilMoisturePercent: obsMoisture,
        ph: obsPh,
        ec: obsEc,
        pestPercent: obsPest,
        diseasePercent: obsDisease,
        health: obsHealth,
      };
      onChange({
        ...data,
        repeatedObservations: [...data.repeatedObservations, newRow],
        numObservations: (data.repeatedObservations.length + 1).toString(),
      });
    }

    setObsModalVisible(false);
  };

  const handleDeleteObservation = (id: string) => {
    const updated = data.repeatedObservations.filter((r) => r.id !== id);
    onChange({
      ...data,
      repeatedObservations: updated,
      numObservations: updated.length.toString(),
    });
  };

  return (
    <View style={styles.container}>
      {/* A. CROP CYCLE INFORMATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Crop-Cycle Information</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Survey ID</Text>
            <TextInput style={[styles.input, styles.readonlyInput]} value={data.surveyId} editable={false} />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Field ID</Text>
            <TextInput style={styles.input} value={data.fieldId} onChangeText={(v) => updateField('fieldId', v)} placeholder="FLD-01" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Crop</Text>
            <TextInput style={styles.input} value={data.crop} onChangeText={(v) => updateField('crop', v)} placeholder="Crop name" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Variety</Text>
            <TextInput style={styles.input} value={data.variety} onChangeText={(v) => updateField('variety', v)} placeholder="Variety name" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sowing Date</Text>
            <TextInput style={styles.input} value={data.sowingDate} onChangeText={(v) => updateField('sowingDate', v)} placeholder="DD/MM/YYYY" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Expected Harvest</Text>
            <TextInput style={styles.input} value={data.expectedHarvest} onChangeText={(v) => updateField('expectedHarvest', v)} placeholder="DD/MM/YYYY" />
          </View>
        </View>

        <Text style={styles.label}>Survey Frequency</Text>
        <View style={styles.radioGroup}>
          {(['Daily', 'Weekly', 'Fortnightly'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.surveyFrequency === opt && styles.radioBtnActive]}
              onPress={() => updateField('surveyFrequency', opt)}
            >
              <Text style={[styles.radioText, data.surveyFrequency === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Monitoring System</Text>
        <View style={styles.radioGroup}>
          {(['Manual', 'Sensor', 'Drone'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.monitoringSystem === opt && styles.radioBtnActive]}
              onPress={() => updateField('monitoringSystem', opt)}
            >
              <Text style={[styles.radioText, data.monitoringSystem === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Number of Observations</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              value={data.repeatedObservations.length.toString()}
              editable={false}
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Observer</Text>
            <TextInput style={styles.input} value={data.observer} onChangeText={(v) => updateField('observer', v)} placeholder="Observer name" />
          </View>
        </View>
      </View>

      {/* B. REPEATED CROP OBSERVATIONS (DYNAMIC ROWS) */}
      <View style={styles.sectionCard}>
        <View style={styles.obsHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>B. Repeated Crop Observations</Text>
            <Text style={styles.sectionSub}>Dynamic cycle observations (Date, Stage, Temp, RH, Soil, Health):</Text>
          </View>
          <TouchableOpacity style={styles.addObsBtn} onPress={openAddObsModal}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={styles.addObsBtnText}>+ Add Row</Text>
          </TouchableOpacity>
        </View>

        {data.repeatedObservations.length === 0 ? (
          <View style={styles.emptyObsBox}>
            <Ionicons name="calendar-outline" size={32} color="#94A3B8" />
            <Text style={styles.emptyObsText}>No repeated observations logged yet.</Text>
            <Text style={styles.emptyObsSub}>Tap &quot;+ Add Row&quot; above to log periodic crop cycle metrics.</Text>
          </View>
        ) : (
          data.repeatedObservations.map((obs, idx) => (
            <View key={obs.id} style={styles.obsRowCard}>
              <View style={styles.obsRowHeader}>
                <View style={styles.obsBadge}>
                  <Text style={styles.obsBadgeText}>#{idx + 1} • {obs.date}</Text>
                </View>
                <Text style={styles.obsStageTitle}>{obs.stage}</Text>
                <View style={styles.obsActionGroup}>
                  <TouchableOpacity onPress={() => openEditObsModal(obs)} style={styles.actionIconBtn}>
                    <Ionicons name="pencil" size={16} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteObservation(obs.id)} style={styles.actionIconBtn}>
                    <Ionicons name="trash" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.obsGrid}>
                <Text style={styles.obsParam}>Temp: <Text style={styles.obsVal}>{obs.tempC ? `${obs.tempC}°C` : '—'}</Text></Text>
                <Text style={styles.obsParam}>RH: <Text style={styles.obsVal}>{obs.rhPercent ? `${obs.rhPercent}%` : '—'}</Text></Text>
                <Text style={styles.obsParam}>Moisture: <Text style={styles.obsVal}>{obs.soilMoisturePercent ? `${obs.soilMoisturePercent}%` : '—'}</Text></Text>
                <Text style={styles.obsParam}>pH: <Text style={styles.obsVal}>{obs.ph || '—'}</Text></Text>
                <Text style={styles.obsParam}>Pest: <Text style={styles.obsVal}>{obs.pestPercent ? `${obs.pestPercent}%` : '—'}</Text></Text>
                <Text style={styles.obsParam}>Health: <Text style={styles.obsVal}>{obs.health || '—'}</Text></Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* C. TEMPORAL MANAGEMENT EVENTS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Temporal Management Events</Text>
        <Text style={styles.sectionSub}>Actions, inputs, quantities, reasons and results for all 6 events:</Text>

        {data.managementEvents.map((evt, idx) => (
          <View key={evt.event} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{idx + 1}. {evt.event}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Date</Text>
                <TextInput
                  style={styles.smallInput}
                  value={evt.date}
                  onChangeText={(v) => updateEvent(idx, 'date', v)}
                  placeholder="DD/MM/YYYY"
                />
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.subLabel}>Input / Action</Text>
                <TextInput
                  style={styles.smallInput}
                  value={evt.action}
                  onChangeText={(v) => updateEvent(idx, 'action', v)}
                  placeholder="e.g. Urea / Spray"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Quantity</Text>
                <TextInput
                  style={styles.smallInput}
                  value={evt.quantity}
                  onChangeText={(v) => updateEvent(idx, 'quantity', v)}
                  placeholder="e.g. 50 kg"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Reason</Text>
                <TextInput
                  style={styles.smallInput}
                  value={evt.reason}
                  onChangeText={(v) => updateEvent(idx, 'reason', v)}
                  placeholder="Nutrient top dressing"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Result</Text>
                <TextInput
                  style={styles.smallInput}
                  value={evt.result}
                  onChangeText={(v) => updateEvent(idx, 'result', v)}
                  placeholder="Good canopy growth"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. CROP-CYCLE SUMMARY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Crop-Cycle Summary</Text>
        <Text style={styles.sectionSub}>Beginning, middle, end, and max/min progression:</Text>

        {data.temporalSummary.map((item, idx) => (
          <View key={item.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{item.parameter}</Text>
            <View style={styles.fourColRow}>
              <View style={styles.quarterCol}>
                <Text style={styles.subLabel}>Beginning</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.beginning}
                  onChangeText={(v) => updateSummary(idx, 'beginning', v)}
                  placeholder="Beg"
                />
              </View>
              <View style={styles.quarterCol}>
                <Text style={styles.subLabel}>Middle</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.middle}
                  onChangeText={(v) => updateSummary(idx, 'middle', v)}
                  placeholder="Mid"
                />
              </View>
              <View style={styles.quarterCol}>
                <Text style={styles.subLabel}>End</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.end}
                  onChangeText={(v) => updateSummary(idx, 'end', v)}
                  placeholder="End"
                />
              </View>
              <View style={styles.quarterCol}>
                <Text style={styles.subLabel}>Max / Min</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.maxMin}
                  onChangeText={(v) => updateSummary(idx, 'maxMin', v)}
                  placeholder="Max/Min"
                />
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.label}>Major Temporal Trend Observed</Text>
        <TextInput
          style={styles.input}
          value={data.majorTrendObserved}
          onChangeText={(v) => updateField('majorTrendObserved', v)}
          placeholder="e.g. Moisture deficit during grand growth phase"
        />

        <Text style={styles.label}>Critical Intervention Stage</Text>
        <TextInput
          style={styles.input}
          value={data.criticalInterventionStage}
          onChangeText={(v) => updateField('criticalInterventionStage', v)}
          placeholder="e.g. Tillering stage - fertilizer schedule"
        />

        <Text style={styles.label}>Final Survey Conclusion</Text>
        <TextInput
          style={[styles.input, { minHeight: 60 }]}
          value={data.finalConclusion}
          onChangeText={(v) => updateField('finalConclusion', v)}
          multiline
          placeholder="Summary conclusion and agronomic recommendations"
        />
      </View>

      {/* DYNAMIC ROW MODAL (ADD / EDIT) */}
      <Modal visible={obsModalVisible} animationType="slide" transparent onRequestClose={() => setObsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingObsId ? 'Edit Observation Row' : 'Add Repeated Observation'}
              </Text>
              <TouchableOpacity onPress={() => setObsModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Date *</Text>
                <TextInput style={styles.input} value={obsDate} onChangeText={setObsDate} placeholder="DD/MM/YYYY" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Crop Stage *</Text>
                <TextInput style={styles.input} value={obsStage} onChangeText={setObsStage} placeholder="e.g. Tillering" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Temperature (°C)</Text>
                <TextInput style={styles.input} value={obsTemp} onChangeText={setObsTemp} keyboardType="numeric" placeholder="°C" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Relative Humidity (%)</Text>
                <TextInput style={styles.input} value={obsRh} onChangeText={setObsRh} keyboardType="numeric" placeholder="%" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Soil Moisture (%)</Text>
                <TextInput style={styles.input} value={obsMoisture} onChangeText={setObsMoisture} keyboardType="numeric" placeholder="%" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>pH</Text>
                <TextInput style={styles.input} value={obsPh} onChangeText={setObsPh} keyboardType="numeric" placeholder="pH" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>EC (dS/m)</Text>
                <TextInput style={styles.input} value={obsEc} onChangeText={setObsEc} keyboardType="numeric" placeholder="EC" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Pest Incidence %</Text>
                <TextInput style={styles.input} value={obsPest} onChangeText={setObsPest} keyboardType="numeric" placeholder="%" />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Disease Severity %</Text>
                <TextInput style={styles.input} value={obsDisease} onChangeText={setObsDisease} keyboardType="numeric" placeholder="%" />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>Crop Health Condition</Text>
                <TextInput style={styles.input} value={obsHealth} onChangeText={setObsHealth} placeholder="Optimal / Stressed" />
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setObsModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveObservation}>
                <Ionicons name="save" size={16} color="#FFF" />
                <Text style={styles.modalSaveText}>Save Observation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.primary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  fourColRow: { flexDirection: 'row', gap: 6 },
  halfCol: { flex: 1 },
  quarterCol: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 4 },
  subLabel: { fontSize: 11, fontWeight: '500', color: '#64748B', marginBottom: 2 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  readonlyInput: { backgroundColor: '#F1F5F9', color: '#64748B' },
  smallInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 13,
    color: theme.colors.text,
  },
  radioGroup: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  radioBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  radioBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  radioText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  radioTextActive: { color: '#FFF' },
  obsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addObsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addObsBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  emptyObsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyObsText: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 6 },
  emptyObsSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  obsRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  obsRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  obsBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  obsBadgeText: { fontSize: 11, fontWeight: '700', color: '#0284C7' },
  obsStageTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', flex: 1, marginLeft: 8 },
  obsActionGroup: { flexDirection: 'row', gap: 12 },
  actionIconBtn: { padding: 4 },
  obsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  obsParam: { fontSize: 11, color: '#64748B' },
  obsVal: { fontWeight: '700', color: '#1E293B' },
  tableRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tableRowTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalCancelText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalSaveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
