import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../../theme';
import { FieldGeometrySurveyData, IrrigationComponentRow } from '../../types';
import GeotagPhotoCapture from '../GeotagPhotoCapture';

interface Form02FieldProps {
  data: FieldGeometrySurveyData;
  onChange: (updated: FieldGeometrySurveyData) => void;
}

export default function Form02Field({ data, onChange }: Form02FieldProps) {
  const updateField = (field: keyof FieldGeometrySurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateComponent = (index: number, key: keyof IrrigationComponentRow, val: string) => {
    const updated = [...data.irrigationComponents];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, irrigationComponents: updated });
  };

  const handleCaptureGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'GPS permission is required to fetch field coordinates. Please grant permission in settings.'
        );
        return;
      }

      let pos: Location.LocationObject | null = null;
      try {
        pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      } catch {
        pos = await Location.getLastKnownPositionAsync({});
      }

      if (pos) {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const alt = pos.coords.altitude ? pos.coords.altitude.toFixed(1) : '';
        onChange({
          ...data,
          gpsLat: lat,
          gpsLng: lng,
          altitude: alt || data.altitude,
        });
        Alert.alert('GPS Captured', `Lat: ${lat}° N\nLng: ${lng}° E${alt ? `\nAlt: ${alt} m` : ''}`);
      } else {
        Alert.alert('GPS Signal Error', 'Unable to retrieve location coordinates.');
      }
    } catch (err: any) {
      Alert.alert('Location Error', err?.message || 'Error capturing location.');
    }
  };

  return (
    <View style={styles.container}>
      {/* A. FIELD IDENTIFICATION & GEOMETRY */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Field Identification & Geometry</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Survey ID</Text>
            <TextInput style={[styles.input, styles.readonlyInput]} value={data.surveyId} editable={false} />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Field ID *</Text>
            <TextInput
              style={styles.input}
              value={data.fieldId}
              onChangeText={(v) => updateField('fieldId', v)}
              placeholder="e.g. FLD-01"
            />
          </View>
        </View>

        {/* GPS Capture */}
        <View style={styles.gpsContainer}>
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>GPS Latitude (°)</Text>
              <TextInput
                style={styles.input}
                value={data.gpsLat}
                onChangeText={(v) => updateField('gpsLat', v)}
                keyboardType="numeric"
                placeholder="e.g. 11.504230"
              />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>GPS Longitude (°)</Text>
              <TextInput
                style={styles.input}
                value={data.gpsLng}
                onChangeText={(v) => updateField('gpsLng', v)}
                keyboardType="numeric"
                placeholder="e.g. 77.234120"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.gpsBtn} onPress={handleCaptureGps}>
            <Ionicons name="navigate-circle" size={18} color="#FFF" />
            <Text style={styles.gpsBtnText}>Capture Device GPS Location</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Altitude / Elevation (m)</Text>
            <TextInput
              style={styles.input}
              value={data.altitude}
              onChangeText={(v) => updateField('altitude', v)}
              keyboardType="numeric"
              placeholder="e.g. 280"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Field Area (m² / ha)</Text>
            <TextInput
              style={styles.input}
              value={data.fieldAreaHa}
              onChangeText={(v) => updateField('fieldAreaHa', v)}
              placeholder="e.g. 2.5 ha"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Field Length (m)</Text>
            <TextInput
              style={styles.input}
              value={data.fieldLengthM}
              onChangeText={(v) => updateField('fieldLengthM', v)}
              keyboardType="numeric"
              placeholder="e.g. 200"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Field Width (m)</Text>
            <TextInput
              style={styles.input}
              value={data.fieldWidthM}
              onChangeText={(v) => updateField('fieldWidthM', v)}
              keyboardType="numeric"
              placeholder="e.g. 125"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Perimeter (m)</Text>
            <TextInput
              style={styles.input}
              value={data.perimeterM}
              onChangeText={(v) => updateField('perimeterM', v)}
              keyboardType="numeric"
              placeholder="e.g. 650"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Boundary Type</Text>
            <TextInput
              style={styles.input}
              value={data.boundaryType}
              onChangeText={(v) => updateField('boundaryType', v)}
              placeholder="Fence / Bund / Trench"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Field Shape</Text>
            <TextInput
              style={styles.input}
              value={data.fieldShape}
              onChangeText={(v) => updateField('fieldShape', v)}
              placeholder="Rectangular / Irregular"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Slope (%)</Text>
            <TextInput
              style={styles.input}
              value={data.slopePercent}
              onChangeText={(v) => updateField('slopePercent', v)}
              keyboardType="numeric"
              placeholder="e.g. 1.5"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Slope Direction (°)</Text>
            <TextInput
              style={styles.input}
              value={data.slopeDirection}
              onChangeText={(v) => updateField('slopeDirection', v)}
              placeholder="e.g. 90° East"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Highest Elevation (m)</Text>
            <TextInput
              style={styles.input}
              value={data.highestElevM}
              onChangeText={(v) => updateField('highestElevM', v)}
              keyboardType="numeric"
              placeholder="e.g. 285"
            />
          </View>
        </View>

        <Text style={styles.label}>Lowest Elevation (m)</Text>
        <TextInput
          style={styles.input}
          value={data.lowestElevM}
          onChangeText={(v) => updateField('lowestElevM', v)}
          keyboardType="numeric"
          placeholder="e.g. 278"
        />
      </View>

      {/* B. SOIL SURFACE & DRAINAGE */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Soil Surface & Drainage</Text>

        <Text style={styles.label}>Surface Condition</Text>
        <TextInput
          style={styles.input}
          value={data.surfaceCondition}
          onChangeText={(v) => updateField('surfaceCondition', v)}
          placeholder="e.g. Smooth, Cloddy, Crusted"
        />

        <Text style={styles.label}>Soil Erosion</Text>
        <View style={styles.radioGroup}>
          {(['None', 'Low', 'Medium', 'High'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.soilErosion === opt && styles.radioBtnActive]}
              onPress={() => updateField('soilErosion', opt)}
            >
              <Text style={[styles.radioText, data.soilErosion === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Waterlogging</Text>
        <View style={styles.radioGroup}>
          {(['None', 'Low', 'Medium', 'High'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.waterlogging === opt && styles.radioBtnActive]}
              onPress={() => updateField('waterlogging', opt)}
            >
              <Text style={[styles.radioText, data.waterlogging === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Natural Drainage</Text>
        <View style={styles.radioGroup}>
          {(['Poor', 'Moderate', 'Good'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.naturalDrainage === opt && styles.radioBtnActive]}
              onPress={() => updateField('naturalDrainage', opt)}
            >
              <Text style={[styles.radioText, data.naturalDrainage === opt && styles.radioTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Drain Type</Text>
            <TextInput
              style={styles.input}
              value={data.drainType}
              onChangeText={(v) => updateField('drainType', v)}
              placeholder="Open ditch / Subsurface"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Drain Spacing (m)</Text>
            <TextInput
              style={styles.input}
              value={data.drainSpacingM}
              onChangeText={(v) => updateField('drainSpacingM', v)}
              keyboardType="numeric"
              placeholder="e.g. 15"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Drain Depth (m)</Text>
            <TextInput
              style={styles.input}
              value={data.drainDepthM}
              onChangeText={(v) => updateField('drainDepthM', v)}
              keyboardType="numeric"
              placeholder="e.g. 1.2"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Runoff Observed</Text>
            <TextInput
              style={styles.input}
              value={data.runoffObserved}
              onChangeText={(v) => updateField('runoffObserved', v)}
              placeholder="Low / Moderate / High"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Ponding Locations</Text>
            <TextInput
              style={styles.input}
              value={data.pondingLocations}
              onChangeText={(v) => updateField('pondingLocations', v)}
              placeholder="North corner / None"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Cracks / Compaction</Text>
            <TextInput
              style={styles.input}
              value={data.cracksCompaction}
              onChangeText={(v) => updateField('cracksCompaction', v)}
              placeholder="Surface cracks observed"
            />
          </View>
        </View>
      </View>

      {/* C. IRRIGATION LAYOUT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Irrigation Layout</Text>
        <Text style={styles.sectionSub}>Specify components, type, quantity, size/capacity, condition:</Text>

        {data.irrigationComponents.map((comp, idx) => (
          <View key={comp.component} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{comp.component}</Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Type</Text>
                <TextInput
                  style={styles.smallInput}
                  value={comp.type}
                  onChangeText={(v) => updateComponent(idx, 'type', v)}
                  placeholder="e.g. Submersible / PVC"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Quantity</Text>
                <TextInput
                  style={styles.smallInput}
                  value={comp.quantity}
                  onChangeText={(v) => updateComponent(idx, 'quantity', v)}
                  placeholder="e.g. 1 / 450 m"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Size / Capacity</Text>
                <TextInput
                  style={styles.smallInput}
                  value={comp.sizeCapacity}
                  onChangeText={(v) => updateComponent(idx, 'sizeCapacity', v)}
                  placeholder="e.g. 7.5 HP / 63mm"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Condition</Text>
                <TextInput
                  style={styles.smallInput}
                  value={comp.condition}
                  onChangeText={(v) => updateComponent(idx, 'condition', v)}
                  placeholder="Good / Needs repair"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. FIELD MAPPING */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Field Mapping</Text>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkBtn, data.gpsBoundaryRecorded && styles.checkBtnActive]}
            onPress={() => updateField('gpsBoundaryRecorded', !data.gpsBoundaryRecorded)}
          >
            <Ionicons
              name={data.gpsBoundaryRecorded ? 'checkbox' : 'square-outline'}
              size={20}
              color={data.gpsBoundaryRecorded ? theme.colors.primary : '#94A3B8'}
            />
            <Text style={styles.checkLabel}>GPS boundary recorded</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.checkBtn, data.fieldMapAvailable && styles.checkBtnActive]}
            onPress={() => updateField('fieldMapAvailable', !data.fieldMapAvailable)}
          >
            <Ionicons
              name={data.fieldMapAvailable ? 'checkbox' : 'square-outline'}
              size={20}
              color={data.fieldMapAvailable ? theme.colors.primary : '#94A3B8'}
            />
            <Text style={styles.checkLabel}>Field map available</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={[styles.checkBtn, data.droneSurveyRequired && styles.checkBtnActive]}
            onPress={() => updateField('droneSurveyRequired', !data.droneSurveyRequired)}
          >
            <Ionicons
              name={data.droneSurveyRequired ? 'checkbox' : 'square-outline'}
              size={20}
              color={data.droneSurveyRequired ? theme.colors.primary : '#94A3B8'}
            />
            <Text style={styles.checkLabel}>Drone survey required</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Irrigation Zones</Text>
            <TextInput
              style={styles.input}
              value={data.irrigationZones}
              onChangeText={(v) => updateField('irrigationZones', v)}
              placeholder="Zone 1, Zone 2"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Problem Zones</Text>
            <TextInput
              style={styles.input}
              value={data.problemZones}
              onChangeText={(v) => updateField('problemZones', v)}
              placeholder="Waterlogged corner"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Sampling Points</Text>
            <TextInput
              style={styles.input}
              value={data.samplingPoints}
              onChangeText={(v) => updateField('samplingPoints', v)}
              placeholder="e.g. 5 points"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Photographs Taken</Text>
            <TextInput
              style={styles.input}
              value={data.photographsTaken}
              onChangeText={(v) => updateField('photographsTaken', v)}
              placeholder="e.g. 4 photos"
            />
          </View>
        </View>

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={styles.input}
          value={data.remarks}
          onChangeText={(v) => updateField('remarks', v)}
          placeholder="Any surveying notes"
        />

        <GeotagPhotoCapture
          photos={data.photos || []}
          onChange={(photos) => {
            updateField('photos', photos);
            if (photos.length > 0 && !data.photographsTaken) {
              updateField('photographsTaken', `${photos.length} geotagged photo(s) captured`);
            }
          }}
          title="Field & Boundary Geotagged Photos"
          description="Capture verified photos of field corner stones, boundary markers, and terrain."
          category="field_boundary"
          maxPhotos={8}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
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
    paddingVertical: 10,
  },
  gpsBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
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
  tableRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tableRowTitle: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBtnActive: {},
  checkLabel: { fontSize: 13, color: '#334155', fontWeight: '500' },
});
