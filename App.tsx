import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Platform, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import { theme } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import FarmersScreen from './src/screens/FarmersScreen';
import FieldsScreen from './src/screens/FieldsScreen';
import SurveysScreen from './src/screens/SurveysScreen';
import ReportsScreen from './src/screens/ReportsScreen';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Boundary Error:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color={theme.colors.secondary} />
          <Text style={styles.errorTitle}>AgriSurvey Recovered</Text>
          <Text style={styles.errorSub}>An unexpected UI glitch occurred. Tap below to resume.</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={this.handleRestart}>
            <Text style={styles.restartBtnText}>Resume Application</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Farmers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Fields') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Surveys') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }

          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        headerTintColor: theme.colors.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : Math.max(68, 56 + insets.bottom),
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 6,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 1,
          marginBottom: 2,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Farmers" component={FarmersScreen} options={{ title: 'Farmers' }} />
      <Tab.Screen name="Fields" component={FieldsScreen} options={{ title: 'Fields & Maps' }} />
      <Tab.Screen name="Surveys" component={SurveysScreen} options={{ title: 'Surveys' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepareFonts() {
      try {
        await Font.loadAsync(Ionicons.font);
      } catch (e) {
        console.warn('Font load warning:', e);
      } finally {
        setFontsLoaded(true);
      }
    }
    prepareFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 12,
  },
  errorSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  restartBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  restartBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
