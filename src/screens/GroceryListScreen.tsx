import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { useAppStore } from '../store/appStore';
import { GroceryItem } from '../types';
import { COLORS } from '../constants/colors';
import { FONT, SPACING, RADIUS } from '../constants';

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Snacks', 'Other'];
const SUGGESTED = [
  { name: 'Chicken Breast', category: 'Protein' },
  { name: 'Greek Yogurt', category: 'Dairy' },
  { name: 'Broccoli', category: 'Produce' },
  { name: 'Brown Rice', category: 'Grains' },
  { name: 'Salmon Fillet', category: 'Protein' },
  { name: 'Spinach', category: 'Produce' },
  { name: 'Eggs', category: 'Protein' },
  { name: 'Almonds', category: 'Snacks' },
  { name: 'Oats', category: 'Grains' },
  { name: 'Avocado', category: 'Produce' },
];

export function GroceryListScreen() {
  const navigation = useNavigation();
  const { groceryList, addGroceryItem, toggleGroceryItem } = useAppStore();
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Other');

  const handleAdd = (itemName?: string, category?: string) => {
    const name = itemName ?? newItem.trim();
    if (!name) return;
    const item: GroceryItem = {
      id: Date.now().toString(),
      name,
      quantity: '1x',
      category: category ?? selectedCategory,
      checked: false,
      addedAt: Date.now(),
    };
    addGroceryItem(item);
    setNewItem('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const unchecked = groceryList.filter((i) => !i.checked);
  const checked = groceryList.filter((i) => i.checked);

  const grouped = CATEGORIES.reduce<Record<string, GroceryItem[]>>((acc, cat) => {
    const items = unchecked.filter((i) => i.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Grocery List</Text>
        <Text style={styles.itemCount}>{unchecked.length} items</Text>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* Input */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Add item..."
                  placeholderTextColor={COLORS.mutedText}
                  value={newItem}
                  onChangeText={setNewItem}
                  returnKeyType="done"
                  onSubmitEditing={() => handleAdd()}
                />
                <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd()}>
                  <Text style={styles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Category chips */}
              <FlatList
                horizontal
                data={CATEGORIES}
                keyExtractor={(c) => c}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}
                renderItem={({ item: cat }) => (
                  <TouchableOpacity
                    style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                )}
              />

              {/* Suggested */}
              <Text style={styles.sectionTitle}>AI Suggested</Text>
              <FlatList
                horizontal
                data={SUGGESTED}
                keyExtractor={(i) => i.name}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedRow}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestedChip} onPress={() => handleAdd(item.name, item.category)}>
                    <Text style={styles.suggestedText}>+ {item.name}</Text>
                  </TouchableOpacity>
                )}
              />

              {/* Grouped items */}
              {Object.entries(grouped).map(([cat, items]) => (
                <View key={cat}>
                  <Text style={styles.groupTitle}>{cat}</Text>
                  {items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemRow}
                      onPress={() => { toggleGroceryItem(item.id); Haptics.selectionAsync(); }}
                    >
                      <View style={styles.checkbox}>
                        {item.checked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
                      <Text style={styles.itemCategory}>{item.category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}

              {/* Checked items */}
              {checked.length > 0 && (
                <>
                  <Text style={[styles.groupTitle, { color: COLORS.secondaryText }]}>✅ In Cart ({checked.length})</Text>
                  {checked.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.itemRow, styles.itemRowChecked]}
                      onPress={() => { toggleGroceryItem(item.id); Haptics.selectionAsync(); }}
                    >
                      <View style={[styles.checkbox, styles.checkboxChecked]}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                      <Text style={[styles.itemName, styles.itemNameChecked]}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {groceryList.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🛒</Text>
                  <Text style={styles.emptyTitle}>Your list is empty</Text>
                  <Text style={styles.emptySubtitle}>Add items or tap AI suggestions above</Text>
                </View>
              )}
            </>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyExtractor={() => 'header'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
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
  itemCount: { fontSize: FONT.sizes.sm, color: COLORS.secondaryText },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 80 },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  input: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    color: COLORS.white, fontSize: FONT.sizes.md, borderWidth: 1, borderColor: COLORS.border,
  },
  addBtn: {
    width: 52, height: 52, borderRadius: RADIUS.lg, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: COLORS.white, fontSize: 28, fontWeight: FONT.weights.bold },
  catRow: { paddingBottom: SPACING.md, gap: SPACING.sm },
  catChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  catChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryGlow },
  catText: { fontSize: FONT.sizes.sm, color: COLORS.secondaryText, fontWeight: FONT.weights.medium },
  catTextActive: { color: COLORS.primary, fontWeight: FONT.weights.bold },
  sectionTitle: { fontSize: FONT.sizes.md, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.sm },
  suggestedRow: { paddingBottom: SPACING.lg, gap: SPACING.sm },
  suggestedChip: {
    backgroundColor: COLORS.elevated, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  suggestedText: { fontSize: FONT.sizes.sm, color: COLORS.primary, fontWeight: FONT.weights.medium },
  groupTitle: { fontSize: FONT.sizes.sm, color: COLORS.secondaryText, fontWeight: FONT.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginVertical: SPACING.sm },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  itemRowChecked: { opacity: 0.5 },
  checkbox: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: FONT.weights.bold },
  itemName: { flex: 1, fontSize: FONT.sizes.md, color: COLORS.white, fontWeight: FONT.weights.medium },
  itemNameChecked: { textDecorationLine: 'line-through', color: COLORS.secondaryText },
  itemCategory: { fontSize: FONT.sizes.xs, color: COLORS.mutedText },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT.sizes.xl, color: COLORS.white, fontWeight: FONT.weights.bold, marginBottom: SPACING.sm },
  emptySubtitle: { fontSize: FONT.sizes.md, color: COLORS.secondaryText, textAlign: 'center' },
});
