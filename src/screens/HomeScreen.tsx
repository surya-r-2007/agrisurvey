import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStore } from '../store/useStore';

export default function HomeScreen({ navigation }: any) {
  const { farmers, farms, parcels, surveys } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const totalFarmers = farmers.length;
  const totalFarms = farms.length;
  const totalFields = parcels.length;
  const totalSurveys = surveys.length;
  const completedSurveys = surveys.filter(s => s.status === 'Completed').length;
  const draftSurveys = surveys.filter(s => s.status === 'Draft').length;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Quick Actions */}
      <View style={styles.actionGrid}>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#C8E6C9' }]} onPress={() => navigation.navigate('Farmers')}>
          <Ionicons name="person-add" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionTitle, { color: theme.colors.primary }]}>+ Add Farmer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.primary }]} onPress={() => navigation.navigate('Farmers')}>
          <Ionicons name="business" size={24} color="#FFF" />
          <Text style={[styles.actionTitle, { color: '#FFF' }]}>+ Add Farm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.colors.secondary }]} onPress={() => navigation.navigate('Fields')}>
          <Ionicons name="map" size={24} color="#FFF" />
          <Text style={[styles.actionTitle, { color: '#FFF' }]}>+ Add Field</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFECB3' }]} onPress={() => navigation.navigate('Surveys')}>
          <Ionicons name="flash" size={24} color="#F57F17" />
          <Text style={[styles.actionTitle, { color: '#F57F17' }]}>New Survey</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Text style={styles.sectionTitle}>Block Telemetry</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Farmers</Text>
          <Text style={styles.statValue}>{totalFarmers}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Farms</Text>
          <Text style={styles.statValue}>{totalFarms}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Fields</Text>
          <Text style={styles.statValue}>{totalFields}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Surveys</Text>
          <Text style={styles.statValue}>{totalSurveys}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Completed</Text>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{completedSurveys}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Drafts</Text>
          <Text style={[styles.statValue, { color: '#F57F17' }]}>{draftSurveys}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.m,
    paddingBottom: 130,
  },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: theme.spacing.m,
  },
  profileInfo: {
    flex: 1,
  },
  roleText: {
    fontSize: 12,
    color: theme.colors.secondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F0',
    padding: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
  },
  syncText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.l,
  },
  actionCard: {
    width: '48%',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.s,
    justifyContent: 'space-between',
    height: 90,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  }
});
