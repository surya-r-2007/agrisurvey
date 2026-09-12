import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { PestDiseaseSurveyData, SpatialDistributionZoneRow } from '../../types';
import GeotagPhotoCapture from '../GeotagPhotoCapture';

interface Form06PestDiseaseProps {
  data: PestDiseaseSurveyData;
  onChange: (updated: PestDiseaseSurveyData) => void;
}

export default function Form06PestDisease({ data, onChange }: Form06PestDiseaseProps) {
  const updateField = (field: keyof PestDiseaseSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateZone = (index: number, key: keyof SpatialDistributionZoneRow, val: string) => {
    const updated = [...data.spatialDistribution];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, spatialDistribution: updated });
  };

  const handleCaptureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS permission required for pest observation coordinates.');
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
      Alert.alert('Location Error', e?.message || 'Error capturing GPS');
    }
  };

  return (
    <View style={styles.container}>
      {/* A. OBSERVATION INFORMATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Observation Information</Text>

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
            <Text style={styles.label}>Observation Date</Text>
            <TextInput style={styles.input} value={data.observationDate} onChangeText={(v) => updateField('observationDate', v)} placeholder="DD/MM/YYYY" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Observer Name</Text>
            <TextInput style={styles.input} value={data.observer} onChangeText={(v) => updateField('observer', v)} placeholder="Entomologist / Surveyor" />
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
            <Text style={styles.gpsBtnText}>Capture Observation GPS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Crop</Text>
            <TextInput style={styles.input} value={data.crop} onChangeText={(v) => updateField('crop', v)} placeholder="Crop name" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Variety</Text>
            <TextInput style={styles.input} value={data.variety} onChangeText={(v) => updateField('variety', v)} placeholder="Variety" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Growth Stage</Text>
            <TextInput style={styles.input} value={data.growthStage} onChangeText={(v) => updateField('growthStage', v)} placeholder="e.g. Tillering" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sampling Area</Text>
            <TextInput style={styles.input} value={data.samplingArea} onChangeText={(v) => updateField('samplingArea', v)} placeholder="e.g. 100 m²" />
          </View>
        </View>
      </View>

      {/* B. PEST IDENTIFICATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Pest Identification</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Pest Common Name</Text>
            <TextInput style={styles.input} value={data.pestName} onChangeText={(v) => updateField('pestName', v)} placeholder="e.g. Early Shoot Borer" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Scientific Name</Text>
            <TextInput style={styles.input} value={data.scientificName} onChangeText={(v) => updateField('scientificName', v)} placeholder="Chilo infuscatellus" />
          </View>
        </View>

        <Text style={styles.label}>Pest Type</Text>
        <View style={styles.radioGroup}>
          {(['Insect', 'Mite', 'Nematode', 'Other'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.pestType === opt && styles.radioBtnActive]}
              onPress={() => updateField('pestType', opt)}
            >
              <Text style={[styles.radioText, data.pestType === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Life Stage</Text>
            <TextInput style={styles.input} value={data.lifeStage} onChangeText={(v) => updateField('lifeStage', v)} placeholder="Larva / Adult" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Host Plant Part</Text>
            <TextInput style={styles.input} value={data.hostPlantPart} onChangeText={(v) => updateField('hostPlantPart', v)} placeholder="Shoot / Leaves" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Population Density</Text>
            <TextInput style={styles.input} value={data.populationDensity} onChangeText={(v) => updateField('populationDensity', v)} placeholder="e.g. 3 larvae/plant" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Economic Threshold Status</Text>
            <TextInput style={styles.input} value={data.economicThresholdStatus} onChangeText={(v) => updateField('economicThresholdStatus', v)} placeholder="Below ETL / Above ETL" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Incidence (%)</Text>
            <TextInput style={styles.input} value={data.pestIncidencePercent} onChangeText={(v) => updateField('pestIncidencePercent', v)} keyboardType="numeric" placeholder="%" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Severity (%)</Text>
            <TextInput style={styles.input} value={data.pestSeverityPercent} onChangeText={(v) => updateField('pestSeverityPercent', v)} keyboardType="numeric" placeholder="%" />
          </View>
        </View>

        <Text style={styles.label}>Damage Symptom</Text>
        <TextInput style={styles.input} value={data.damageSymptom} onChangeText={(v) => updateField('damageSymptom', v)} placeholder="Dead heart symptom observed" />
      </View>

      {/* C. DISEASE IDENTIFICATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Disease Identification</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Disease Name</Text>
            <TextInput style={styles.input} value={data.diseaseName} onChangeText={(v) => updateField('diseaseName', v)} placeholder="e.g. Red Rot" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Causal Organism</Text>
            <TextInput style={styles.input} value={data.causalOrganism} onChangeText={(v) => updateField('causalOrganism', v)} placeholder="Colletotrichum falcatum" />
          </View>
        </View>

        <Text style={styles.label}>Disease Type</Text>
        <View style={styles.radioGroup}>
          {(['Fungal', 'Bacterial', 'Viral', 'Other'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.diseaseType === opt && styles.radioBtnActive]}
              onPress={() => updateField('diseaseType', opt)}
            >
              <Text style={[styles.radioText, data.diseaseType === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Affected Plant Part</Text>
            <TextInput style={styles.input} value={data.affectedPlantPart} onChangeText={(v) => updateField('affectedPlantPart', v)} placeholder="Stem / Foliage" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Diagnostic Method</Text>
            <TextInput style={styles.input} value={data.diagnosticMethod} onChangeText={(v) => updateField('diagnosticMethod', v)} placeholder="Visual / Lab / Strip" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Incidence (%)</Text>
            <TextInput style={styles.input} value={data.diseaseIncidencePercent} onChangeText={(v) => updateField('diseaseIncidencePercent', v)} keyboardType="numeric" placeholder="%" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Severity (%)</Text>
            <TextInput style={styles.input} value={data.diseaseSeverityPercent} onChangeText={(v) => updateField('diseaseSeverityPercent', v)} keyboardType="numeric" placeholder="%" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Disease Progression</Text>
            <TextInput style={styles.input} value={data.diseaseProgression} onChangeText={(v) => updateField('diseaseProgression', v)} placeholder="Initial / Spreading" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Economic Threshold</Text>
            <TextInput style={styles.input} value={data.economicThreshold} onChangeText={(v) => updateField('economicThreshold', v)} placeholder="Critical / Low" />
          </View>
        </View>

        <Text style={styles.label}>Symptom Description</Text>
        <TextInput style={styles.input} value={data.diseaseSymptomDesc} onChangeText={(v) => updateField('diseaseSymptomDesc', v)} placeholder="Reddish lesions on midrib" />
      </View>

      {/* D. SPATIAL DISTRIBUTION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Spatial Distribution</Text>
        <Text style={styles.sectionSub}>Zone coordinates (Z1–Z5), incidence %, and remarks:</Text>

        {data.spatialDistribution.map((z, idx) => (
          <View key={z.zone} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{z.zone}</Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>GPS Coordinates</Text>
                <TextInput
                  style={styles.smallInput}
                  value={z.gps}
                  onChangeText={(v) => updateZone(idx, 'gps', v)}
                  placeholder="Lat, Lng"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Pest / Disease</Text>
                <TextInput
                  style={styles.smallInput}
                  value={z.pestDisease}
                  onChangeText={(v) => updateZone(idx, 'pestDisease', v)}
                  placeholder="Target organism"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Incidence %</Text>
                <TextInput
                  style={styles.smallInput}
                  value={z.incidencePercent}
                  onChangeText={(v) => updateZone(idx, 'incidencePercent', v)}
                  keyboardType="numeric"
                  placeholder="%"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Severity %</Text>
                <TextInput
                  style={styles.smallInput}
                  value={z.severityPercent}
                  onChangeText={(v) => updateZone(idx, 'severityPercent', v)}
                  keyboardType="numeric"
                  placeholder="%"
                />
              </View>
            </View>
            <Text style={styles.subLabel}>Remarks</Text>
            <TextInput
              style={styles.smallInput}
              value={z.remarks}
              onChangeText={(v) => updateZone(idx, 'remarks', v)}
              placeholder="Zone condition / hot spots"
            />
          </View>
        ))}
      </View>

      {/* E. CONTROL */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>E. Control</Text>

        <Text style={styles.label}>Control Measure Already Applied</Text>
        <TextInput
          style={styles.input}
          value={data.controlMeasureApplied}
          onChangeText={(v) => updateField('controlMeasureApplied', v)}
          placeholder="e.g. Chlorantraniliprole 18.5 SC spray"
        />

        <Text style={styles.label}>Recommended Intervention</Text>
        <TextInput
          style={styles.input}
          value={data.recommendedIntervention}
          onChangeText={(v) => updateField('recommendedIntervention', v)}
          placeholder="e.g. Release Trichogramma chilonis @ 2.5 cc/ha"
        />

        <GeotagPhotoCapture
          photos={data.photos || []}
          onChange={(photos) => updateField('photos', photos)}
          title="Pest & Disease Photographic Evidence"
          description="Capture geotagged photos of pest damage symptoms, insect specimens, or disease spots."
          category="pest_disease"
          maxPhotos={6}
        />
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
});
