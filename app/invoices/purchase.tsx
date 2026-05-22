import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

type PurchaseInvoice = {
  id: string;
  invoice_number: string;
  supplier_id: string;
  invoice_date: string;
  total: number;
  paid_amount: number;
  status: string;
  suppliers: {
    name: string;
  };
};

export default function PurchaseInvoicesScreen() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          id,
          invoice_number,
          supplier_id,
          invoice_date,
          total,
          paid_amount,
          status,
          suppliers (name)
        `)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('invoice_date', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      Alert.alert('خطأ', 'فشل في تحميل الفواتير');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: '#ffc107', text: 'معلقة' },
      paid: { color: '#28a745', text: 'مدفوعة' },
      partial: { color: '#17a2b8', text: 'مدفوعة جزئياً' },
      cancelled: { color: '#dc3545', text: 'ملغاة' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const renderInvoice = ({ item }: { item: PurchaseInvoice }) => {
    const statusBadge = getStatusBadge(item.status);
    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        </View>

        <Text style={styles.supplierName}>
          {item.suppliers?.name || 'مورد غير محدد'}
        </Text>

        <View style={styles.invoiceDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>التاريخ</Text>
            <Text style={styles.detailValue}>
              {new Date(item.invoice_date).toLocaleDateString('ar-SA')}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>الإجمالي</Text>
            <Text style={styles.detailValue}>
              {item.total.toLocaleString()} ر.س
            </Text>
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentLabel}>المدفوع:</Text>
          <Text style={styles.paidAmount}>
            {item.paid_amount.toLocaleString()} ر.س
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#17a2b8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchInvoices} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا يوجد فواتير مشتريات</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
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
  listContainer: {
    padding: 16,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  supplierName: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'right',
    marginBottom: 12,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  paidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#17a2b8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#17a2b8',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
