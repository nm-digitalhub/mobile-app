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
  Avatar,
  Chip,
  Searchbar,
  Button,
  ActivityIndicator,
  Badge,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';
import { Ionicons } from '@expo/vector-icons';

import { mobileAPI } from '../../config/api';
import { COLORS, SPACING, FONTS } from '../../config/constants';

const ClientListScreen = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'הכל' },
    { value: 'active', label: 'פעיל' },
    { value: 'suspended', label: 'מושעה' },
    { value: 'inactive', label: 'לא פעיל' },
  ];

  useEffect(() => {
    loadClients(true);
  }, [searchQuery, selectedStatus]);

  const loadClients = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setCurrentPage(1);
        setClients([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 1 : currentPage;
      const response = await mobileAPI.clients({
        page,
        search: searchQuery,
        status: selectedStatus,
      });

      // Safe access with fallback
      if (response && response.data && response.data.data) {
        if (reset) {
          setClients(response.data.data);
        } else {
          setClients(prev => [...prev, ...response.data.data]);
        }

        setHasMorePages((response.data.current_page || 1) < (response.data.last_page || 1));
        setCurrentPage(page + 1);
      } else {
        console.warn('Invalid clients response structure');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      showMessage({
        message: 'שגיאה בטעינת רשימת הלקוחות',
        type: 'danger',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, selectedStatus, currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients(true);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMorePages) {
      loadClients(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'suspended': return COLORS.error;
      case 'inactive': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'פעיל';
      case 'suspended': return 'מושעה';
      case 'inactive': return 'לא פעיל';
      default: return status;
    }
  };

  const renderClientItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ClientDetail', { clientId: item.id })}
      activeOpacity={0.7}
    >
      <Card style={styles.clientCard}>
        <Card.Content>
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Avatar.Text 
                size={48} 
                label={(item.name || 'U').substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
              <View style={styles.clientDetails}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientEmail}>{item.email}</Text>
                {item.phone && (
                  <Text style={styles.clientPhone}>{item.phone}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.clientMeta}>
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                textStyle={styles.statusChipText}
                compact
              >
                {getStatusLabel(item.status)}
              </Chip>
              {item.last_login && (
                <Text style={styles.lastLogin}>
                  כניסה אחרונה: {item.last_login}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.clientStats}>
            <View style={styles.statItem}>
              <Badge style={styles.statBadge}>{item.orders_count}</Badge>
              <Text style={styles.statLabel}>הזמנות</Text>
            </View>
            <View style={styles.statItem}>
              <Badge style={styles.statBadge}>{item.tickets_count}</Badge>
              <Text style={styles.statLabel}>טיקטים</Text>
            </View>
            <View style={styles.statItem}>
              <Badge style={styles.statBadge}>{item.invoices_count}</Badge>
              <Text style={styles.statLabel}>חשבוניות</Text>
            </View>
          </View>

          <View style={styles.clientFooter}>
            <Text style={styles.joinDate}>
              <Ionicons name="calendar-outline" size={14} />
              {' '}נרשם: {item.created_at}
            </Text>
            <Ionicons name="chevron-back-outline" size={20} color={COLORS.textSecondary} />
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
        <Text style={styles.footerText}>טוען עוד לקוחות...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>לא נמצאו לקוחות</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery ? 'נסה לשנות את מילות החיפוש' : 'עדיין לא נרשמו לקוחות במערכת'}
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
          <Text style={styles.loadingText}>טוען רשימת לקוחות...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="חפש לקוח..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        {renderStatusFilter()}
      </View>

      <FlatList
        data={clients}
        renderItem={renderClientItem}
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
  clientCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: FONTS.sizes.body,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  clientEmail: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  clientPhone: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  clientMeta: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: SPACING.xs,
  },
  statusChipText: {
    color: COLORS.surface,
    fontSize: FONTS.sizes.caption,
    fontWeight: 'bold',
  },
  lastLogin: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statBadge: {
    backgroundColor: COLORS.primary,
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
  },
  clientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinDate: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
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

export default ClientListScreen;