import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { COLORS, FONT_SIZES, UserProfile, Badge } from "../../../types";
import StorageService from "../../services/StorageService";

/**
 * Props de navegación para esta pantalla
 */
type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Profile"
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

/**
 * Pantalla de perfil del usuario
 * Muestra estadísticas, medallas, nivel y opciones de configuración
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);

  /**
   * Carga los datos del perfil
   */
  useEffect(() => {
    loadProfileData();
  }, []);

  /**
   * Función para cargar los datos del perfil
   */
  const loadProfileData = async () => {
    try {
      setLoading(true);

      const userProfile = await StorageService.getUserProfile();
      setProfile(userProfile);

      const userStats = await StorageService.getUserStats();
      setStats(userStats);

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      setLoading(false);
    }
  };

  /**
   * Calcula los puntos necesarios para el siguiente nivel
   */
  const getPointsForNextLevel = (currentLevel: number): number => {
    return currentLevel * 100;
  };

  /**
   * Calcula el progreso hacia el siguiente nivel
   */
  const getLevelProgress = (
    totalPoints: number,
    currentLevel: number
  ): number => {
    const pointsInCurrentLevel = totalPoints % 100;
    return pointsInCurrentLevel / 100;
  };

  /**
   * Renderiza una tarjeta de estadística
   */
  const renderStatCard = (
    icon: string,
    value: string | number,
    label: string,
    color: string
  ) => (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
      >
        <MaterialIcons name={icon as any} size={30} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  /**
   * Renderiza una medalla
   */
  const renderBadge = (badge: Badge) => (
    <View
      key={badge.id}
      style={[styles.badgeCard, !badge.isUnlocked && styles.badgeCardLocked]}
    >
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text
        style={[styles.badgeName, !badge.isUnlocked && styles.badgeTextLocked]}
      >
        {badge.name}
      </Text>
      <Text
        style={[
          styles.badgeDescription,
          !badge.isUnlocked && styles.badgeTextLocked,
        ]}
      >
        {badge.description}
      </Text>
      {badge.isUnlocked && badge.earnedAt && (
        <Text style={styles.badgeDate}>
          {new Date(badge.earnedAt).toLocaleDateString()}
        </Text>
      )}
      {!badge.isUnlocked && (
        <View style={styles.lockedOverlay}>
          <MaterialIcons name="lock" size={24} color={COLORS.textSecondary} />
        </View>
      )}
    </View>
  );

  // Mostrar loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  // Si no hay perfil
  if (!profile || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const levelProgress = getLevelProgress(profile.totalPoints, profile.level);
  const pointsForNextLevel = getPointsForNextLevel(profile.level);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Sección de Usuario */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <MaterialIcons
              name="account-circle"
              size={100}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.username}>{profile.username}</Text>
          <View style={styles.levelContainer}>
            <MaterialIcons name="stars" size={20} color="#FFD700" />
            <Text style={styles.levelText}>Nivel {profile.level}</Text>
          </View>

          {/* Barra de progreso de nivel */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View
                style={[
                  styles.levelProgressFill,
                  { width: `${levelProgress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.levelProgressText}>
              {profile.totalPoints % 100} / {pointsForNextLevel} pts
            </Text>
          </View>
        </View>

        {/* Estadísticas Generales */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="bar-chart" size={24} color={COLORS.primary} />{" "}
            Estadísticas
          </Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              "school",
              stats.totalLessonsCompleted,
              "Lecciones completadas",
              "#4CAF50"
            )}
            {renderStatCard(
              "emoji-events",
              stats.totalPoints,
              "Puntos totales",
              "#FF9800"
            )}
            {renderStatCard(
              "military-tech",
              stats.badgesUnlocked,
              "Medallas",
              "#FFD700"
            )}
            {renderStatCard(
              "workspace-premium",
              stats.coursesCompleted,
              "Cursos terminados",
              "#2196F3"
            )}
          </View>
        </View>

        {/* Medallas */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons
              name="emoji-events"
              size={24}
              color={COLORS.primary}
            />{" "}
            Medallas ({stats.badgesUnlocked}/{profile.badges.length})
          </Text>
          <View style={styles.badgesGrid}>
            {profile.badges.map(renderBadge)}
          </View>
        </View>

        {/* Información de la cuenta */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            <MaterialIcons name="info" size={24} color={COLORS.primary} />{" "}
            Información de la cuenta
          </Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="person"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoLabel}>Usuario:</Text>
              <Text style={styles.infoValue}>{profile.username}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoLabel}>Miembro desde:</Text>
              <Text style={styles.infoValue}>
                {new Date(profile.joinedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Espacio al final */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
  errorText: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
    color: COLORS.error,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.surface,
    flex: 1,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  userSection: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  levelProgressContainer: {
    width: "100%",
    maxWidth: 300,
  },
  levelProgressBar: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  levelProgressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  levelProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  sectionContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "48%",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badgeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "48%",
    minHeight: 150,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: "relative",
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 5,
  },
  badgeDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 5,
  },
  badgeDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  badgeTextLocked: {
    color: COLORS.textSecondary,
  },
  lockedOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  infoContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: COLORS.error + "40",
  },
});
