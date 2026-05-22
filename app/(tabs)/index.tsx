import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

type DashboardStats = {
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalSales: number;
  totalPurchases: number;
  totalReceipts: number;
  totalPayments: number;
};

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalReceipts: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [
        customersCount,
        suppliersCount,
        productsCount,
        lowStockCount,
        salesSum,
        purchasesSum,
        receiptsSum,
        paymentsSum,
      ] = await Promise.all([
        supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null),
        supabase
          .from('suppliers')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .filter('current_stock', 'lte', 'min_stock'),
        supabase
          .from('sales_invoices')
          .select('total')
          .eq('user_id', user.id)
          .is('deleted_at', null),
        supabase
          .from('purchase_invoices')
          .select('total')
          .eq('user_id', user.id)
          .is('deleted_at', null),
        supabase
          .from('receipts')
          .select('amount')
          .eq('user_id', user.id),
        supabase
          .from('payments')
          .select('amount')
          .eq('user_id', user.id),
      ]);

      setStats({
        totalCustomers: customersCount.count || 0,
        totalSuppliers: suppliersCount.count || 0,
        totalProducts: productsCount.count || 0,
        lowStockProducts: lowStockCount.count || 0,
        totalSales: salesSum.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0,
        totalPurchases: purchasesSum.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0,
        totalReceipts: receiptsSum.data?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0,
        totalPayments: paymentsSum.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const StatCard = ({ title, value, color }: { title: string; value: number | string; color: string }) => (
    <View style={[styles.statCard, { borderRightColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchStats} />
      }
    >
      <View style={styles.content}>
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>نظرة عامة</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="العملاء"
              value={stats.totalCustomers}
              color="#28a745"
            />
            <StatCard
              title="الموردين"
              value={stats.totalSuppliers}
              color="#17a2b8"
            />
            <StatCard
              title="الأصناف"
              value={stats.totalProducts}
              color="#ffc107"
            />
            <StatCard
              title="مخزون منخفض"
              value={stats.lowStockProducts}
              color="#dc3545"
            />
          </View>
        </View>

        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>الملخص المالي</Text>
          <View style={styles.financialCards}>
            <View style={[styles.financialCard, { backgroundColor: '#d4edda' }]}>
              <Text style={styles.financialLabel}>إجمالي المبيعات</Text>
              <Text style={[styles.financialValue, { color: '#155724' }]}>
                {stats.totalSales.toLocaleString()} ر.س
              </Text>
            </View>
            <View style={[styles.financialCard, { backgroundColor: '#f8d7da' }]}>
              <Text style={styles.financialLabel}>إجمالي المشتريات</Text>
              <Text style={[styles.flancialValue, { color: '#721c24' }]}>
                {stats.totalPurchases.toLocaleString()} ر.س
              </Text>
            </View>
            <View style={[styles.financialCard, { backgroundColor: '#d1ecf1' }]}>
              <Text style={styles.financialLabel}>إجمالي المقبوضات</Text>
              <Text style={[styles.flancialValue, { color: '#0c5460' }]}>
                {stats.totalReceipts.toLocaleString()} ر.س
              </Text>
            </View>
            <View style={[styles.flancialCard, { backgroundColor: '#fff3cd' }]}>
              <Text style={styles.flancialLabel}>إجمالي المدفوعات</Text>
              <Text style={[styles.flancialValue, { color: '#856404' }]}>
                {stats.totalPayments.toLocaleString()} ر.س
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
    color: '#212529',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRightWidth: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  financialSection: {
    marginBottom: 24,
  },
  financialCards: {
    gap: 12,
  },
  financialCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  financialLabel: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'right',
    marginBottom: 8,
  },
  financialValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
