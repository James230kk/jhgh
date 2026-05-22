import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InvoicesScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'فواتير المبيعات',
      icon: 'receipt',
      color: '#28a745',
      route: '/invoices/sales',
    },
    {
      title: 'فواتير المشتريات',
      icon: 'cart',
      color: '#17a2b8',
      route: '/invoices/purchase',
    },
    {
      title: 'سندات القبض',
      icon: 'cash',
      color: '#ffc107',
      route: '/invoices/receipts',
    },
    {
      title: 'سندات الدفع',
      icon: 'card',
      color: '#dc3545',
      route: '/invoices/payments',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={32} color="#fff" />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons name="arrow-forward" size={24} color="#6c757d" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    textAlign: 'right',
    marginHorizontal: 16,
  },
});
