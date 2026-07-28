import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createJournalMutation,
  deleteJournalMutation,
  getJournalOptions,
  listJournalsQueryKey,
  listTagsQueryKey,
  updateJournalMutation,
} from '@/api/client/@tanstack/react-query.gen';
import ThoughtEditor from '@/components/ThoughtEditor';
import { errorMessage } from '@/errors';
import { useSettings } from '@/settings';
import { colors, radius, spacing } from '@/theme';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalEditor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bibleId } = useSettings();
  const isNew = id === 'new';
  const journalId = isNew ? 0 : Number(id);

  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [content, setContent] = useState('');

  const { data: loaded, isLoading, error } = useQuery({
    ...getJournalOptions({ path: { journal_id: journalId } }),
    enabled: !isNew,
  });

  // Seed the editable form once the entry loads.
  useEffect(() => {
    if (loaded) {
      setTitle(loaded.title ?? '');
      setEntryDate(loaded.entry_date || today());
      setContent(loaded.content ?? '');
    }
  }, [loaded]);

  useEffect(() => {
    if (error) notify('Error', errorMessage(error));
  }, [error]);

  const invalidateLists = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: listJournalsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: listTagsQueryKey() }),
    ]);

  const createMut = useMutation({
    ...createJournalMutation(),
    onSuccess: async () => {
      await invalidateLists();
      router.back();
    },
    onError: (err) => notify('Could not save', errorMessage(err)),
  });

  const updateMut = useMutation({
    ...updateJournalMutation(),
    onSuccess: async () => {
      await invalidateLists();
      router.back();
    },
    onError: (err) => notify('Could not save', errorMessage(err)),
  });

  const deleteMut = useMutation({
    ...deleteJournalMutation(),
    onSuccess: async () => {
      await invalidateLists();
      router.back();
    },
    onError: (err) => notify('Could not delete', errorMessage(err)),
  });

  const saving = createMut.isPending || updateMut.isPending;

  const save = () => {
    const body = { title, entry_date: entryDate, content };
    if (isNew) {
      createMut.mutate({ body });
    } else {
      updateMut.mutate({ path: { journal_id: journalId }, body });
    }
  };

  const confirmDelete = () => {
    const doDelete = () => deleteMut.mutate({ path: { journal_id: journalId } });
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this entry?')) doDelete();
    } else {
      Alert.alert('Delete entry', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: isNew ? 'New entry' : 'Edit entry',
          headerRight: () => (
            <Pressable onPress={save} disabled={saving} hitSlop={8}>
              <Text style={[styles.headerSave, saving && styles.headerSaveDisabled]}>
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Give this entry a title"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={entryDate}
            onChangeText={setEntryDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Thoughts</Text>
          <ThoughtEditor value={content} onChangeText={setContent} bibleId={bibleId} />
        </View>

        {!isNew && (
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            onPress={confirmDelete}
            disabled={deleteMut.isPending}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteLabel}>
              {deleteMut.isPending ? 'Deleting…' : 'Delete entry'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.md,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  headerSave: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  headerSaveDisabled: {
    color: colors.textMuted,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  deleteLabel: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
