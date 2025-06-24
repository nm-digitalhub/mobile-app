import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Searchbar,
  FAB,
  Chip,
  ActivityIndicator,
  Menu,
  Button,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mobileAPI } from '../../config/api';
import { COLORS, SPACING, FONT_SIZES, TICKET_STATUSES, TICKET_PRIORITIES } from '../../config/constants';
import { showMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';

const TicketListScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const theme = useTheme();

  const loadTickets = async (isRefresh = false, loadMore = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
      } else if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const currentPage = isRefresh ? 1 : (loadMore ? page + 1 : page);
      
      const params = {
        page: currentPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchQuery || undefined,
      };

      const response = await mobileAPI.tickets(params);
      
      // Safe access with fallback
      if (response && response.data && response.data.data) {
        const newTickets = response.data.data;

        if (isRefresh) {
          setTickets(newTickets);
        } else if (loadMore) {
          setTickets(prev => [...prev, ...newTickets]);
          setPage(currentPage);
        } else {
          setTickets(newTickets);
        }

        setHasMore((response.data.current_page || 1) < (response.data.last_page || 1));
      } else {
        console.warn('Invalid tickets response structure');
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Tickets error:', error);
      showMessage({
        message: 'שגיאה בטעינת הטיקטים',
        type: 'danger',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadTickets(true);
  }, [statusFilter, priorityFilter, searchQuery]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadTickets(false, true);
    }
  }, [hasMore, loadingMore, page]);

  useFocusEffect(
    useCallback(() => {
      loadTickets();
    }, [statusFilter, priorityFilter])
  );

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== undefined) {
        loadTickets();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const getPriorityColor = (priority) => {
    const priorityData = TICKET_PRIORITIES.find(p => p.value === priority);
    return priorityData ? priorityData.color : COLORS.normal;
  };

  const getPriorityLabel = (priority) => {
    const priorityData = TICKET_PRIORITIES.find(p => p.value === priority);
    return priorityData ? priorityData.label : priority;
  };

  const getStatusColor = (status) => {
    const statusData = TICKET_STATUSES.find(s => s.value === status);
    return statusData ? statusData.color : COLORS.normal;
  };

  const getStatusLabel = (status) => {
    const statusData = TICKET_STATUSES.find(s => s.value === status);
    return statusData ? statusData.label : status;
  };

  const renderTicketItem = ({ item: ticket }) => (
    <Card 
      style={styles.ticketCard} 
      onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
    >
      <Card.Content style={styles.ticketContent}>
        {/* Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketTitleContainer}>
            <Text style={styles.ticketId}>#{ticket.id}</Text>
            <Text style={styles.ticketSubject} numberOfLines={2}>
              {ticket.subject}
            </Text>
          </View>
          <Chip 
            mode="outlined" 
            style={[styles.priorityChip, { borderColor: getPriorityColor(ticket.priority) }]}
            textStyle={{ color: getPriorityColor(ticket.priority) }}
            compact
          >
            {getPriorityLabel(ticket.priority)}
          </Chip>
        </View>

        {/* Client Info */}
        <View style={styles.clientInfo}>
          <Text style={styles.clientName}>{ticket.client_name}</Text>
          <Text style={styles.clientEmail}>{ticket.client_email}</Text>
        </View>

        {/* Footer */}
        <View style={styles.ticketFooter}>
          <View style={styles.ticketMeta}>
            <Chip 
              mode="outlined" 
              style={[styles.statusChip, { borderColor: getStatusColor(ticket.status) }]}
              textStyle={{ color: getStatusColor(ticket.status) }}
              compact
            >
              {getStatusLabel(ticket.status)}
            </Chip>
            <Text style={styles.messagesCount}>
              {ticket.messages_count} הודעות
            </Text>
          </View>
          
          <View style={styles.timeInfo}>
            <Text style={styles.timeText}>עודכן: {ticket.updated_at}</Text>
            {ticket.last_reply && (
              <Text style={styles.lastReplyText}>תגובה אחרונה: {ticket.last_reply}</Text>
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>טוען עוד טיקטים...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>לא נמצאו טיקטים</Text>
      <Text style={styles.emptySubtext}>נסה לשנות את הפילטרים או החיפוש</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="חפש טיקטים..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filtersContainer}>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setStatusMenuVisible(true)}
                style={styles.filterButton}
                contentStyle={styles.filterButtonContent}
                compact
              >
                סטטוס: {statusFilter === 'all' ? 'הכל' : getStatusLabel(statusFilter)}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setStatusFilter('all'); setStatusMenuVisible(false); }} title="הכל" />
            {TICKET_STATUSES.map(status => (
              <Menu.Item 
                key={status.value}
                onPress={() => { setStatusFilter(status.value); setStatusMenuVisible(false); }} 
                title={status.label} 
              />
            ))}
          </Menu>

          <Menu
            visible={priorityMenuVisible}
            onDismiss={() => setPriorityMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setPriorityMenuVisible(true)}
                style={styles.filterButton}
                contentStyle={styles.filterButtonContent}
                compact
              >
                עדיפות: {priorityFilter === 'all' ? 'הכל' : getPriorityLabel(priorityFilter)}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setPriorityFilter('all'); setPriorityMenuVisible(false); }} title="הכל" />
            {TICKET_PRIORITIES.map(priority => (
              <Menu.Item 
                key={priority.value}
                onPress={() => { setPriorityFilter(priority.value); setPriorityMenuVisible(false); }} 
                title={priority.label} 
              />
            ))}
          </Menu>
        </View>
      </View>

      {/* Tickets List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>טוען טיקטים...</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Quick Actions FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
        label="טיקט חדש"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  searchbar: {
    marginBottom: SPACING.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    borderColor: COLORS.border,
  },
  filterButtonContent: {
    paddingHorizontal: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 80, // Space for FAB
  },
  ticketCard: {
    marginBottom: SPACING.md,
    borderRadius: 8,
    elevation: 2,
  },
  ticketContent: {
    padding: SPACING.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  ticketTitleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  ticketId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  ticketSubject: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 20,
  },
  priorityChip: {
    backgroundColor: 'transparent',
  },
  clientInfo: {
    marginBottom: SPACING.md,
  },
  clientName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  clientEmail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  messagesCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  lastReplyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  loadingFooter: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default TicketListScreen;