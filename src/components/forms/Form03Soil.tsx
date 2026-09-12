import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { SoilSurveyData, PhysicalPropertySampleRow, ChemicalPropertyRow } from '../../types';
import GeotagPhotoCapture from '../GeotagPhotoCapture';

interface Form03SoilProps {
  data: SoilSurveyData;
  onChange: (updated: SoilSurveyData) => void;
}

export default function Form03Soil({ data, onChange }: Form03SoilProps) {
  const updateField = (field: keyof SoilSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updatePhysicalParam = (
    index: number,
    key: 'sample1' | 'sample2' | 'sample3',
    val: string
  ) => {
    const updated = [...data.physicalProperties];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, physicalProperties: updated });
  };

  const updateChemicalParam = (index: number, key: keyof ChemicalPropertyRow, val: string) => {
    const updated = [...data.chemicalProperties];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, chemicalProperties: updated });
  };

  const handleCaptureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS access is required to capture sampling point location.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (pos) {
        onChange({
          ...data,
          gpsLat: pos.coords.latitude.toFixed(6),
          gpsLng: pos.coords.longitude.toFixed(6),
        });
        Alert.alert('GPS Captured', `Lat: ${pos.coords.latitude.toFixed(6)}° N\nLng: ${pos.coords.longitude.toFixed(6)}° E`);
      }
    } catch (e: any) {
      Alert.alert('Location Error', e?.message || 'Failed to capture GPS');
    }
  };

  return (
    <View style={styles.container}>
      {/* A. SOIL SAMPLING INFORMATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Soil Sampling Information</Text>

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
            <Text style={styles.label}>Sample ID *</Text>
            <TextInput style={styles.input} value={data.sampleId} onChangeText={(v) => updateField('sampleId', v)} placeholder="e.g. SMP-01" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sampling Date</Text>
            <TextInput style={styles.input} value={data.samplingDate} onChangeText={(v) => updateField('samplingDate', v)} placeholder="DD/MM/YYYY" />
          </View>
        </View>

        {/* GPS Coordinates */}
        <View style={styles.gpsContainer}>
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>GPS Lat (°)</Text>
              <TextInput style={styles.input} value={data.gpsLat} onChangeText={(v) => updateField('gpsLat', v)} keyboardType="numeric" placeholder="e.g. 11.450" />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>GPS Lng (°)</Text>
              <TextInput style={styles.input} value={data.gpsLng} onChangeText={(v) => updateField('gpsLng', v)} keyboardType="numeric" placeholder="e.g. 77.320" />
            </View>
          </View>
          <TouchableOpacity style={styles.gpsBtn} onPress={handleCaptureGps}>
            <Ionicons name="location-outline" size={16} color="#FFF" />
            <Text style={styles.gpsBtnText}>Capture Sampling GPS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sampling Depth (cm)</Text>
            <TextInput style={styles.input} value={data.samplingDepthCm} onChangeText={(v) => updateField('samplingDepthCm', v)} placeholder="e.g. 0-15 cm" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>No. of Subsamples</Text>
            <TextInput style={styles.input} value={data.numSubsamples} onChangeText={(v) => updateField('numSubsamples', v)} keyboardType="numeric" placeholder="e.g. 8" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sampling Zone</Text>
            <TextInput style={styles.input} value={data.samplingZone} onChangeText={(v) => updateField('samplingZone', v)} placeholder="e.g. Zone A" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Previous Crop</Text>
            <TextInput style={styles.input} value={data.previousCrop} onChangeText={(v) => updateField('previousCrop', v)} placeholder="e.g. Groundnut" />
          </View>
        </View>

        <GeotagPhotoCapture
          photos={data.photos || []}
          onChange={(photos) => {
            updateField('photos', photos);
            if (photos[0]?.uri) {
              updateField('photoUrl', photos[0].uri);
            }
          }}
          title="Soil Core & Horizon Geotagged Photos"
          description="Capture photos of soil profile, core sample, and topsoil horizon."
          category="soil_core"
          maxPhotos={4}
        />
      </View>

      {/* B. PHYSICAL PROPERTIES */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Physical Properties</Text>
        <Text style={styles.sectionSub}>Comparative physical testing for Sample 1, Sample 2, Sample 3:</Text>

        {data.physicalProperties.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>
              {row.parameter} {row.unit ? `(${row.unit})` : ''}
            </Text>
            <View style={styles.threeColRow}>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Sample 1</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.sample1}
                  onChangeText={(v) => updatePhysicalParam(idx, 'sample1', v)}
                  placeholder="S1"
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Sample 2</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.sample2}
                  onChangeText={(v) => updatePhysicalParam(idx, 'sample2', v)}
                  placeholder="S2"
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Sample 3</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.sample3}
                  onChangeText={(v) => updatePhysicalParam(idx, 'sample3', v)}
                  placeholder="S3"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* C. CHEMICAL PROPERTIES */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Chemical Properties</Text>
        <Text style={styles.sectionSub}>All 14 parameters with exact values, units, and status:</Text>

        {data.chemicalProperties.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>
              {row.parameter} {row.unit !== '—' ? `(${row.unit})` : ''}
            </Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Measured Value</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.value}
                  onChangeText={(v) => updateChemicalParam(idx, 'value', v)}
                  keyboardType="numeric"
                  placeholder="e.g. 6.8"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Status</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.status}
                  onChangeText={(v) => updateChemicalParam(idx, 'status', v)}
                  placeholder="Low / Medium / High / Opt"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. SOIL CONDITION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Soil Condition</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Salinity</Text>
            <TextInput style={styles.input} value={data.salinity} onChangeText={(v) => updateField('salinity', v)} placeholder="Non-saline / Saline" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sodicity</Text>
            <TextInput style={styles.input} value={data.sodicity} onChangeText={(v) => updateField('sodicity', v)} placeholder="Non-sodic / Sodic" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Compaction</Text>
            <TextInput style={styles.input} value={data.compaction} onChangeText={(v) => updateField('compaction', v)} placeholder="Hardpan / Friable" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Root-Zone Condition</Text>
            <TextInput style={styles.input} value={data.rootZoneCondition} onChangeText={(v) => updateField('rootZoneCondition', v)} placeholder="Well aerated" />
          </View>
        </View>

        <Text style={styles.label}>Nutrient Deficiency Symptoms</Text>
        <TextInput style={styles.input} value={data.nutrientDeficiencySymptoms} onChangeText={(v) => updateField('nutrientDeficiencySymptoms', v)} placeholder="e.g. Interveinal chlorosis (Fe)" />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Soil Colour</Text>
            <TextInput style={styles.input} value={data.soilColour} onChangeText={(v) => updateField('soilColour', v)} placeholder="Red loam / Black soil" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Organic Residue</Text>
            <TextInput style={styles.input} value={data.organicResidue} onChangeText={(v) => updateField('organicResidue', v)} placeholder="Crop stubble present" />
          </View>
        </View>

        <Text style={styles.label}>Recommended Action</Text>
        <TextInput style={styles.input} value={data.recommendedAction} onChangeText={(v) => updateField('recommendedAction', v)} placeholder="e.g. Apply gypsum + FYM @ 10 t/ha" />
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
  gpsContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
  },
  gpsBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
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
