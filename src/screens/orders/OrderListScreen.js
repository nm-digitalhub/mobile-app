import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  Searchbar,
  Button,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';
import { Ionicons } from '@expo/vector-icons';

import { mobileAPI } from '../../config/api';
import { COLORS, SPACING, FONTS } from '../../config/constants';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'הכל' },
    { value: 'pending', label: 'ממתין' },
    { value: 'paid', label: 'שולם' },
    { value: 'provisioned', label: 'הופעל' },
    { value: 'cancelled', label: 'בוטל' },
    { value: 'failed', label: 'נכשל' },
  ];

  useEffect(() => {
    loadOrders(true);
  }, [searchQuery, selectedStatus]);

  const loadOrders = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setOrders([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : currentPage;
      const response = await mobileAPI.orders({
        page,
        search: searchQuery,
        status: selectedStatus,
      });

      // Safe access with fallback
      if (response && response.data && response.data.data) {
        if (reset) {
          setOrders(response.data.data);
        } else {
          setOrders(prev => [...prev, ...response.data.data]);
        }

        setHasMorePages((response.data.current_page || 1) < (response.data.last_page || 1));
        setCurrentPage(page + 1);
      } else {
        console.warn('Invalid orders response structure');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      showMessage({
        message: 'שגיאה בטעינת רשימת ההזמנות',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedStatus, currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMorePages) {
      loadOrders(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await mobileAPI.updateOrder(orderId, { status: newStatus });
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      showMessage({
        message: 'סטטוס ההזמנה עודכן בהצלחה',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      showMessage({
        message: 'שגיאה בעדכון סטטוס ההזמנה',
        type: 'danger',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'paid': return COLORS.info;
      case 'provisioned': return COLORS.success;
      case 'cancelled': return COLORS.textSecondary;
      case 'failed': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'ממתין';
      case 'paid': return 'שולם';
      case 'provisioned': return 'הופעל';
      case 'cancelled': return 'בוטל';
      case 'failed': return 'נכשל';
      default: return status;
    }
  };

  const getServiceTypeLabel = (serviceType) => {
    switch (serviceType) {
      case 'hosting': return 'אירוח';
      case 'domain': return 'דומיין';
      case 'vps': return 'VPS';
      case 'email': return 'אימייל';
      case 'ssl': return 'SSL';
      default: return serviceType;
    }
  };

  const getBillingCycleLabel = (cycle) => {
    switch (cycle) {
      case 'monthly': return 'חודשי';
      case 'quarterly': return 'רבעוני';
      case 'semi_annually': return 'חצי שנתי';
      case 'annually': return 'שנתי';
      case 'biennially': return 'דו שנתי';
      case 'triennially': return 'תלת שנתי';
      default: return cycle;
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>הזמנה #{item.id}</Text>
              <Text style={styles.clientName}>{item.client_name}</Text>
              <Text style={styles.packageName}>{item.package_name}</Text>
            </View>
            
            <View style={styles.orderMeta}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusChipText}
                compact
              >
                {getStatusLabel(item.status)}
              </Chip>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>סוג שירות:</Text>
              <Text style={styles.detailValue}>
                {getServiceTypeLabel(item.service_type)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>מחזור חיוב:</Text>
              <Text style={styles.detailValue}>
                {getBillingCycleLabel(item.billing_cycle)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>סכום:</Text>
              <Text style={[styles.detailValue, styles.priceValue]}>
                ₪{parseFloat(item.total).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>
              <Ionicons name="calendar-outline" size={14} />
              {' '}{item.created_at}
            </Text>
            
            <View style={styles.orderActions}>
              {item.status === 'pending' && (
                <IconButton
                  icon="check-circle"
                  iconColor={COLORS.success}
                  size={20}
                  onPress={() => updateOrderStatus(item.id, 'paid')}
                />
              )}
              {item.status === 'paid' && (
                <IconButton
                  icon="server"
                  iconColor={COLORS.info}
                  size={20}
                  onPress={() => updateOrderStatus(item.id, 'provisioned')}
                />
              )}
              <Ionicons name="chevron-back-outline" size={20} color={COLORS.textSecondary} />
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterLabel}>סינון לפי סטטוס:</Text>
      <View style={styles.statusFilters}>
        {statusOptions.map((option) => (
          <Chip
            key={option.value}
            selected={selectedStatus === option.value}
            onPress={() => setSelectedStatus(option.value)}
            style={[
              styles.filterChip,
              selectedStatus === option.value && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedStatus === option.value && styles.selectedFilterChipText
            ]}
          >
            {option.label}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.footerText}>טוען עוד הזמנות...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>לא נמצאו הזמנות</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery ? 'נסה לשנות את מילות החיפוש' : 'עדיין לא בוצעו הזמנות במערכת'}
        </Text>
        {searchQuery && (
          <Button 
            mode="outlined" 
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchButton}
          >
            נקה חיפוש
          </Button>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>טוען רשימת הזמנות...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="חפש הזמנה או לקוח..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        {renderStatusFilter()}
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
  },
  searchInput: {
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterLabel: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  statusFilters: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginLeft: SPACING.xs,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.backgroundLight,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: COLORS.textSecondary,
  },
  selectedFilterChipText: {
    color: COLORS.surface,
  },
  listContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  orderCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: FONTS.sizes.body,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
  },
  clientName: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text,
    marginTop: 2,
    textAlign: 'right',
  },
  packageName: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  statusChip: {
  },
  statusChipText: {
    color: COLORS.surface,
    fontSize: FONTS.sizes.caption,
    fontWeight: 'bold',
  },
  orderDetails: {
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.text,
    fontWeight: '500',
  },
  priceValue: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.body,
    color: COLORS.textSecondary,
  },
  footerLoader: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  footerText: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 24,
  },
  clearSearchButton: {
    marginTop: SPACING.md,
  },
});

export default OrderListScreen;