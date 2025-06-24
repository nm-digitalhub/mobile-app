import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Surface,
  ActivityIndicator,
  Chip,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { mobileAPI } from '../../config/api';
import { COLORS, SPACING, FONT_SIZES } from '../../config/constants';
import { showMessage } from 'react-native-flash-message';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const chartWidth = width - (SPACING.lg * 2);

const DashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      const response = await mobileAPI.dashboard();
      
      // Safe access with fallback
      if (response && response.data) {
        setDashboardData(response.data);
      } else {
        console.warn('Invalid dashboard response structure');
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('Dashboard error:', error);
      showMessage({
        message: 'שגיאה בטעינת נתוני הדשבורד',
        type: 'danger',
        position: 'top',
      });
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const StatCard = ({ title, value, subtitle, color = COLORS.primary, onPress }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.statCardContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );

  const RecentTicketCard = ({ ticket }) => (
    <Card 
      style={styles.ticketCard} 
      onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
    >
      <Card.Content style={styles.ticketCardContent}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketSubject} numberOfLines={1}>
            {ticket.subject}
          </Text>
          <Chip 
            mode="outlined" 
            style={[styles.priorityChip, { borderColor: getPriorityColor(ticket.priority) }]}
            textStyle={{ color: getPriorityColor(ticket.priority) }}
          >
            {getPriorityLabel(ticket.priority)}
          </Chip>
        </View>
        
        <Text style={styles.ticketClient}>{ticket.client_name}</Text>
        
        <View style={styles.ticketFooter}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(ticket.status) }]}
            textStyle={{ color: getStatusColor(ticket.status) }}
          >
            {getStatusLabel(ticket.status)}
          </Chip>
          <Text style={styles.ticketTime}>{ticket.updated_at}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const RecentOrderCard = ({ order }) => (
    <Card 
      style={styles.orderCard} 
      onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
    >
      <Card.Content style={styles.orderCardContent}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderPackage} numberOfLines={1}>
            {order.package_name}
          </Text>
          <Text style={styles.orderTotal}>₪{order.total}</Text>
        </View>
        
        <Text style={styles.orderClient}>{order.client_name}</Text>
        
        <View style={styles.orderFooter}>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getStatusColor(order.status) }]}
            textStyle={{ color: getStatusColor(order.status) }}
          >
            {getStatusLabel(order.status)}
          </Chip>
          <Text style={styles.orderTime}>{order.created_at}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return COLORS.urgent;
      case 'high': return COLORS.high;
      case 'normal': return COLORS.normal;
      case 'low': return COLORS.low;
      default: return COLORS.normal;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'דחופה';
      case 'high': return 'גבוהה';
      case 'normal': return 'רגילה';
      case 'low': return 'נמוכה';
      default: return 'רגילה';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return COLORS.open;
      case 'in_progress': return COLORS.in_progress;
      case 'resolved': return COLORS.resolved;
      case 'closed': return COLORS.closed;
      case 'pending': return COLORS.pending;
      case 'paid': return COLORS.paid;
      case 'provisioned': return COLORS.provisioned;
      case 'cancelled': return COLORS.cancelled;
      case 'failed': return COLORS.failed;
      default: return COLORS.normal;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'פתוח';
      case 'in_progress': return 'בטיפול';
      case 'resolved': return 'נפתר';
      case 'closed': return 'סגור';
      case 'pending': return 'ממתין';
      case 'paid': return 'שולם';
      case 'provisioned': return 'הופעל';
      case 'cancelled': return 'בוטל';
      case 'failed': return 'נכשל';
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>טוען נתונים...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboardData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>שגיאה בטעינת הנתונים</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safe access with fallbacks
  const stats = dashboardData?.stats || {};
  const recent_tickets = dashboardData?.recent_tickets || [];
  const recent_orders = dashboardData?.recent_orders || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>דשבורד תמיכה</Text>
          <Text style={styles.headerSubtitle}>סקירה כללית של המערכת</Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              title="טיקטים פתוחים"
              value={stats.open_tickets || 0}
              subtitle={`מתוך ${stats.total_tickets || 0} כולל`}
              color={COLORS.warning}
              onPress={() => navigation.navigate('Tickets', { filter: 'open' })}
            />
            <StatCard
              title="הזמנות ממתינות"
              value={stats.pending_orders || 0}
              subtitle="דורשות טיפול"
              color={COLORS.error}
              onPress={() => navigation.navigate('Orders', { filter: 'pending' })}
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatCard
              title="הזמנות היום"
              value={stats.today_orders || 0}
              subtitle="הזמנות חדשות"
              color={COLORS.success}
              onPress={() => navigation.navigate('Orders', { filter: 'today' })}
            />
            <StatCard
              title="לקוחות רשומים"
              value={stats.total_clients || 0}
              subtitle="סך הכל במערכת"
              color={COLORS.info}
              onPress={() => navigation.navigate('Clients')}
            />
          </View>
          
          <StatCard
            title="תשלומים השבוע"
            value={`₪${(stats.recent_payments || 0).toLocaleString()}`}
            subtitle="7 ימים אחרונים"
            color={COLORS.success}
          />
        </View>

        {/* Recent Tickets */}
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>טיקטים אחרונים</Text>
            <Text 
              style={styles.sectionLink} 
              onPress={() => navigation.navigate('Tickets')}
            >
              הצג הכל
            </Text>
          </View>
          
          {recent_tickets.length > 0 ? (
            recent_tickets.map((ticket, index) => (
              <RecentTicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <Text style={styles.emptyText}>אין טיקטים אחרונים</Text>
          )}
        </Surface>

        {/* Recent Orders */}
        <Surface style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>הזמנות אחרונות</Text>
            <Text 
              style={styles.sectionLink} 
              onPress={() => navigation.navigate('Orders')}
            >
              הצג הכל
            </Text>
          </View>
          
          {recent_orders.length > 0 ? (
            recent_orders.map((order, index) => (
              <RecentOrderCard key={order.id} order={order} />
            ))
          ) : (
            <Text style={styles.emptyText}>אין הזמנות אחרונות</Text>
          )}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
  },
  header: {
    padding: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  statsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  statSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  ticketCard: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  ticketCardContent: {
    paddingVertical: SPACING.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  ticketSubject: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  ticketClient: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  orderCard: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  orderCardContent: {
    paddingVertical: SPACING.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  orderPackage: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  orderTotal: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  orderClient: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  priorityChip: {
    height: 24,
    backgroundColor: 'transparent',
  },
  statusChip: {
    height: 24,
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    paddingVertical: SPACING.lg,
  },
});

export default DashboardScreen;