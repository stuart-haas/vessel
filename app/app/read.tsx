import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { api } from '@/api';
import { useSettings } from '@/settings';
import { colors, radius, spacing } from '@/theme';

// A gentle default passage to open on.
const DEFAULT_VERSE_ID = 'JHN.3.16';

export default function Read() {
  const { bibleId } = useSettings();
  const [state, setState] = useState<{
    loading: boolean;
    error?: string;
    reference?: string;
    content?: string;
  }>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    api
      .getVerse(bibleId, DEFAULT_VERSE_ID)
      .then((data) => {
        if (cancelled) return;
        setState({
          loading: false,
          reference: data.reference,
          // The API returns HTML-ish content; strip tags for a clean read.
          content: (data.content ?? '').replace(/<[^>]+>/g, '').trim(),
        });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: String(err.message ?? err) });
      });
    return () => {
      cancelled = true;
    };
  }, [bibleId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {state.loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : state.error ? (
        <View style={styles.card}>
          <Text style={styles.errorTitle}>Couldn’t load today’s verse</Text>
          <Text style={styles.errorText}>{state.error}</Text>
          <Text style={styles.hint}>
            Make sure the Vessel API is running and reachable.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.reference}>{state.reference}</Text>
          <Text style={styles.verse}>{state.content}</Text>
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
