import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { CropSurveyData, CropHealthObservationRow } from '../../types';

interface Form05CropProps {
  data: CropSurveyData;
  onChange: (updated: CropSurveyData) => void;
}

export default function Form05Crop({ data, onChange }: Form05CropProps) {
  const updateField = (field: keyof CropSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateHealth = (index: number, key: keyof CropHealthObservationRow, val: string) => {
    const updated = [...data.cropHealth];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, cropHealth: updated });
  };

  return (
    <View style={styles.container}>
      {/* A. CROP IDENTIFICATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Crop Identification</Text>

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
            <Text style={styles.label}>Crop *</Text>
            <TextInput style={styles.input} value={data.crop} onChangeText={(v) => updateField('crop', v)} placeholder="e.g. Sugarcane" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Variety / Hybrid</Text>
            <TextInput style={styles.input} value={data.variety} onChangeText={(v) => updateField('variety', v)} placeholder="e.g. Co-86032" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Seed Source</Text>
            <TextInput style={styles.input} value={data.seedSource} onChangeText={(v) => updateField('seedSource', v)} placeholder="Certified / Own seed" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Growth Stage</Text>
            <TextInput style={styles.input} value={data.growthStage} onChangeText={(v) => updateField('growthStage', v)} placeholder="Tillering / Flowering" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sowing Date</Text>
            <TextInput style={styles.input} value={data.sowingDate} onChangeText={(v) => updateField('sowingDate', v)} placeholder="DD/MM/YYYY" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Transplanting Date</Text>
            <TextInput style={styles.input} value={data.transplantDate} onChangeText={(v) => updateField('transplantDate', v)} placeholder="DD/MM/YYYY" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Expected Harvest Date</Text>
            <TextInput style={styles.input} value={data.expectedHarvestDate} onChangeText={(v) => updateField('expectedHarvestDate', v)} placeholder="DD/MM/YYYY" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Crop Age (days)</Text>
            <TextInput style={styles.input} value={data.cropAgeDays} onChangeText={(v) => updateField('cropAgeDays', v)} keyboardType="numeric" placeholder="e.g. 75" />
          </View>
        </View>
      </View>

      {/* B. PLANT POPULATION & GEOMETRY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Plant Population & Geometry</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Row Spacing (cm)</Text>
            <TextInput style={styles.input} value={data.rowSpacingCm} onChangeText={(v) => updateField('rowSpacingCm', v)} keyboardType="numeric" placeholder="e.g. 120" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Plant Spacing (cm)</Text>
            <TextInput style={styles.input} value={data.plantSpacingCm} onChangeText={(v) => updateField('plantSpacingCm', v)} keyboardType="numeric" placeholder="e.g. 60" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Plant Population (plants/ha)</Text>
            <TextInput style={styles.input} value={data.plantPopulationPerHa} onChangeText={(v) => updateField('plantPopulationPerHa', v)} keyboardType="numeric" placeholder="e.g. 55,000" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Plant Height (cm)</Text>
            <TextInput style={styles.input} value={data.plantHeightCm} onChangeText={(v) => updateField('plantHeightCm', v)} keyboardType="numeric" placeholder="e.g. 180" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Stem Diameter (mm)</Text>
            <TextInput style={styles.input} value={data.stemDiameterMm} onChangeText={(v) => updateField('stemDiameterMm', v)} keyboardType="numeric" placeholder="e.g. 32" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Number of Leaves</Text>
            <TextInput style={styles.input} value={data.numLeaves} onChangeText={(v) => updateField('numLeaves', v)} keyboardType="numeric" placeholder="e.g. 14" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Leaf Area (cm²)</Text>
            <TextInput style={styles.input} value={data.leafAreaCm2} onChangeText={(v) => updateField('leafAreaCm2', v)} keyboardType="numeric" placeholder="e.g. 450" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Canopy Width (cm)</Text>
            <TextInput style={styles.input} value={data.canopyWidthCm} onChangeText={(v) => updateField('canopyWidthCm', v)} keyboardType="numeric" placeholder="e.g. 85" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Canopy Cover (%)</Text>
            <TextInput style={styles.input} value={data.canopyCoverPercent} onChangeText={(v) => updateField('canopyCoverPercent', v)} keyboardType="numeric" placeholder="e.g. 75" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Root Depth (cm)</Text>
            <TextInput style={styles.input} value={data.rootDepthCm} onChangeText={(v) => updateField('rootDepthCm', v)} keyboardType="numeric" placeholder="e.g. 45" />
          </View>
        </View>
      </View>

      {/* C. CROP HEALTH */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Crop Health</Text>
        <Text style={styles.sectionSub}>Observation / symptom value and severity percentage (%):</Text>

        {data.cropHealth.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{row.parameter}</Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Observation / Description</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.observation}
                  onChangeText={(v) => updateHealth(idx, 'observation', v)}
                  placeholder="e.g. Normal / Mild"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Severity %</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.severityPercent}
                  onChangeText={(v) => updateHealth(idx, 'severityPercent', v)}
                  keyboardType="numeric"
                  placeholder="0 - 100%"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. YIELD */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Yield</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Expected Yield (kg/ha)</Text>
            <TextInput style={styles.input} value={data.expectedYieldKgHa} onChangeText={(v) => updateField('expectedYieldKgHa', v)} keyboardType="numeric" placeholder="e.g. 95000" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Previous Yield (kg/ha)</Text>
            <TextInput style={styles.input} value={data.previousYieldKgHa} onChangeText={(v) => updateField('previousYieldKgHa', v)} keyboardType="numeric" placeholder="e.g. 88000" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Current Yield Estimate (kg/ha)</Text>
            <TextInput style={styles.input} value={data.currentYieldEstimateKgHa} onChangeText={(v) => updateField('currentYieldEstimateKgHa', v)} keyboardType="numeric" placeholder="e.g. 92000" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Fruits / Grains per Plant</Text>
            <TextInput style={styles.input} value={data.fruitsGramsPerPlant} onChangeText={(v) => updateField('fruitsGramsPerPlant', v)} keyboardType="numeric" placeholder="e.g. 8 tillers" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Avg Fruit / Grain Weight (g)</Text>
            <TextInput style={styles.input} value={data.avgFruitWeightG} onChangeText={(v) => updateField('avgFruitWeightG', v)} keyboardType="numeric" placeholder="e.g. 1.2 kg/cane" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Harvest Quantity (kg)</Text>
            <TextInput style={styles.input} value={data.harvestQuantityKg} onChangeText={(v) => updateField('harvestQuantityKg', v)} keyboardType="numeric" placeholder="e.g. 230000" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Quality Grade</Text>
            <TextInput style={styles.input} value={data.qualityGrade} onChangeText={(v) => updateField('qualityGrade', v)} placeholder="Grade A / First quality" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Yield-Limiting Factor</Text>
            <TextInput style={styles.input} value={data.yieldLimitingFactor} onChangeText={(v) => updateField('yieldLimitingFactor', v)} placeholder="Water deficit / borer" />
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
  halfCol: { flex: 1 },
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
  tableRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tableRowTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
});
