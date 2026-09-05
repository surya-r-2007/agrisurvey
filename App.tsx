import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'react-native';
import { theme } from './src/theme';

import HomeScreen from './src/screens/HomeScreen';
import FarmersScreen from './src/screens/FarmersScreen';
import FieldsScreen from './src/screens/FieldsScreen';
import SurveysScreen from './src/screens/SurveysScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <NavigationContainer>
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

              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            tabBarStyle: {
              paddingBottom: 5,
              height: 60,
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
            }
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
          <Tab.Screen name="Farmers" component={FarmersScreen} options={{ title: 'Farmers' }} />
          <Tab.Screen name="Fields" component={FieldsScreen} options={{ title: 'Fields & Maps' }} />
          <Tab.Screen name="Surveys" component={SurveysScreen} options={{ title: 'Surveys' }} />
          <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
