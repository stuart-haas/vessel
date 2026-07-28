import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsProvider } from '@/settings';
import { colors } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SettingsProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.surfaceMuted },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="read" options={{ title: 'Read' }} />
            <Stack.Screen
              name="settings"
              options={{ title: 'Settings', presentation: 'modal' }}
            />
            <Stack.Screen name="journals/index" options={{ title: 'Journal' }} />
            <Stack.Screen
              name="journals/[id]"
              options={{ title: 'Entry', presentation: 'modal' }}
            />
          </Stack>
        </SettingsProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
