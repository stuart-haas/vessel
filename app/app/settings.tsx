import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { api, type Bible } from '@/api';
import { useSettings } from '@/settings';
import { colors, radius, spacing } from '@/theme';

export default function Settings() {
  const { bibleId, setBibleId } = useSettings();
  const [bibles, setBibles] = useState<Bible[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api
      .listBibles()
      .then(setBibles)
      .catch((err) => setError(String(err.message ?? err)));
  }, []);

  const filtered = useMemo(() => {
    if (!bibles) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return bibles;
    return bibles.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.abbreviation?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q),
    );
  }, [bibles, filter]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Bible Version</Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !bibles ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      ) : (
        <>
          <TextInput
            style={styles.filter}
            placeholder="Search versions…"
            placeholderTextColor={colors.textMuted}
            value={filter}
            onChangeText={setFilter}
            autoCorrect={false}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.id === bibleId;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && styles.rowPressed,
                  ]}
                  onPress={() => setBibleId(item.id)}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    {!!item.description && (
                      <Text style={styles.rowSubtitle} numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </Pressable>
              );
            }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginTop: spacing.lg,
  },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  rowPressed: {
    opacity: 0.85,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
});
