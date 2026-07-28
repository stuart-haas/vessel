import { Ionicons } from '@expo/vector-icons';
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

import { api } from '@/api';
import ThoughtEditor from '@/components/ThoughtEditor';
import { useSettings } from '@/settings';
import { colors, radius, spacing } from '@/theme';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bibleId } = useSettings();
  const isNew = id === 'new';
  const journalId = isNew ? null : Number(id);

  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew || journalId == null) return;
    let cancelled = false;
    api
      .getJournal(journalId)
      .then((j) => {
        if (cancelled) return;
        setTitle(j.title);
        setEntryDate(j.entry_date || today());
        setContent(j.content);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoading(false);
        notify('Error', String(err.message ?? err));
      });
    return () => {
      cancelled = true;
    };
  }, [isNew, journalId]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { title, entry_date: entryDate, content };
      if (isNew) {
        await api.createJournal(payload);
      } else if (journalId != null) {
        await api.updateJournal(journalId, payload);
      }
      router.back();
    } catch (err: any) {
      notify('Could not save', String(err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (journalId == null) return;
    const doDelete = async () => {
      try {
        await api.deleteJournal(journalId);
        router.back();
      } catch (err: any) {
        notify('Could not delete', String(err.message ?? err));
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this entry?')) doDelete();
    } else {
      Alert.alert('Delete entry', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  if (loading) {
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
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteLabel}>Delete entry</Text>
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
