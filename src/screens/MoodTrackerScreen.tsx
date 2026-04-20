import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../store/appStore';
import { MoodEntry } from '../types';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

const MOODS = [
  { level: 1, emoji: '😞', label: 'Rough' },
  { level: 2, emoji: '😕', label: 'Meh' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '😊', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Great!' },
] as const;

const ENERGY = [
  { level: 1, emoji: '🪫', label: 'Drained' },
  { level: 2, emoji: '😴', label: 'Tired' },
  { level: 3, emoji: '⚡', label: 'Normal' },
  { level: 4, emoji: '🔋', label: 'Energized' },
  { level: 5, emoji: '🚀', label: 'On Fire!' },
] as const;

export function MoodTrackerScreen() {
  const navigation = useNavigation();
  const { addMoodEntry, moodEntries } = useAppStore();
  const [selectedMood, setSelectedMood] = useState<1|2|3|4|5>(3);
  const [selectedEnergy, setSelectedEnergy] = useState<1|2|3|4|5>(3);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry: MoodEntry = {
      date: new Date().toISOString().split('T')[0]!,
      mood: selectedMood,
      energy: selectedEnergy,
      notes: notes.trim() || undefined,
      timestamp: Date.now(),
    };
    addMoodEntry(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>😊 Mood Tracker</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {saved ? (
          <View style={styles.savedState}>
            <Text style={styles.savedEmoji}>✅</Text>
            <Text style={styles.savedTitle}>Mood logged!</Text>
            <Text style={styles.savedSubtitle}>
              Your mood and energy have been tracked for today.
            </Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.question}>How are you feeling today?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.level}
                  style={[styles.moodBtn, selectedMood === m.level && styles.moodBtnActive]}
                  onPress={() => { setSelectedMood(m.level); Haptics.selectionAsync(); }}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, selectedMood === m.level && styles.moodLabelActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.question}>Energy level?</Text>
            <View style={styles.moodRow}>
              {ENERGY.map((e) => (
                <TouchableOpacity
                  key={e.level}
                  style={[styles.moodBtn, selectedEnergy === e.level && styles.energyBtnActive]}
                  onPress={() => { setSelectedEnergy(e.level); Haptics.selectionAsync(); }}
                >
                  <Text style={styles.moodEmoji}>{e.emoji}</Text>
                  <Text style={[styles.moodLabel, selectedEnergy === e.level && styles.energyLabelActive]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.question}>Any notes? (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="How did your food affect your energy today?"
              placeholderTextColor={COLORS.mutedText}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>💾 Save Mood</Text>
            </TouchableOpacity>

            {/* Past entries */}
            {moodEntries.length > 0 && (
              <View style={styles.pastSection}>
                <Text style={styles.pastTitle}>Recent Entries</Text>
                {moodEntries.slice(0, 5).map((entry, i) => (
                  <View key={i} style={styles.pastEntry}>
                    <Text style={styles.pastDate}>{entry.date}</Text>
                    <Text style={styles.pastMood}>{MOODS[entry.mood - 1]?.emoji} {ENERGY[entry.energy - 1]?.emoji}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  backBtnText: { color: COLORS.white, fontSize: 20, fontWeight: FONT.weights.bold },
  headerTitle: { fontSize: FONT.sizes.lg, color: COLORS.white, fontWeight: FONT.weights.bold },
  content: { padding: SPACING.lg, paddingBottom: 80 },
  question: { fontSize: FONT.sizes.lg, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.md, marginTop: SPACING.md },
  moodRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  moodBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.sm,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
  },
  moodBtnActive: { borderColor: '#FFB800', backgroundColor: 'rgba(255,184,0,0.1)' },
  energyBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { fontSize: 9, color: COLORS.secondaryText, textAlign: 'center' },
  moodLabelActive: { color: '#FFB800', fontWeight: FONT.weights.bold },
  energyLabelActive: { color: COLORS.primary, fontWeight: FONT.weights.bold },
  notesInput: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    color: COLORS.white, fontSize: FONT.sizes.md, borderWidth: 1, borderColor: COLORS.border,
    height: 100, textAlignVertical: 'top', marginBottom: SPACING.lg,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: 18,
    alignItems: 'center', marginBottom: SPACING.xl,
  },
  saveBtnText: { color: COLORS.white, fontSize: FONT.sizes.lg, fontWeight: FONT.weights.bold },
  pastSection: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  pastTitle: { fontSize: FONT.sizes.md, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.md },
  pastEntry: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  pastDate: { fontSize: FONT.sizes.sm, color: COLORS.secondaryText },
  pastMood: { fontSize: 22 },
  savedState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  savedEmoji: { fontSize: 72, marginBottom: SPACING.lg },
  savedTitle: { fontSize: FONT.sizes.xxl, color: COLORS.white, fontWeight: FONT.weights.black, marginBottom: SPACING.sm },
  savedSubtitle: { fontSize: FONT.sizes.md, color: COLORS.secondaryText, textAlign: 'center', marginBottom: SPACING.xl },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md },
  doneBtnText: { color: COLORS.white, fontWeight: FONT.weights.bold, fontSize: FONT.sizes.lg },
});
