import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { CustomButton } from '../../components/CustomButton';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { BottomSheet } from '../../components/BottomSheet';
import { useAlertService } from '../../utils/alertService';

// --- Composant d'icône de substitution pour l'exemple ---
// ** Remplacez ceci par un vrai composant d'icône de votre projet **
const SubstituteIcon = ({ name, size, color }: { name: string, size: number, color: string }) => (
  <Text style={{ fontSize: size, color, marginRight: 10 }}>
    {name === 'more-vertical' ? '•••' : '🗑️'}
  </Text>
);

// --- Composant d'élément du BottomSheet ---
interface BottomSheetItemProps {
  iconName: string;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

const BottomSheetItem: React.FC<BottomSheetItemProps> = ({
  iconName,
  label,
  onPress,
  isDanger = false,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createItemStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
    >
      <SubstituteIcon
        name={iconName}
        size={24}
        color={isDanger ? theme.colors.danger : theme.colors.text}
      />
      <Text
        style={[
          styles.label,
          isDanger && { color: theme.colors.danger },
          { color: isDanger ? theme.colors.danger : theme.colors.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export const ProfileScreen = () => {
  const { user, logout, deleteAccount } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const { showDestructiveConfirm } = useAlertService();

  const handleDeleteAccount = () => {
    setIsBottomSheetVisible(false);

    // Premier avertissement avec confirmation destructive
    showDestructiveConfirm(
      'Êtes-vous SÛR de vouloir supprimer votre compte ? Cette action est irréversible.',
      () => {
        // Deuxième et dernier avertissement
        showDestructiveConfirm(
          'Toutes vos données seront perdues. Confirmez la suppression.',
          () => {
            console.log('Suppression du compte lancée...');
          },
          undefined,
          'DERNIER AVERTISSEMENT',
          'SUPPRIMER DÉFINITIVEMENT'
        );
      },
      undefined,
      'Confirmation de Suppression'
    );
  };

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Bouton de menu (trois points) */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setIsBottomSheetVisible(true)}
      >
        <SubstituteIcon
          name="more-vertical"
          size={28}
          color={theme.colors.text}
        />
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
      <View style={[styles.infoContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
        <Text style={styles.label}>Name</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{user?.profileName}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{user?.email}</Text>

        <Text style={styles.label}>Username</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{user?.username}</Text>
      </View>

      <CustomButton
        title="Logout"
        onPress={logout}
        variant="danger"
        style={styles.logoutButton}
      />

      {/* BottomSheet pour les options */}
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        height={150}
      >
        <BottomSheetItem
          iconName="trash"
          label="Supprimer mon compte"
          onPress={handleDeleteAccount}
          isDanger
        />
      </BottomSheet>
    </ScreenWrapper>
  );
};

const createItemStyles = (theme: any) => StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    ...theme.typography.body,
  },
});

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: theme.spacing.m,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: theme.spacing.l,
    right: theme.spacing.m,
    zIndex: 10,
  },
  infoContainer: {
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.l,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  value: {
    ...theme.typography.body,
    marginBottom: theme.spacing.m,
  },
  logoutButton: {
    marginTop: 'auto',
  },
});