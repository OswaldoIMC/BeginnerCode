import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { FONT_SIZES, UserProfile, Badge } from "../../../types";
import StorageService from "../../services/StorageService";
import { useTheme } from "../../context/ThemeContext";

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
  const { theme } = useTheme();

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
    <View style={[styles.statCard, { backgroundColor: theme.card }]}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
      >
        <MaterialIcons name={icon as any} size={30} color={color} />
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  /**
   * Renderiza una medalla
   */
  const renderBadge = (badge: Badge) => (
    <View
      key={badge.id}
      style={[
        styles.badgeCard,
        { backgroundColor: theme.card },
        !badge.isUnlocked && styles.badgeCardLocked,
      ]}
    >
      <Text style={styles.badgeIcon}>{badge.icon}</Text>

      <Text
        style={[
          styles.badgeName,
          { color: theme.text },
          !badge.isUnlocked && { color: theme.textSecondary },
        ]}
      >
        {badge.name}
      </Text>

      <Text style={[styles.badgeDescription, { color: theme.textSecondary }]}>
        {badge.description}
      </Text>

      {badge.isUnlocked && badge.earnedAt && (
        <Text style={[styles.badgeDate, { color: theme.textSecondary }]}>
          {new Date(badge.earnedAt).toLocaleDateString()}
        </Text>
      )}

      {!badge.isUnlocked && (
        <View style={styles.lockedOverlay}>
          <MaterialIcons name="lock" size={24} color={theme.textSecondary} />
        </View>
      )}
    </View>
  );

  // Mostrar loading
  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  // Si no hay perfil
  if (!profile || !stats) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <MaterialIcons name="error-outline" size={50} color={theme.error} />

        <Text style={[styles.errorText, { color: theme.error }]}>
          No se pudo cargar el perfil
        </Text>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.primary }]}
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.surface }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        backgroundColor={theme.primary}
        barStyle="light-content"
        translucent={false}
      />

      <ConnectivityIndicator />

      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          { backgroundColor: theme.primary, shadowColor: theme.text },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.surface }]}>
          Mi Perfil
        </Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Usuario */}
        <View
          style={[styles.userSection, { backgroundColor: theme.background }]}
        >
          <View style={styles.avatarContainer}>
            <MaterialIcons
              name="account-circle"
              size={100}
              color={theme.primary}
            />
          </View>

          <Text style={[styles.username, { color: theme.text }]}>
            {profile.username}
          </Text>

          <View style={styles.levelContainer}>
            <MaterialIcons name="stars" size={20} color="#FFD700" />
            <Text style={[styles.levelText, { color: theme.text }]}>
              Nivel {profile.level}
            </Text>
          </View>

          {/* Progreso */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View
                style={[
                  styles.levelProgressFill,
                  { width: `${levelProgress * 100}%` },
                ]}
              />
            </View>

            <Text
              style={[styles.levelProgressText, { color: theme.textSecondary }]}
            >
              {profile.totalPoints % 100} / {pointsForNextLevel} pts
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            <MaterialIcons name="bar-chart" size={24} color={theme.primary} />{" "}
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
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            <MaterialIcons
              name="emoji-events"
              size={24}
              color={theme.primary}
            />{" "}
            Medallas ({stats.badgesUnlocked}/{profile.badges.length})
          </Text>

          <View style={styles.badgesGrid}>
            {profile.badges.map(renderBadge)}
          </View>
        </View>

        {/* Información */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            <MaterialIcons name="info" size={24} color={theme.primary} />{" "}
            Información de la cuenta
          </Text>

          <View style={[styles.infoContainer, { backgroundColor: theme.card }]}>
            <View
              style={[styles.infoRow, { borderBottomColor: theme.background }]}
            >
              <MaterialIcons
                name="person"
                size={20}
                color={theme.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Usuario:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {profile.username}
              </Text>
            </View>

            <View
              style={[styles.infoRow, { borderBottomColor: theme.background }]}
            >
              <MaterialIcons
                name="calendar-today"
                size={20}
                color={theme.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Miembro desde:
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {new Date(profile.joinedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Espacio al final */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
  },

  errorText: {
    marginTop: 10,
    fontSize: FONT_SIZES.medium,
    marginBottom: 20,
  },

  backButton: {
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
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
    textAlign: "center",
  },

  sectionContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },

  statCard: {
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
    marginBottom: 5,
  },

  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },

  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  badgeCard: {
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
    textAlign: "center",
    marginBottom: 5,
  },

  badgeDescription: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 5,
  },

  badgeDate: {
    fontSize: 10,
    fontStyle: "italic",
  },

  lockedOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  infoContainer: {
    borderRadius: 12,
    padding: 15,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },

  infoLabel: {
    fontSize: 14,
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
});
