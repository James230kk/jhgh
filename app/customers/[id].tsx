import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getCustomer, Customer } from '../../lib/database';
import { Ionicons } from '@expo/vector-icons';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const data = await getCustomer(id as string);
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      Alert.alert('خطأ', 'فشل في تحميل بيانات العميل');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!customer) {
    return null;
  }

  const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerCode}>{customer.code}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>معلومات الاتصال</Text>
          <DetailRow label="الهاتف" value={customer.phone} />
          <DetailRow label="البريد الإلكتروني" value={customer.email} />
          <DetailRow label="العنوان" value={customer.address} />
          <DetailRow label="المدينة" value={customer.city} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>المعلومات المالية</Text>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>الرصيد الحالي</Text>
            <Text
              style={[
                styles.balanceValue,
                customer.current_balance > 0 && styles.positiveBalance,
                customer.current_balance < 0 && styles.negativeBalance,
              ]}
            >
              {customer.current_balance.toLocaleString()} ر.س
            </Text>
          </View>
          <DetailRow label="حد الائتمان" value={`${customer.credit_limit.toLocaleString()} ر.س`} />
        </View>

        {customer.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ملاحظات</Text>
            <Text style={styles.notesText}>{customer.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
  },
  customerCode: {
    fontSize: 16,
    color: '#6c757d',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'right',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    textAlign: 'left',
    marginLeft: 16,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
  },
  positiveBalance: {
    color: '#28a745',
  },
  negativeBalance: {
    color: '#dc3545',
  },
  notesText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'right',
    lineHeight: 24,
  },
});
