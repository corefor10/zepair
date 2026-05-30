import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../../theme';

type UserRole = 'customer' | 'provider';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.xl * 2,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[palette.primaryContainer, palette.primaryContainer]}
            style={styles.logoBox}
          >
            <MaterialIcons name="person" size={28} color={palette.onPrimary} />
          </LinearGradient>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you want to use Zepair
          </Text>
        </View>

        {/* Role Options */}
        <View style={styles.optionsContainer}>
          {/* Customer Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => onSelectRole('customer')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#667eea14', '#764ba214']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#667eea20' }]}>
                <MaterialIcons name="person-outline" size={36} color="#667eea" />
              </View>
              <Text style={styles.optionTitle}>Customer</Text>
              <Text style={styles.optionDesc}>
                Book services from trusted professionals
              </Text>
              <View style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Service Professional Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => onSelectRole('provider')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#f093fb14', '#f5576c14']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#f5576c20' }]}>
                <MaterialIcons name="build" size={36} color="#f5576c" />
              </View>
              <Text style={styles.optionTitle}>Service Professional</Text>
              <Text style={styles.optionDesc}>
                Offer your services and grow your business
              </Text>
              <View style={[styles.selectButton, { backgroundColor: '#f5576c' }]}>
                <Text style={styles.selectButtonText}>Select</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.marginMobile,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl * 1.5,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: palette.primaryContainer,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.24,
    color: palette.onSurface,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: palette.onSurfaceVariant,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionsContainer: {
    gap: spacing.lg,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${palette.outlineVariant}40`,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  cardGradient: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  optionTitle: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700',
    color: palette.onSurface,
    textAlign: 'center',
  },
  optionDesc: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: palette.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  selectButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: palette.onPrimary,
  },
});

export default RoleSelectionScreen;
