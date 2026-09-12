import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import {
  TechInventorySurveyData,
  TechEquipmentInventoryRow,
  TechSensorInventoryRow,
  FarmSystemRow,
  TechGapRow
} from '../../types';

interface Form08TechnologyProps {
  data: TechInventorySurveyData;
  onChange: (updated: TechInventorySurveyData) => void;
}

export default function Form08Technology({ data, onChange }: Form08TechnologyProps) {
  const updateEquipment = (index: number, key: keyof TechEquipmentInventoryRow, val: string) => {
    const updated = [...data.techInventory];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, techInventory: updated });
  };

  const updateSensor = (index: number, key: keyof TechSensorInventoryRow, val: string) => {
    const updated = [...data.sensorInventory];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, sensorInventory: updated });
  };

  const updateFarmSystem = (index: number, key: keyof FarmSystemRow, val: any) => {
    const updated = [...data.farmSystems];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, farmSystems: updated });
  };

  const updateTechGap = (index: number, key: keyof TechGapRow, val: any) => {
    const updated = [...data.techGaps];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, techGaps: updated });
  };

  return (
    <View style={styles.container}>
      {/* A. TECHNOLOGY INVENTORY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Technology Inventory</Text>
        <Text style={styles.sectionSub}>All 10 equipment items with Make/Model, quantity, condition:</Text>

        {data.techInventory.map((item, idx) => (
          <View key={item.equipment} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{idx + 1}. {item.equipment}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.subLabel}>Make / Model</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.makeModel}
                  onChangeText={(v) => updateEquipment(idx, 'makeModel', v)}
                  placeholder="Brand / Specs"
                />
              </View>
              <View style={{ flex: 0.7 }}>
                <Text style={styles.subLabel}>Qty</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.qty}
                  onChangeText={(v) => updateEquipment(idx, 'qty', v)}
                  keyboardType="numeric"
                  placeholder="Qty"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Condition</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.condition}
                  onChangeText={(v) => updateEquipment(idx, 'condition', v)}
                  placeholder="Working / Faulty"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* B. SENSOR INVENTORY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Sensor Inventory</Text>
        <Text style={styles.sectionSub}>Sensor parameters, measurement range, accuracy, communication:</Text>

        {data.sensorInventory.map((item, idx) => (
          <View key={item.sensor} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{idx + 1}. {item.sensor}</Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Parameter Measured</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.paramMeasured}
                  onChangeText={(v) => updateSensor(idx, 'paramMeasured', v)}
                  placeholder="e.g. VWC / pH"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Range</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.range}
                  onChangeText={(v) => updateSensor(idx, 'range', v)}
                  placeholder="e.g. 0-100%"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Accuracy</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.accuracy}
                  onChangeText={(v) => updateSensor(idx, 'accuracy', v)}
                  placeholder="e.g. ±2%"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Communication</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.communication}
                  onChangeText={(v) => updateSensor(idx, 'communication', v)}
                  placeholder="LoRa / 4G / RS485"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* C. FARM SYSTEMS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Farm Systems</Text>
        <Text style={styles.sectionSub}>State if present, specification, usage frequency, and problems:</Text>

        {data.farmSystems.map((item, idx) => (
          <View key={item.system} style={styles.tableRowCard}>
            <View style={styles.farmSystemHeader}>
              <Text style={styles.tableRowTitle}>{item.system}</Text>
              <TouchableOpacity
                style={styles.checkBtn}
                onPress={() => updateFarmSystem(idx, 'present', !item.present)}
              >
                <Ionicons
                  name={item.present ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={item.present ? theme.colors.primary : '#94A3B8'}
                />
                <Text style={[styles.checkLabel, item.present && styles.checkLabelActive]}>
                  {item.present ? 'Present' : 'Not Present'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Specification</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.specification}
                  onChangeText={(v) => updateFarmSystem(idx, 'specification', v)}
                  placeholder="Capacity / Model"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Usage Frequency</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.usageFreq}
                  onChangeText={(v) => updateFarmSystem(idx, 'usageFreq', v)}
                  placeholder="Daily / Weekly"
                />
              </View>
            </View>
            <Text style={styles.subLabel}>Problems Encountered</Text>
            <TextInput
              style={styles.smallInput}
              value={item.problems}
              onChangeText={(v) => updateFarmSystem(idx, 'problems', v)}
              placeholder="Clogging / Power fluctuation"
            />
          </View>
        ))}
      </View>

      {/* D. TECHNOLOGY GAPS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Technology Gaps</Text>
        <Text style={styles.sectionSub}>Present status and farmer priority (1–5):</Text>

        {data.techGaps.map((item, idx) => (
          <View key={item.requirement} style={styles.tableRowCard}>
            <View style={styles.farmSystemHeader}>
              <Text style={styles.tableRowTitle}>{item.requirement}</Text>
              {/* Priority 1-5 */}
              <View style={styles.priorityBar}>
                {[1, 2, 3, 4, 5].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      item.priority === p && styles.priorityBtnActive
                    ]}
                    onPress={() => updateTechGap(idx, 'priority', p)}
                  >
                    <Text style={[styles.priorityText, item.priority === p && styles.priorityTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={styles.subLabel}>Present Status / Existing Gap</Text>
            <TextInput
              style={styles.smallInput}
              value={item.presentStatus}
              onChangeText={(v) => updateTechGap(idx, 'presentStatus', v)}
              placeholder="Manual estimation only / No tools"
            />
          </View>
        ))}
      </View>
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
  halfCol: { flex: 1 },
  subLabel: { fontSize: 11, fontWeight: '500', color: '#64748B', marginBottom: 2 },
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
  tableRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tableRowTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  farmSystemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  checkLabelActive: { color: theme.colors.primary },
  priorityBar: { flexDirection: 'row', gap: 4 },
  priorityBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  priorityBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  priorityText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  priorityTextActive: { color: '#FFF' },
});
