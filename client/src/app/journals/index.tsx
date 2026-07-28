import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { listJournalsOptions } from '@/api/client/@tanstack/react-query.gen';
import { errorMessage } from '@/errors';
import { colors, radius, spacing } from '@/theme';

function snippet(content: string | undefined): string {
  return (content ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
}

export default function JournalsList() {
  const router = useRouter();
  const { data: journals, error, isFetching, refetch } = useQuery(listJournalsOptions());

  // Reload whenever the screen regains focus (e.g. after saving an entry).
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{errorMessage(error)}</Text>
          <Text style={styles.hint}>Make sure the Vessel API is running.</Text>
        </View>
      ) : !journals ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={journals}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="leaf-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.hint}>Tap the button below to write your first thought.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(`/journals/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'Untitled'}
                </Text>
                {!!item.entry_date && <Text style={styles.cardDate}>{item.entry_date}</Text>}
              </View>
              {!!snippet(item.content) && (
                <Text style={styles.cardSnippet} numberOfLines={2}>
                  {snippet(item.content)}
                </Text>
              )}
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/journals/new')}
      >
        <Ionicons name="add" size={22} color={colors.onDark} />
        <Text style={styles.fabLabel}>New entry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 96,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  cardDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardSnippet: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  error: {
    fontSize: 15,
    color: colors.danger,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabLabel: {
    color: colors.onDark,
    fontSize: 16,
    fontWeight: '700',
  },
});
