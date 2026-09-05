import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStore } from '../store/useStore';

export default function ReportsScreen() {
  const { surveys } = useStore();

  const completed = surveys.filter(s => s.status === 'Completed').length;
  const drafts = surveys.filter(s => s.status === 'Draft').length;
  const flagged = surveys.filter(s => s.status === 'Flagged').length;
  const total = surveys.length || 1; // avoid div by 0

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Analytics & Reports</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Survey Completion Status</Text>
        
        <View style={styles.barContainer}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Completed</Text>
            <Text style={styles.barValue}>{completed}</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { backgroundColor: theme.colors.success, width: `${(completed / total) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.barContainer}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Drafts</Text>
            <Text style={styles.barValue}>{drafts}</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { backgroundColor: '#F57F17', width: `${(drafts / total) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.barContainer}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel}>Flagged</Text>
            <Text style={styles.barValue}>{flagged}</Text>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { backgroundColor: theme.colors.error, width: `${(flagged / total) * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Reports</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {surveys.slice(0, 3).map(survey => (
          <View key={survey.id} style={styles.reportRow}>
            <View style={styles.reportIcon}>
              <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportName}>Dossier {survey.id}</Text>
              <Text style={styles.reportDate}>{survey.auditedDate} • {survey.farmerName}</Text>
            </View>
            <TouchableOpacity style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={18} color={theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.m, paddingBottom: 80 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.l },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginLeft: 8 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.l, padding: theme.spacing.m, marginBottom: theme.spacing.l, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.m },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: theme.spacing.m },
  linkText: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' },
  barContainer: { marginBottom: theme.spacing.m },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  barLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: 'bold' },
  barValue: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text },
  barTrack: { height: 8, backgroundColor: '#F0F4F0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  reportRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.s, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  reportIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#E0F2E9', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.m },
  reportInfo: { flex: 1 },
  reportName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  reportDate: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  downloadBtn: { padding: 8 }
});
