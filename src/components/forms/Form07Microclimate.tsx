import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { MicroclimateSurveyData, AtmosphericReadingRow, CropMicroclimateRow, WeatherStressObservationRow } from '../../types';

interface Form07MicroclimateProps {
  data: MicroclimateSurveyData;
  onChange: (updated: MicroclimateSurveyData) => void;
}

export default function Form07Microclimate({ data, onChange }: Form07MicroclimateProps) {
  const updateField = (field: keyof MicroclimateSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateAtmosphericParam = (
    index: number,
    reading: 'reading1' | 'reading2' | 'reading3',
    val: string
  ) => {
    const updated = [...data.atmosphericParameters];
    updated[index] = { ...updated[index], [reading]: val };
    onChange({ ...data, atmosphericParameters: updated });
  };

  const updateCropMicroclimate = (index: number, val: string) => {
    const updated = [...data.cropMicroclimate];
    updated[index] = { ...updated[index], reading: val };
    onChange({ ...data, cropMicroclimate: updated });
  };

  const updateStressObs = (index: number, val: string) => {
    const updated = [...data.stressObservations];
    updated[index] = { ...updated[index], observation: val };
    onChange({ ...data, stressObservations: updated });
  };

  const handleCaptureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'GPS permission required to capture weather station location.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (pos) {
        onChange({
          ...data,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
          elevationM: pos.coords.altitude ? pos.coords.altitude.toFixed(1) : data.elevationM,
        });
        Alert.alert('GPS Captured', `Lat: ${pos.coords.latitude.toFixed(6)}° N\nLng: ${pos.coords.longitude.toFixed(6)}° E`);
      }
    } catch (e: any) {
      Alert.alert('Location Error', e?.message || 'Error capturing GPS');
    }
  };

  return (
    <View style={styles.container}>
      {/* A. STATION INFORMATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Station Information</Text>

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
            <Text style={styles.label}>Station ID</Text>
            <TextInput style={styles.input} value={data.stationId} onChangeText={(v) => updateField('stationId', v)} placeholder="AWS-01" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Date & Time</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1.2 }]} value={data.date} onChangeText={(v) => updateField('date', v)} placeholder="Date" />
              <TextInput style={[styles.input, { flex: 0.8 }]} value={data.time} onChangeText={(v) => updateField('time', v)} placeholder="Time" />
            </View>
          </View>
        </View>

        {/* GPS Coordinates */}
        <View style={styles.gpsContainer}>
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Latitude (°)</Text>
              <TextInput style={styles.input} value={data.latitude} onChangeText={(v) => updateField('latitude', v)} keyboardType="numeric" placeholder="Lat" />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Longitude (°)</Text>
              <TextInput style={styles.input} value={data.longitude} onChangeText={(v) => updateField('longitude', v)} keyboardType="numeric" placeholder="Lng" />
            </View>
          </View>
          <TouchableOpacity style={styles.gpsBtn} onPress={handleCaptureGps}>
            <Ionicons name="location-outline" size={16} color="#FFF" />
            <Text style={styles.gpsBtnText}>Capture Station GPS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Elevation (m)</Text>
            <TextInput style={styles.input} value={data.elevationM} onChangeText={(v) => updateField('elevationM', v)} keyboardType="numeric" placeholder="e.g. 280" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sensor Height (m)</Text>
            <TextInput style={styles.input} value={data.sensorHeightM} onChangeText={(v) => updateField('sensorHeightM', v)} keyboardType="numeric" placeholder="e.g. 2.0" />
          </View>
        </View>

        <Text style={styles.label}>Weather Station Type</Text>
        <TextInput style={styles.input} value={data.weatherStationType} onChangeText={(v) => updateField('weatherStationType', v)} placeholder="Automatic Weather Station (AWS) / IoT Node" />
      </View>

      {/* B. ATMOSPHERIC PARAMETERS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Atmospheric Parameters</Text>
        <Text style={styles.sectionSub}>All 10 parameters across 3 scheduled readings with units:</Text>

        {data.atmosphericParameters.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>
              {row.parameter} ({row.unit})
            </Text>
            <View style={styles.threeColRow}>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Reading 1</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.reading1}
                  onChangeText={(v) => updateAtmosphericParam(idx, 'reading1', v)}
                  placeholder="R1"
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Reading 2</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.reading2}
                  onChangeText={(v) => updateAtmosphericParam(idx, 'reading2', v)}
                  placeholder="R2"
                />
              </View>
              <View style={styles.thirdCol}>
                <Text style={styles.subLabel}>Reading 3</Text>
                <TextInput
                  style={styles.smallInput}
                  value={row.reading3}
                  onChangeText={(v) => updateAtmosphericParam(idx, 'reading3', v)}
                  placeholder="R3"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* C. CROP MICROCLIMATE */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Crop Microclimate</Text>
        <Text style={styles.sectionSub}>Canopy, soil, leaf wetness, and radiation values:</Text>

        {data.cropMicroclimate.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <View style={styles.row}>
              <View style={{ flex: 1.5, justifyContent: 'center' }}>
                <Text style={styles.tableRowTitle}>{row.parameter} ({row.unit})</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={styles.smallInput}
                  value={row.reading}
                  onChangeText={(v) => updateCropMicroclimate(idx, v)}
                  placeholder="Observed value"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. WEATHER / STRESS OBSERVATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Weather / Stress Observation</Text>
        <Text style={styles.sectionSub}>Specific climatic stress conditions observed:</Text>

        {data.stressObservations.map((row, idx) => (
          <View key={row.parameter} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{row.parameter}</Text>
            <TextInput
              style={styles.smallInput}
              value={row.observation}
              onChangeText={(v) => updateStressObs(idx, v)}
              placeholder="Severity / duration observed"
            />
          </View>
        ))}

        <Text style={styles.label}>Microclimate Risk</Text>
        <View style={styles.radioGroup}>
          {(['Low', 'Medium', 'High'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.microclimateRisk === opt && styles.radioBtnActive]}
              onPress={() => updateField('microclimateRisk', opt)}
            >
              <Text style={[styles.radioText, data.microclimateRisk === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
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
  radioGroup: { flexDirection: 'row', gap: 8, marginTop: 8 },
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
