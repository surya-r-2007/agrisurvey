import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { WaterSurveyData, HydraulicPointRow, WaterQualityRow } from '../../types';

interface Form04WaterProps {
  data: WaterSurveyData;
  onChange: (updated: WaterSurveyData) => void;
}

export default function Form04Water({ data, onChange }: Form04WaterProps) {
  const updateField = (field: keyof WaterSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateHydraulicPoint = (
    index: number,
    point: 'point1' | 'point2' | 'point3',
    val: string
  ) => {
    const updated = [...data.hydraulicMeasurements];
    updated[index] = { ...updated[index], [point]: val };
    onChange({ ...data, hydraulicMeasurements: updated });
  };

  const updateWaterQuality = (
    index: number,
    field: 'value' | 'status',
    val: any
  ) => {
    const updated = [...data.waterQuality];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ ...data, waterQuality: updated });
  };

  return (
    <View style={styles.container}>
      {/* A. WATER SOURCE */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Water Source</Text>

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

        <Text style={styles.label}>Water Source</Text>
        <View style={styles.radioGroup}>
          {(['Borewell', 'Open well', 'Canal', 'Pond', 'Other'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.waterSource === opt && styles.radioBtnActive]}
              onPress={() => updateField('waterSource', opt)}
            >
              <Text style={[styles.radioText, data.waterSource === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Source Depth (m)</Text>
            <TextInput style={styles.input} value={data.sourceDepthM} onChangeText={(v) => updateField('sourceDepthM', v)} keyboardType="numeric" placeholder="e.g. 150" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Water Level (m)</Text>
            <TextInput style={styles.input} value={data.waterLevelM} onChangeText={(v) => updateField('waterLevelM', v)} keyboardType="numeric" placeholder="e.g. 45" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Pump Capacity (kW/HP)</Text>
            <TextInput style={styles.input} value={data.pumpCapacityKwHp} onChangeText={(v) => updateField('pumpCapacityKwHp', v)} placeholder="e.g. 7.5 HP" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Pump Discharge (L/min)</Text>
            <TextInput style={styles.input} value={data.pumpDischargeLmin} onChangeText={(v) => updateField('pumpDischargeLmin', v)} keyboardType="numeric" placeholder="e.g. 250" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Daily Availability (h/day)</Text>
            <TextInput style={styles.input} value={data.dailyAvailabilityH} onChangeText={(v) => updateField('dailyAvailabilityH', v)} keyboardType="numeric" placeholder="e.g. 6" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Seasonal Availability</Text>
            <TextInput style={styles.input} value={data.seasonalAvailability} onChangeText={(v) => updateField('seasonalAvailability', v)} placeholder="Perennial / Seasonal" />
          </View>
        </View>

        <Text style={styles.label}>Storage Capacity (L / m³)</Text>
        <TextInput style={styles.input} value={data.storageCapacityL} onChangeText={(v) => updateField('storageCapacityL', v)} placeholder="e.g. 50,000 L farm pond" />
      </View>

      {/* B. HYDRAULIC MEASUREMENTS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Hydraulic Measurements</Text>
        <Text style={styles.sectionSub}>Pressure, discharge and flow across 3 measurement points:</Text>

        {data.hydraulicMeasurements.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>
              {row.parameter} ({row.unit})
            </Text>
            <View style={styles.threeColRow}>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Point 1</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.point1}
                  onChangeText={(v) => updateHydraulicPoint(idx, 'point1', v)}
                  placeholder="Pt 1"
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Point 2</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.point2}
                  onChangeText={(v) => updateHydraulicPoint(idx, 'point2', v)}
                  placeholder="Pt 2"
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Point 3</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.point3}
                  onChangeText={(v) => updateHydraulicPoint(idx, 'point3', v)}
                  placeholder="Pt 3"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* C. WATER QUALITY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Water Quality</Text>
        <Text style={styles.sectionSub}>All 14 parameters with exact units and status:</Text>

        {data.waterQuality.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>
              {row.parameter} {row.unit !== '—' ? `(${row.unit})` : ''}
            </Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Value</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.value}
                  onChangeText={(v) => updateWaterQuality(idx, 'value', v)}
                  keyboardType="numeric"
                  placeholder="Value"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Assessment</Text>
                <View style={styles.qualityBtnRow}>
                  <TouchableOpacity
                    style={[
                      styles.qualityPill,
                      row.status === 'Acceptable' && styles.qualityPillAcceptable
                    ]}
                    onPress={() => updateWaterQuality(idx, 'status', 'Acceptable')}
                  >
                    <Text style={[styles.qualityPillText, row.status === 'Acceptable' && styles.qualityPillTextActive]}>
                      Acceptable
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.qualityPill,
                      row.status === 'Concern' && styles.qualityPillConcern
                    ]}
                    onPress={() => updateWaterQuality(idx, 'status', 'Concern')}
                  >
                    <Text style={[styles.qualityPillText, row.status === 'Concern' && styles.qualityPillTextActive]}>
                      Concern
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. IRRIGATION ASSESSMENT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Irrigation Assessment</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Irrigation Method</Text>
            <TextInput style={styles.input} value={data.irrigationMethod} onChangeText={(v) => updateField('irrigationMethod', v)} placeholder="Drip / Furrow / Basin" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Irrigation Frequency</Text>
            <TextInput style={styles.input} value={data.irrigationFrequency} onChangeText={(v) => updateField('irrigationFrequency', v)} placeholder="Every 2 days" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Irrigation Uniformity</Text>
            <TextInput style={styles.input} value={data.irrigationUniformity} onChangeText={(v) => updateField('irrigationUniformity', v)} placeholder="e.g. 88%" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Water Shortage Period</Text>
            <TextInput style={styles.input} value={data.waterShortagePeriod} onChangeText={(v) => updateField('waterShortagePeriod', v)} placeholder="March - May" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Waterlogging</Text>
            <TextInput style={styles.input} value={data.waterlogging} onChangeText={(v) => updateField('waterlogging', v)} placeholder="None / Low / High" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Filtration Required</Text>
            <TextInput style={styles.input} value={data.filtrationRequired} onChangeText={(v) => updateField('filtrationRequired', v)} placeholder="Screen / Sand filter" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Treatment Required</Text>
            <TextInput style={styles.input} value={data.treatmentRequired} onChangeText={(v) => updateField('treatmentRequired', v)} placeholder="Acid treatment / None" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Major Water Problem</Text>
            <TextInput style={styles.input} value={data.majorWaterProblem} onChangeText={(v) => updateField('majorWaterProblem', v)} placeholder="Salinity / low discharge" />
          </View>
        </View>
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
  row: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  threeColRow: { flexDirection: 'row', gap: 8 },
  halfCol: { flex: 1 },
  thirdCol: { flex: 1 },
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
    marginBottom: 10,
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
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  radioBtn: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
  },
  radioBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  radioText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  radioTextActive: { color: '#FFF' },
  tableRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tableRowTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  qualityBtnRow: { flexDirection: 'row', gap: 6 },
  qualityPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  qualityPillAcceptable: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  qualityPillConcern: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  qualityPillText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  qualityPillTextActive: { color: '#FFF' },
});
