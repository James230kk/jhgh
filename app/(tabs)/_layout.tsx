import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24, marginBottom: 4 }}>
      {name === 'index' && '🏠'}
      {name === 'customers' && '👥'}
      {name === 'suppliers' && '🚚'}
      {name === 'products' && '📦'}
      {name === 'invoices' && '📄'}
    </Text>
  </View>
);

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#dee2e6',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'العملاء',
          tabBarIcon: ({ focused }) => <TabIcon name="customers" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="suppliers"
        options={{
          title: 'الموردين',
          tabBarIcon: ({ focused }) => <TabIcon name="suppliers" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'الأصناف',
          tabBarIcon: ({ focused }) => <TabIcon name="products" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'الفواتير',
          tabBarIcon: ({ focused }) => <TabIcon name="invoices" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
