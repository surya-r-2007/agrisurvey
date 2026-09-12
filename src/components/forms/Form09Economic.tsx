import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { theme } from '../../theme';
import {
  EconomicSurveyData,
  LabourActivityRow,
  LossAssessmentRow,
  ProposedTechEconomics
} from '../../types';

interface Form09EconomicProps {
  data: EconomicSurveyData;
  onChange: (updated: EconomicSurveyData) => void;
}

export default function Form09Economic({ data, onChange }: Form09EconomicProps) {
  const updateField = (field: keyof EconomicSurveyData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const updateLabour = (index: number, key: keyof LabourActivityRow, val: string) => {
    const updated = [...data.labourBreakdown];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, labourBreakdown: updated });
  };

  const updateLoss = (index: number, key: keyof LossAssessmentRow, val: string) => {
    const updated = [...data.lossAssessment];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...data, lossAssessment: updated });
  };

  const updateTechEconomics = (key: keyof ProposedTechEconomics, val: string) => {
    onChange({
      ...data,
      techEconomics: { ...data.techEconomics, [key]: val }
    });
  };

  // Real-time financial calculations
  const grossRevNum = parseFloat(data.grossRevenueInr) || 0;
  const inputCostNum = parseFloat(data.totalInputCostInr) || 0;
  const labourCostNum = parseFloat(data.labourCostInr) || 0;
  const machineCostNum = parseFloat(data.machineryCostInr) || 0;
  const irrigCostNum = parseFloat(data.irrigationCostInr) || 0;
  const fertCostNum = parseFloat(data.fertilizerCostInr) || 0;
  const pestCostNum = parseFloat(data.pesticideCostInr) || 0;
  const seedCostNum = parseFloat(data.seedCostInr) || 0;
  const otherCostNum = parseFloat(data.otherCostInr) || 0;

  const totalCalculatedCosts =
    inputCostNum +
    labourCostNum +
    machineCostNum +
    irrigCostNum +
    fertCostNum +
    pestCostNum +
    seedCostNum +
    otherCostNum;

  const calculatedNet = Math.max(0, grossRevNum - totalCalculatedCosts);

  return (
    <View style={styles.container}>
      {/* A. FARM ECONOMICS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>A. Farm Economics</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Farm Area (ha)</Text>
            <TextInput style={styles.input} value={data.farmAreaHa} onChangeText={(v) => updateField('farmAreaHa', v)} keyboardType="numeric" placeholder="ha" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Crop Area (ha)</Text>
            <TextInput style={styles.input} value={data.cropAreaHa} onChangeText={(v) => updateField('cropAreaHa', v)} keyboardType="numeric" placeholder="ha" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Total Production (kg)</Text>
            <TextInput style={styles.input} value={data.totalProductionKg} onChangeText={(v) => updateField('totalProductionKg', v)} keyboardType="numeric" placeholder="kg" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Yield (kg/ha)</Text>
            <TextInput style={styles.input} value={data.yieldKgHa} onChangeText={(v) => updateField('yieldKgHa', v)} keyboardType="numeric" placeholder="kg/ha" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Market Price (₹/kg)</Text>
            <TextInput style={styles.input} value={data.marketPriceInrKg} onChangeText={(v) => updateField('marketPriceInrKg', v)} keyboardType="numeric" placeholder="₹/kg" />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Gross Revenue (₹)</Text>
            <TextInput style={styles.input} value={data.grossRevenueInr} onChangeText={(v) => updateField('grossRevenueInr', v)} keyboardType="numeric" placeholder="₹" />
          </View>
        </View>

        <View style={styles.costGrid}>
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Total Input Cost (₹)</Text>
              <TextInput style={styles.input} value={data.totalInputCostInr} onChangeText={(v) => updateField('totalInputCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Labour Cost (₹)</Text>
              <TextInput style={styles.input} value={data.labourCostInr} onChangeText={(v) => updateField('labourCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Machinery Cost (₹)</Text>
              <TextInput style={styles.input} value={data.machineryCostInr} onChangeText={(v) => updateField('machineryCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Irrigation Cost (₹)</Text>
              <TextInput style={styles.input} value={data.irrigationCostInr} onChangeText={(v) => updateField('irrigationCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Fertilizer Cost (₹)</Text>
              <TextInput style={styles.input} value={data.fertilizerCostInr} onChangeText={(v) => updateField('fertilizerCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Pesticide Cost (₹)</Text>
              <TextInput style={styles.input} value={data.pesticideCostInr} onChangeText={(v) => updateField('pesticideCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Seed Cost (₹)</Text>
              <TextInput style={styles.input} value={data.seedCostInr} onChangeText={(v) => updateField('seedCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Other Cost (₹)</Text>
              <TextInput style={styles.input} value={data.otherCostInr} onChangeText={(v) => updateField('otherCostInr', v)} keyboardType="numeric" placeholder="₹" />
            </View>
          </View>
        </View>

        <Text style={styles.label}>Net Income (₹)</Text>
        <TextInput
          style={[styles.input, { fontWeight: '700', color: theme.colors.primary }]}
          value={data.netIncomeInr || (calculatedNet > 0 ? calculatedNet.toString() : '')}
          onChangeText={(v) => updateField('netIncomeInr', v)}
          keyboardType="numeric"
          placeholder="e.g. 185000"
        />

        {grossRevNum > 0 && (
          <View style={styles.summaryBanner}>
            <Text style={styles.summaryBannerTitle}>Estimated Profitability</Text>
            <Text style={styles.summaryBannerText}>
              Gross: ₹{grossRevNum.toLocaleString()} | Total Costs: ₹{totalCalculatedCosts.toLocaleString()}
            </Text>
            <Text style={styles.summaryBannerNet}>
              Calculated Net Margin: ₹{calculatedNet.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* B. LABOUR */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>B. Labour Activities</Text>
        <Text style={styles.sectionSub}>Labour days, male/female distribution, and total cost:</Text>

        {data.labourBreakdown.map((item, idx) => (
          <View key={item.activity} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{item.activity}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Days</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.days}
                  onChangeText={(v) => updateLabour(idx, 'days', v)}
                  keyboardType="numeric"
                  placeholder="Days"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Male</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.male}
                  onChangeText={(v) => updateLabour(idx, 'male', v)}
                  keyboardType="numeric"
                  placeholder="Male"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Female</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.female}
                  onChangeText={(v) => updateLabour(idx, 'female', v)}
                  keyboardType="numeric"
                  placeholder="Female"
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.subLabel}>Cost (₹)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.costInr}
                  onChangeText={(v) => updateLabour(idx, 'costInr', v)}
                  keyboardType="numeric"
                  placeholder="₹ Cost"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* C. LOSS ASSESSMENT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>C. Loss Assessment</Text>
        <Text style={styles.sectionSub}>Quantity lost, percent loss, and financial valuation:</Text>

        {data.lossAssessment.map((item, idx) => (
          <View key={item.source} style={styles.tableRowCard}>
            <Text style={styles.tableRowTitle}>{item.source}</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Qty Lost</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.qtyLost}
                  onChangeText={(v) => updateLoss(idx, 'qtyLost', v)}
                  placeholder="kg / tonnes"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>% Loss</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.percentLoss}
                  onChangeText={(v) => updateLoss(idx, 'percentLoss', v)}
                  keyboardType="numeric"
                  placeholder="%"
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Text style={styles.subLabel}>Financial Loss (₹)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={item.financialLossInr}
                  onChangeText={(v) => updateLoss(idx, 'financialLossInr', v)}
                  keyboardType="numeric"
                  placeholder="₹ Loss"
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* D. TECHNOLOGY ECONOMICS */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>D. Technology Economics</Text>
        <Text style={styles.sectionSub}>Existing vs With Proposed Technology economics & ROI:</Text>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Investment ₹</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.investmentInr}
              onChangeText={(v) => updateTechEconomics('investmentInr', v)}
              keyboardType="numeric"
              placeholder="e.g. 65000"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Operating Cost ₹ / year</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.operatingCostInrYr}
              onChangeText={(v) => updateTechEconomics('operatingCostInrYr', v)}
              keyboardType="numeric"
              placeholder="e.g. 5000"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Input Saving ₹</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.inputSavingInr}
              onChangeText={(v) => updateTechEconomics('inputSavingInr', v)}
              keyboardType="numeric"
              placeholder="₹ Saved"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Labour Saving ₹</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.labourSavingInr}
              onChangeText={(v) => updateTechEconomics('labourSavingInr', v)}
              keyboardType="numeric"
              placeholder="₹ Saved"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Yield Increase %</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.yieldIncreasePercent}
              onChangeText={(v) => updateTechEconomics('yieldIncreasePercent', v)}
              keyboardType="numeric"
              placeholder="e.g. 15%"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Revenue Increase ₹</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.revenueIncreaseInr}
              onChangeText={(v) => updateTechEconomics('revenueIncreaseInr', v)}
              keyboardType="numeric"
              placeholder="₹ Extra"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Net Benefit ₹</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.netBenefitInr}
              onChangeText={(v) => updateTechEconomics('netBenefitInr', v)}
              keyboardType="numeric"
              placeholder="Net ₹ Benefit"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>ROI %</Text>
            <TextInput
              style={styles.input}
              value={data.techEconomics.roiPercent}
              onChangeText={(v) => updateTechEconomics('roiPercent', v)}
              keyboardType="numeric"
              placeholder="e.g. 140%"
            />
          </View>
        </View>

        <Text style={styles.label}>Payback Period</Text>
        <TextInput
          style={styles.input}
          value={data.techEconomics.paybackPeriodYears}
          onChangeText={(v) => updateTechEconomics('paybackPeriodYears', v)}
          placeholder="e.g. 1.5 seasons / years"
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
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
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
    marginBottom: 8,
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
  costGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  summaryBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryBannerTitle: { fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 2 },
  summaryBannerText: { fontSize: 12, color: '#047857' },
  summaryBannerNet: { fontSize: 13, fontWeight: '700', color: '#065F46', marginTop: 4 },
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
