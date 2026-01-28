// App Principal - Fútbol Manager (VERSION ULTRA SIMPLE)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GameProvider, useGame } from './src/context/GameContext';

// Pantallas
import MenuScreen from './src/screens/MenuScreen';
import TeamSelectScreen from './src/screens/TeamSelectScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MatchScreen from './src/screens/MatchScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import TacticsScreen from './src/screens/TacticsScreen';
import SquadScreen from './src/screens/SquadScreen';
import TransferHubScreen from './src/screens/TransferHubScreen';
import InboxScreen from './src/screens/InboxScreen';
import PlayerSearchScreen from './src/screens/PlayerSearchScreen';
import TransferListScreen from './src/screens/TransferListScreen';

import ManagerScreen from './src/screens/ManagerScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#238636" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

function AppNavigator() {
  const { state } = useGame();

  if (state.loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="TeamSelect" component={TeamSelectScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Match" component={MatchScreen} />
      <Stack.Screen name="Standings" component={StandingsScreen} />
      <Stack.Screen name="Tactics" component={TacticsScreen} />
      <Stack.Screen name="Squad" component={SquadScreen} />
      <Stack.Screen name="TransferHub" component={TransferHubScreen} />
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="Manager" component={ManagerScreen} />
      <Stack.Screen name="PlayerSearch" component={PlayerSearchScreen} />
      <Stack.Screen name="TransferList" component={TransferListScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D1117',
  },
  loadingText: {
    color: '#8B949E',
    marginTop: 16,
    fontSize: 16,
  },
});
