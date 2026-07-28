import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { getVerseOptions } from '@/client/@tanstack/react-query.gen';
import { errorMessage } from '@/errors';
import { useSettings } from '@/settings';
import { colors, radius, spacing } from '@/theme';

// A gentle default passage to open on.
const DEFAULT_VERSE_ID = 'JHN.3.16';

export default function Read() {
  const { bibleId } = useSettings();
  const { data, error, isLoading } = useQuery(
    getVerseOptions({ path: { bible_id: bibleId, verse_id: DEFAULT_VERSE_ID } }),
  );

  // The API returns HTML-ish content; strip tags for a clean read.
  const content = (data?.content ?? '').replace(/<[^>]+>/g, '').trim();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : error ? (
        <View style={styles.card}>
          <Text style={styles.errorTitle}>Couldn’t load today’s verse</Text>
          <Text style={styles.errorText}>{errorMessage(error)}</Text>
          <Text style={styles.hint}>
            Make sure the Vessel API is running and reachable.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.reference}>{data?.reference}</Text>
          <Text style={styles.verse}>{content}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reference: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verse: {
    fontSize: 22,
    lineHeight: 32,
    color: colors.text,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.danger,
  },
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
