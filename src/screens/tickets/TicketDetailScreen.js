import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Chip,
  Avatar,
  Divider,
  ActivityIndicator,
  List,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showMessage } from 'react-native-flash-message';
import { Ionicons } from '@expo/vector-icons';

import { mobileAPI } from '../../config/api';
import { COLORS, SPACING, FONTS } from '../../config/constants';

const TicketDetailScreen = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadTicketDetail();
  }, [ticketId]);

  const loadTicketDetail = async () => {
    try {
      setLoading(true);
      const response = await mobileAPI.getTicket(ticketId);
      
      // Safe access with fallback
      if (response && response.data) {
        setTicket(response.data);
      } else {
        console.warn('Invalid ticket response structure');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      showMessage({
        message: 'שגיאה בטעינת פרטי הטיקט',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTicketDetail();
    setRefreshing(false);
  };

  const updateTicketStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await mobileAPI.updateTicket(ticketId, { status: newStatus });
      
      setTicket(prev => ({ ...prev, status: newStatus }));
      
      showMessage({
        message: 'סטטוס הטיקט עודכן בהצלחה',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating ticket:', error);
      showMessage({
        message: 'שגיאה בעדכון סטטוס הטיקט',
        type: 'danger',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim()) {
      showMessage({
        message: 'אנא הזן תוכן להודעה',
        type: 'warning',
      });
      return;
    }

    try {
      setSendingReply(true);
      const response = await mobileAPI.addTicketMessage(ticketId, {
        content: replyMessage.trim(),
      });

      // Add new message to ticket
      setTicket(prev => ({
        ...prev,
        messages: [...prev.messages, response.data.ticket_message]
      }));
      
      setReplyMessage('');
      
      showMessage({
        message: 'התגובה נשלחה בהצלחה',
        type: 'success',
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      showMessage({
        message: 'שגיאה בשליחת התגובה',
        type: 'danger',
      });
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return COLORS.warning;
      case 'in_progress': return COLORS.info;
      case 'resolved': return COLORS.success;
      case 'closed': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'פתוח';
      case 'in_progress': return 'בטיפול';
      case 'resolved': return 'נפתר';
      case 'closed': return 'סגור';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return COLORS.error;
      case 'high': return COLORS.warning;
      case 'normal': return COLORS.info;
      case 'low': return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'דחוף';
      case 'high': return 'גבוה';
      case 'normal': return 'רגיל';
      case 'low': return 'נמוך';
      default: return priority;
    }
  };

  const confirmStatusUpdate = (newStatus) => {
    const statusLabels = {
      'open': 'פתוח',
      'in_progress': 'בטיפול',
      'resolved': 'נפתר',
      'closed': 'סגור'
    };

    Alert.alert(
      'עדכון סטטוס',
      `האם אתה בטוח שברצונך לעדכן את הסטטוס ל"${statusLabels[newStatus]}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'אישור', onPress: () => updateTicketStatus(newStatus) }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>טוען פרטי טיקט...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>לא ניתן לטעון את פרטי הטיקט</Text>
          <Button 
            mode="contained" 
            onPress={loadTicketDetail}
            style={styles.retryButton}
          >
            נסה שוב
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Ticket Header */}
          <Card style={styles.headerCard}>
            <Card.Content>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>{ticket.subject}</Text>
                <Text style={styles.ticketId}>טיקט #{ticket.id}</Text>
              </View>
              
              <View style={styles.statusRow}>
                <Chip
                  style={[styles.statusChip, { backgroundColor: getStatusColor(ticket.status) }]}
                  textStyle={styles.statusChipText}
                >
                  {getStatusLabel(ticket.status)}
                </Chip>
                <Chip
                  style={[styles.priorityChip, { backgroundColor: getPriorityColor(ticket.priority) }]}
                  textStyle={styles.priorityChipText}
                >
                  {getPriorityLabel(ticket.priority)}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              {/* Client Info */}
              <View style={styles.clientInfo}>
                <Avatar.Icon size={40} icon="account" style={styles.avatar} />
                <View style={styles.clientDetails}>
                  <Text style={styles.clientName}>{ticket.client.name}</Text>
                  <Text style={styles.clientEmail}>{ticket.client.email}</Text>
                  {ticket.client.phone && (
                    <Text style={styles.clientPhone}>{ticket.client.phone}</Text>
                  )}
                </View>
              </View>

              {/* Ticket Dates */}
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>נוצר: {ticket.created_at}</Text>
                <Text style={styles.dateLabel}>עודכן: {ticket.updated_at}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Status Update Actions */}
          <Card style={styles.actionsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>פעולות</Text>
              <View style={styles.actionButtons}>
                {ticket.status !== 'in_progress' && (
                  <Button
                    mode="contained"
                    onPress={() => confirmStatusUpdate('in_progress')}
                    disabled={updatingStatus}
                    style={styles.actionButton}
                    buttonColor={COLORS.info}
                  >
                    קח לטיפול
                  </Button>
                )}
                {ticket.status !== 'resolved' && (
                  <Button
                    mode="contained"
                    onPress={() => confirmStatusUpdate('resolved')}
                    disabled={updatingStatus}
                    style={styles.actionButton}
                    buttonColor={COLORS.success}
                  >
                    סמן כנפתר
                  </Button>
                )}
                {ticket.status !== 'closed' && ticket.status === 'resolved' && (
                  <Button
                    mode="contained"
                    onPress={() => confirmStatusUpdate('closed')}
                    disabled={updatingStatus}
                    style={styles.actionButton}
                    buttonColor={COLORS.textSecondary}
                  >
                    סגור טיקט
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Messages */}
          <Card style={styles.messagesCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>הודעות</Text>
              {ticket.messages.map((message, index) => (
                <View key={message.id} style={styles.messageContainer}>
                  <View style={styles.messageHeader}>
                    <View style={styles.messageSender}>
                      <Avatar.Icon 
                        size={32} 
                        icon={message.is_admin ? "account-tie" : "account"} 
                        style={[
                          styles.messageAvatar,
                          { backgroundColor: message.is_admin ? COLORS.primary : COLORS.secondary }
                        ]}
                      />
                      <Text style={styles.senderName}>{message.sender_name}</Text>
                      {message.is_admin && (
                        <Chip size="small" style={styles.adminChip}>
                          צוות תמיכה
                        </Chip>
                      )}
                    </View>
                    <Text style={styles.messageDate}>{message.created_at}</Text>
                  </View>
                  <Text style={styles.messageContent}>{message.content}</Text>
                  {index < ticket.messages.length - 1 && <Divider style={styles.messageDivider} />}
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Reply Section */}
          <Card style={styles.replyCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>הוסף תגובה</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={replyMessage}
                onChangeText={setReplyMessage}
                placeholder="כתוב את התגובה שלך כאן..."
                style={styles.replyInput}
                textAlign="right"
              />
              <Button
                mode="contained"
                onPress={sendReply}
                loading={sendingReply}
                disabled={sendingReply || !replyMessage.trim()}
                style={styles.sendButton}
                icon="send"
              >
                שלח תגובה
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: SPACING.md,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  retryButton: {
    marginTop: SPACING.md,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  ticketHeader: {
    marginBottom: SPACING.md,
  },
  ticketTitle: {
    fontSize: FONTS.sizes.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  ticketId: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  statusChip: {
    marginLeft: SPACING.sm,
  },
  statusChipText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  priorityChip: {
    marginLeft: SPACING.sm,
  },
  priorityChipText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
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
    textAlign: 'right',
  },
  clientPhone: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  dateInfo: {
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  actionsCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  messagesCard: {
    marginBottom: SPACING.md,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  messageSender: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageAvatar: {
    marginLeft: SPACING.sm,
  },
  senderName: {
    fontSize: FONTS.sizes.body,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  adminChip: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  messageDate: {
    fontSize: FONTS.sizes.caption,
    color: COLORS.textSecondary,
  },
  messageContent: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'right',
  },
  messageDivider: {
    marginTop: SPACING.md,
  },
  replyCard: {
    marginBottom: SPACING.xl,
  },
  replyInput: {
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
  sendButton: {
    alignSelf: 'flex-end',
  },
});

export default TicketDetailScreen;