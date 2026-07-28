import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { listTags, searchVerses, type Tag, type VerseHit } from '@/client';
import { colors, radius, spacing } from '@/theme';
import {
  filterCommands,
  getActiveToken,
  replaceToken,
  slashCommands,
  type ActiveToken,
  type SlashCommand,
} from '@/editor/tokens';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  bibleId: string;
  placeholder?: string;
};

type Suggestion = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  insert: string;
};

const TRIGGER_HELP = 'Type  @ verse   ·   # idea   ·   / command';

export default function ThoughtEditor({
  value,
  onChangeText,
  bibleId,
  placeholder,
}: Props) {
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [token, setToken] = useState<ActiveToken | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const tagsCache = useRef<Tag[] | null>(null);
  const searchSeq = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  // Recompute the active token whenever the text or cursor moves.
  const active = getActiveToken(value, selection.start);
  const activeSig = active ? `${active.trigger}:${active.query}:${active.start}` : null;

  const loadVerses = useCallback(
    async (tok: ActiveToken) => {
      if (tok.query.length < 2) {
        setSuggestions([]);
        setLoading(false);
        return;
      }
      const seq = ++searchSeq.current;
      setLoading(true);
      try {
        const { data } = await searchVerses({
          path: { bible_id: bibleId },
          query: { query: tok.query, limit: 8 },
          throwOnError: true,
        });
        const hits = data ?? [];
        if (seq !== searchSeq.current) return; // a newer search superseded this one
        setSuggestions(
          hits.map((h: VerseHit) => ({
            key: h.id || h.reference,
            icon: 'book-outline',
            title: h.reference,
            subtitle: h.text,
            insert: h.reference,
          })),
        );
      } catch {
        if (seq === searchSeq.current) setSuggestions([]);
      } finally {
        if (seq === searchSeq.current) setLoading(false);
      }
    },
    [bibleId],
  );

  const loadTags = useCallback(async (tok: ActiveToken) => {
    if (!tagsCache.current) {
      try {
        const { data } = await listTags({ throwOnError: true });
        tagsCache.current = data ?? [];
      } catch {
        tagsCache.current = [];
      }
    }
    const q = tok.query.toLowerCase();
    const matches = tagsCache.current
      .filter((t) => t.tag.includes(q))
      .slice(0, 8)
      .map((t) => ({
        key: `tag:${t.tag}`,
        icon: 'pricetag-outline' as const,
        title: `#${t.tag}`,
        subtitle: `${t.count} ${t.count === 1 ? 'entry' : 'entries'}`,
        insert: `#${t.tag}`,
      }));

    // Offer to create a brand-new idea tag.
    const exists = tagsCache.current.some((t) => t.tag === q);
    const create: Suggestion[] =
      q && !exists
        ? [
            {
              key: `create:${q}`,
              icon: 'add-circle-outline',
              title: `Create #${q}`,
              subtitle: 'New idea',
              insert: `#${q}`,
            },
          ]
        : [];
    setSuggestions([...create, ...matches]);
  }, []);

  const loadCommands = useCallback(
    (tok: ActiveToken) => {
      const cmds = filterCommands(slashCommands(today), tok.query);
      setSuggestions(
        cmds.map((c: SlashCommand) => ({
          key: `cmd:${c.id}`,
          icon: 'flash-outline',
          title: c.label,
          subtitle: c.description,
          insert: c.insert,
        })),
      );
    },
    [today],
  );

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);

    if (!active) {
      setToken(null);
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setToken(active);

    if (active.trigger === '@') {
      // Fresh tags may have changed; verse search is debounced (network).
      debounce.current = setTimeout(() => loadVerses(active), 220);
    } else if (active.trigger === '#') {
      loadTags(active);
    } else {
      loadCommands(active);
    }

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSig]);

  const applySuggestion = (insert: string) => {
    if (!token) return;
    // Creating a tag means our cache is stale next time.
    if (insert.startsWith('#')) tagsCache.current = null;
    const result = replaceToken(value, token, insert);
    onChangeText(result.text);
    setSelection({ start: result.cursor, end: result.cursor });
    setToken(null);
    setSuggestions([]);
  };

  const showPanel = token !== null && (loading || suggestions.length > 0);

  return (
    <View style={styles.container}>
      {showPanel && (
        <View style={styles.panel}>
          {loading && suggestions.length === 0 ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Searching…</Text>
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.panelScroll}>
              {suggestions.map((s) => (
                <Pressable
                  key={s.key}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => applySuggestion(s.insert)}
                >
                  <Ionicons name={s.icon} size={18} color={colors.primary} />
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle} numberOfLines={1}>
                      {s.title}
                    </Text>
                    {!!s.subtitle && (
                      <Text style={styles.rowSubtitle} numberOfLines={2}>
                        {s.subtitle}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
        selection={selection}
        multiline
        textAlignVertical="top"
        placeholder={placeholder ?? 'Write your thoughts…'}
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.help}>{TRIGGER_HELP}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  help: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  panel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    // Subtle elevation across platforms.
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  panelScroll: {
    maxHeight: 220,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    backgroundColor: colors.primarySoft,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
});
