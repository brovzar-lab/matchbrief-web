import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT } from '../lib/config';
import { sendMessage } from '../lib/firestoreService';
import type { Message } from '../lib/types';
import { DEMO_CO_PARENT_NAME } from '../lib/mockData';

const listRef = React.createRef<FlatList<Message>>();

export default function MessagesScreen() {
  const user = useStore((s) => s.user);
  const household = useStore((s) => s.household);
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const [text, setText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  function senderLabel(senderId: string): string {
    if (senderId === user?.uid) return 'You';
    return DEMO_CO_PARENT_NAME.split(' ')[0];
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (isDemoMode) {
      addMessage({
        id: `m-${Date.now()}`,
        text: trimmed,
        senderId: user?.uid ?? 'demo-parent1-uid',
        sentAt: new Date(),
        readBy: [user?.uid ?? 'demo-parent1-uid'],
      });
      setText('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    }

    if (!household || !user) return;
    setIsSending(true);
    try {
      await sendMessage(household.id, trimmed, user.uid);
      setText('');
    } catch {
      Alert.alert('Error', 'Message failed to send.');
    } finally {
      setIsSending(false);
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isOwn = item.senderId === user?.uid;
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        {!isOwn && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{senderLabel(item.senderId)[0]}</Text>
          </View>
        )}
        <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
          {!isOwn && (
            <Text style={styles.senderName}>{senderLabel(item.senderId)}</Text>
          )}
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{item.text}</Text>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>{formatTime(item.sentAt)}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.header}>
        <Text style={styles.heading}>Messages</Text>
        <Text style={styles.subheading}>
          {household?.parent2Uid ? DEMO_CO_PARENT_NAME : 'No co-parent connected yet'}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={styles.empty}>No messages yet. Say hi!</Text>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Message your co-parent..."
            placeholderTextColor={SUBTEXT}
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || isSending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || isSending}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { padding: 16, paddingBottom: 8 },
  heading: { fontSize: 28, fontWeight: '800', color: TEXT },
  subheading: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
  messageList: { padding: 16, gap: 12, flexGrow: 1 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  rowOwn: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B3558',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: ACCENT, fontWeight: '700', fontSize: 14 },
  bubble: {
    maxWidth: '75%',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    gap: 4,
  },
  bubbleOwn: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  senderName: { fontSize: 11, color: ACCENT, fontWeight: '700', marginBottom: 2 },
  bubbleText: { fontSize: 15, color: TEXT, lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  time: { fontSize: 11, color: SUBTEXT, alignSelf: 'flex-end' },
  timeOwn: { color: 'rgba(255,255,255,0.6)' },
  empty: { color: SUBTEXT, textAlign: 'center', marginTop: 60, fontSize: 15 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: TEXT,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 },
});
