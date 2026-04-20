import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ChatBubble } from '../components/ChatBubble';
import { aiService } from '../services/aiService';
import { useAppStore } from '../store/appStore';
import { ChatMessage } from '../types';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

const QUICK_PROMPTS = [
  'How much protein do I need?',
  'Create a meal plan for me',
  'I had a bad eating day 😔',
  'Tips for staying hydrated',
  'How to boost metabolism?',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! I'm your AI Nutrition Coach 🤖✨ I've analyzed your recent meals and I'm ready to help you optimize your nutrition, crush your goals, and level up your health. What's on your mind?",
  timestamp: Date.now(),
};

export function AICoachScreen() {
  const navigation = useNavigation();
  const { user, subscription } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async (text?: string) => {
    const messageText = text ?? inputText.trim();
    if (!messageText) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const context = user
        ? `User: ${user.name}, Goal: ${user.goal}, Calorie target: ${user.calorieTarget}kcal, Protein target: ${user.proteinTarget}g`
        : 'General user';

      const response = await aiService.chatWithCoach([...messages, userMsg], context);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachAvatarEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Nutrition Coach</Text>
            <Text style={styles.headerSubtitle}>● Online — Premium</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingIndicator}>
                <View style={styles.typingBubble}>
                  <ActivityIndicator color={COLORS.primary} size="small" />
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <View>
            <Text style={styles.quickPromptsLabel}>Suggested questions</Text>
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickPromptChip}
                  onPress={() => handleSend(item)}
                >
                  <Text style={styles.quickPromptText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask your AI coach anything..."
            placeholderTextColor={COLORS.mutedText}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: FONT.weights.bold,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingLeft: SPACING.md,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  coachAvatarEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: FONT.sizes.md,
    color: COLORS.white,
    fontWeight: FONT.weights.bold,
  },
  headerSubtitle: {
    fontSize: FONT.sizes.xs,
    color: COLORS.primary,
  },
  messageList: {
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  typingIndicator: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
  },
  quickPromptsLabel: {
    fontSize: FONT.sizes.sm,
    color: COLORS.secondaryText,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    fontWeight: FONT.weights.medium,
  },
  quickPromptsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  quickPromptChip: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickPromptText: {
    fontSize: FONT.sizes.sm,
    color: COLORS.white,
    fontWeight: FONT.weights.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: COLORS.white,
    fontSize: FONT.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.elevated,
    shadowOpacity: 0,
  },
  sendBtnText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: FONT.weights.bold,
  },
});
