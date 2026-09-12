import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { FarmerSurveyData, FarmingPracticeRow, ProblemConstraintRow } from '../../types';
import LocationSelector from '../LocationSelector';

interface Form01FarmerProps {
  data: FarmerSurveyData;
  onChange: (updated: FarmerSurveyData) => void;
}

export default function Form01Farmer({ data, onChange }: Form01FarmerProps) {
  const updateField = (field: keyof FarmerSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updatePractice = (index: number, key: keyof FarmingPracticeRow, val: string) => {
    const updated = [...data.practices];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, practices: updated });
  };

  const updateProblem = (index: number, key: keyof ProblemConstraintRow, val: any) => {
    const updated = [...data.problems];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, problems: updated });
  };

  return (
    <View style={styles.container}>
      {/* A. IDENTIFICATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Identification</Text>
        
        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Survey ID</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              value={data.surveyId}
              editable={false}
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={data.date}
              onChangeText={(v) => updateField('date', v)}
              placeholder="DD/MM/YYYY"
            />
          </View>
        </View>

        <Text style={styles.label}>Farmer / Stakeholder Name *</Text>
        <TextInput
          style={styles.input}
          value={data.farmerName}
          onChangeText={(v) => updateField('farmerName', v)}
          placeholder="Enter farmer name"
        />

        {/* Location Hierarchy Selector */}
        <LocationSelector
          title="Survey Location (District → Taluk → Village)"
          initialSelection={{
            districtId: data.districtId,
            districtName: data.district,
            talukId: data.talukId,
            talukName: data.taluk,
            villageId: data.villageId,
            villageName: data.village,
          }}
          onLocationChange={(loc) => {
            onChange({
              ...data,
              district: loc.districtName,
              districtId: loc.districtId,
              taluk: loc.talukName,
              talukId: loc.talukId,
              village: loc.villageName,
              villageId: loc.villageId,
            });
          }}
        />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Contact Phone</Text>
            <TextInput
              style={styles.input}
              value={data.contact}
              onChangeText={(v) => updateField('contact', v)}
              keyboardType="phone-pad"
              placeholder="e.g. 9876543210"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Farm ID</Text>
            <TextInput
              style={styles.input}
              value={data.farmId}
              onChangeText={(v) => updateField('farmId', v)}
              placeholder="e.g. FRM-01"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Total Land Area</Text>
            <TextInput
              style={styles.input}
              value={data.totalLandArea}
              onChangeText={(v) => updateField('totalLandArea', v)}
              placeholder="e.g. 3.5 ha"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Surveyor Name</Text>
            <TextInput
              style={styles.input}
              value={data.surveyor}
              onChangeText={(v) => updateField('surveyor', v)}
              placeholder="Officer / Surveyor"
            />
          </View>
        </View>
      </View>

      {/* B. FARMER & FARM PROFILE */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Farmer & Farm Profile</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Farming Experience (years)</Text>
            <TextInput
              style={styles.input}
              value={data.farmingExperienceYears}
              onChangeText={(v) => updateField('farmingExperienceYears', v)}
              keyboardType="numeric"
              placeholder="e.g. 15"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Main Occupation</Text>
            <TextInput
              style={styles.input}
              value={data.mainOccupation}
              onChangeText={(v) => updateField('mainOccupation', v)}
              placeholder="e.g. Farming"
            />
          </View>
        </View>

        <Text style={styles.label}>Farm Ownership</Text>
        <View style={styles.radioGroup}>
          {(['Owned', 'Leased', 'Both'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.farmOwnership === opt && styles.radioBtnActive]}
              onPress={() => updateField('farmOwnership', opt)}
            >
              <Text style={[styles.radioText, data.farmOwnership === opt && styles.radioTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Irrigated Area (ha)</Text>
            <TextInput
              style={styles.input}
              value={data.irrigatedAreaHa}
              onChangeText={(v) => updateField('irrigatedAreaHa', v)}
              keyboardType="numeric"
              placeholder="e.g. 2.0"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Rainfed Area (ha)</Text>
            <TextInput
              style={styles.input}
              value={data.rainfedAreaHa}
              onChangeText={(v) => updateField('rainfedAreaHa', v)}
              keyboardType="numeric"
              placeholder="e.g. 1.5"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Number of Fields</Text>
            <TextInput
              style={styles.input}
              value={data.numFields}
              onChangeText={(v) => updateField('numFields', v)}
              keyboardType="numeric"
              placeholder="e.g. 3"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Main Crops</Text>
            <TextInput
              style={styles.input}
              value={data.mainCrops}
              onChangeText={(v) => updateField('mainCrops', v)}
              placeholder="e.g. Sugarcane, Paddy"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Cropping System</Text>
            <TextInput
              style={styles.input}
              value={data.croppingSystem}
              onChangeText={(v) => updateField('croppingSystem', v)}
              placeholder="Monoculture / Intercropping"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Previous Crop</Text>
            <TextInput
              style={styles.input}
              value={data.previousCrop}
              onChangeText={(v) => updateField('previousCrop', v)}
              placeholder="e.g. Black gram"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Crop Rotation Followed</Text>
            <TextInput
              style={styles.input}
              value={data.cropRotation}
              onChangeText={(v) => updateField('cropRotation', v)}
              placeholder="e.g. Sugarcane -> Pulse"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Avg Annual Production</Text>
            <TextInput
              style={styles.input}
              value={data.avgAnnualProduction}
              onChangeText={(v) => updateField('avgAnnualProduction', v)}
              placeholder="e.g. 90 tonnes"
            />
          </View>
        </View>

        <Text style={styles.label}>Main Source of Irrigation</Text>
        <TextInput
          style={styles.input}
          value={data.mainIrrigationSource}
          onChangeText={(v) => updateField('mainIrrigationSource', v)}
          placeholder="e.g. Borewell / Canal"
        />

        <Text style={styles.label}>Water Availability</Text>
        <View style={styles.radioGroup}>
          {(['Low', 'Medium', 'High'] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.radioBtn, data.waterAvailability === opt && styles.radioBtnActive]}
              onPress={() => updateField('waterAvailability', opt)}
            >
              <Text style={[styles.radioText, data.waterAvailability === opt && styles.radioTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Major Farm Machinery</Text>
        <TextInput
          style={styles.input}
          value={data.majorMachinery}
          onChangeText={(v) => updateField('majorMachinery', v)}
          placeholder="e.g. Tractor, Power Weeder"
        />

        <Text style={styles.label}>Major Sensors / Technology Used</Text>
        <TextInput
          style={styles.input}
          value={data.majorTechUsed}
          onChangeText={(v) => updateField('majorTechUsed', v)}
          placeholder="e.g. Drip automation, Soil moisture sensor"
        />
      </View>

      {/* C. CURRENT FARMING PRACTICES */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Current Farming Practices</Text>
        <Text style={styles.sectionSub}>Record method, frequency, rate and remarks for each practice:</Text>

        {data.practices.map((p, idx) => (
          <View key={p.practice} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{idx + 1}. {p.practice}</Text>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Method Used</Text>
                <TextInput
                  style={styles.smallInput}
                  value={p.method}
                  onChangeText={(v) => updatePractice(idx, 'method', v)}
                  placeholder="e.g. Drip / Manual"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Frequency</Text>
                <TextInput
                  style={styles.smallInput}
                  value={p.frequency}
                  onChangeText={(v) => updatePractice(idx, 'frequency', v)}
                  placeholder="e.g. Weekly / Monthly"
                />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Quantity / Rate</Text>
                <TextInput
                  style={styles.smallInput}
                  value={p.quantity}
                  onChangeText={(v) => updatePractice(idx, 'quantity', v)}
                  placeholder="e.g. 50 kg/ha"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Remarks</Text>
                <TextInput
                  style={styles.smallInput}
                  value={p.remarks}
                  onChangeText={(v) => updatePractice(idx, 'remarks', v)}
                  placeholder="Any observations"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. PROBLEMS & CONSTRAINTS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Problems & Constraints</Text>
        <Text style={styles.sectionSub}>Rate severity (1–5), frequency, and current solution:</Text>

        {data.problems.map((prob, idx) => (
          <View key={prob.problem} style={styles.tableRowCard}>
            <View style={styles.problemHeader}>
              <Text style={styles.tableRowTitle}>{idx + 1}. {prob.problem}</Text>
              {/* Severity 1-5 selector */}
              <View style={styles.severityBar}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.severityBtn,
                      prob.severity === s && styles.severityBtnActive
                    ]}
                    onPress={() => updateProblem(idx, 'severity', s)}
                  >
                    <Text style={[styles.severityText, prob.severity === s && styles.severityTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Frequency</Text>
                <TextInput
                  style={styles.smallInput}
                  value={prob.frequency}
                  onChangeText={(v) => updateProblem(idx, 'frequency', v)}
                  placeholder="e.g. Seasonal / High"
                />
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.subLabel}>Current Solution</Text>
                <TextInput
                  style={styles.smallInput}
                  value={prob.solution}
                  onChangeText={(v) => updateProblem(idx, 'solution', v)}
                  placeholder="Current farmer measure"
                />
              </View>
            </View>
          </View>
        ))}

        <Text style={styles.label}>Farmer&apos;s Priority Problem</Text>
        <TextInput
          style={styles.input}
          value={data.farmerPriorityProblem}
          onChangeText={(v) => updateField('farmerPriorityProblem', v)}
          placeholder="Describe primary agricultural bottleneck"
        />

        <Text style={styles.label}>Expected Technology / Support</Text>
        <TextInput
          style={styles.input}
          value={data.expectedSupport}
          onChangeText={(v) => updateField('expectedSupport', v)}
          placeholder="Tech / financial / government support needed"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
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
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  halfCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
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
  readonlyInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
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
  radioGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  radioBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  radioBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  radioTextActive: {
    color: '#FFF',
  },
  tableRowCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tableRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  problemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBar: {
    flexDirection: 'row',
    gap: 4,
  },
  severityBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  severityBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  severityTextActive: {
    color: '#FFF',
  },
});
