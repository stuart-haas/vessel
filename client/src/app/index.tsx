import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing } from '@/theme';

type Tile = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const comingSoon = () => {
    const msg = 'Audio reading is coming soon.';
    if (Platform.OS === 'web') {
      // Alert on web only supports a single button; keep it simple.
      window.alert(msg);
    } else {
      Alert.alert('Listen', msg);
    }
  };

  const tiles: Tile[] = [
    { label: 'Read', icon: 'book-outline', onPress: () => router.push('/read') },
    { label: 'Listen', icon: 'volume-high-outline', onPress: comingSoon },
    { label: 'Journal', icon: 'create-outline', onPress: () => router.push('/journals') },
    { label: 'Settings', icon: 'settings-outline', onPress: () => router.push('/settings') },
  ];

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={[styles.overlay, { paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.hero}>
          <Text style={styles.title}>Vessel</Text>
          <Text style={styles.subtitle}>
            Encouraging children of God to spend time in His presence daily.
          </Text>
          <View style={styles.rule} />
          <Text style={styles.verse}>
            “Your Word is a lamp to my feet and a light to my path.”
          </Text>
          <Text style={styles.ref}>Psalm 119:105</Text>
        </View>

        <View style={styles.grid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.label}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              onPress={tile.onPress}
            >
              <Ionicons name={tile.icon} size={24} color={colors.text} />
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: 560,
  },
  title: {
    color: colors.onDark,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.onDark,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  rule: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginVertical: spacing.sm,
  },
  verse: {
    color: colors.onDark,
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ref: {
    color: colors.onDark,
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    maxWidth: 420,
  },
  tile: {
    width: 150,
    height: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tilePressed: {
    opacity: 0.85,
  },
  tileLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
});
