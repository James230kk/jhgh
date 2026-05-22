import '../components/I18nManager';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="customers/[id]" options={{ title: 'تفاصيل العميل' }} />
      <Stack.Screen name="customers/add" options={{ title: 'إضافة عميل' }} />
      <Stack.Screen name="suppliers/[id]" options={{ title: 'تفاصيل المورد' }} />
      <Stack.Screen name="suppliers/add" options={{ title: 'إضافة مورد' }} />
      <Stack.Screen name="products/[id]" options={{ title: 'تفاصيل الصنف' }} />
      <Stack.Screen name="products/add" options={{ title: 'إضافة صنف' }} />
      <Stack.Screen name="invoices/sales" options={{ title: 'فواتير المبيعات' }} />
      <Stack.Screen name="invoices/purchase" options={{ title: 'فواتير المشتريات' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
