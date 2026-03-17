/**
 * Pantalla de Curso unificada (MVVM)
 * Muestra los detalles y lecciones de cualquier curso según el courseId recibido
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { FONT_SIZES } from "../../../types";
import * as Progress from "react-native-progress";
import { useTheme } from "../../context/ThemeContext";
import { useCourseViewModel } from "../../hooks/useCourseViewModel";

// ==========================================
// TIPOS
// ==========================================
type CourseScreenRouteProp = RouteProp<RootStackParamList, "Course">;
type CourseScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Course"
>;

interface CourseScreenProps {
  route: CourseScreenRouteProp;
  navigation: CourseScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const CourseScreen: React.FC<CourseScreenProps> = ({ route, navigation }) => {
  const { courseId } = route.params;
  const { theme, isDarkMode } = useTheme();

  // ViewModel
  const viewModel = useCourseViewModel({ courseId, navigation });

  // Loading
  if (viewModel.loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando curso...
        </Text>
      </View>
    );
  }

  // Sin datos del curso
  if (!viewModel.course) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <MaterialIcons name="error-outline" size={50} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>
          No se pudo cargar el curso
        </Text>
      </View>
    );
  }

  const course = viewModel.course;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.surface }]}
    >
      <StatusBar
        backgroundColor={theme.primary}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />

      <ConnectivityIndicator />

      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={viewModel.handleGoBack}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.surface }]}>
          BeginnerCode
        </Text>

        <TouchableOpacity
          onPress={() => viewModel.setMenuVisible(true)}
          style={styles.iconButton}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal menu */}
      <Modal transparent animationType="slide" visible={viewModel.menuVisible}>
        <Pressable
          style={styles.menuOverlay}
          onPress={() => viewModel.setMenuVisible(false)}
        >
          <Pressable
            style={[styles.menuContainer, { backgroundColor: theme.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: theme.background },
              ]}
            >
              <MaterialIcons name="menu" size={28} color={theme.primary} />
              <Text style={[styles.menuTitle, { color: theme.text }]}>
                Menú
              </Text>

              <TouchableOpacity
                onPress={() => viewModel.setMenuVisible(false)}
              >
                <MaterialIcons
                  name="close"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Opciones del menú */}
            <View style={styles.menuOptions}>
              {/* Perfil */}
              <Pressable
                style={styles.menuOption}
                onPress={viewModel.handleNavigateToProfile}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                >
                  <MaterialIcons
                    name="person"
                    size={24}
                    color={theme.primary}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuOptionTitle, { color: theme.text }]}
                  >
                    Mi Perfil
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Ver estadísticas y medallas
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.textSecondary}
                />
              </Pressable>

              {/* Configuración */}
              <Pressable
                style={styles.menuOption}
                onPress={viewModel.handleNavigateToSettings}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: theme.primary + "15" },
                  ]}
                >
                  <MaterialIcons
                    name="settings"
                    size={24}
                    color={theme.primary}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuOptionTitle, { color: theme.text }]}
                  >
                    Configuración
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Ajustes de la aplicación
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.textSecondary}
                />
              </Pressable>

              <View
                style={[
                  styles.menuDivider,
                  { backgroundColor: theme.background },
                ]}
              />

              {/* Logout */}
              <Pressable
                style={styles.menuOption}
                onPress={viewModel.handleLogout}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: theme.error + "15" },
                  ]}
                >
                  <MaterialIcons
                    name="logout"
                    size={24}
                    color={theme.error}
                  />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text
                    style={[styles.menuOptionTitle, { color: theme.error }]}
                  >
                    Cerrar Sesión
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Salir de tu cuenta
                  </Text>
                </View>

                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={theme.error}
                />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.lessonList}>
        <View
          style={[styles.contentContainer, { backgroundColor: theme.surface }]}
        >
          {/* Header del curso */}
          <View
            style={[
              styles.headerContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <Image source={course.icon} style={styles.logo} />

            <Text style={[styles.courseTitle, { color: theme.text }]}>
              {course.name}
            </Text>

            {/* Información adicional del curso */}
            <View style={styles.courseInfoContainer}>
              <View style={styles.infoItem}>
                <MaterialIcons
                  name="school"
                  size={18}
                  color={theme.primary}
                />
                <Text
                  style={[styles.infoText, { color: theme.textSecondary }]}
                >
                  {course.totalLessons} lecciones
                </Text>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons
                  name="schedule"
                  size={18}
                  color={theme.primary}
                />
                <Text
                  style={[styles.infoText, { color: theme.textSecondary }]}
                >
                  ~{course.estimatedHours}h
                </Text>
              </View>

              <View style={styles.infoItem}>
                <MaterialIcons
                  name="trending-up"
                  size={18}
                  color={theme.primary}
                />
                <Text
                  style={[styles.infoText, { color: theme.textSecondary }]}
                >
                  {viewModel.getDifficultyLabel(course.difficulty)}
                </Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Detalles del curso
          </Text>

          <Text style={[styles.description, { color: theme.text }]}>
            {course.description}
          </Text>

          <Text style={[styles.lessonText, { color: theme.primary }]}>
            Lecciones ({viewModel.lessons.length})
          </Text>

          {/* Lecciones */}
          {viewModel.lessons.map((lesson) => {
            const progress = viewModel.lessonsProgress[lesson.id] || 0;

            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, { backgroundColor: theme.card }]}
                activeOpacity={0.8}
                onPress={() => viewModel.handleLessonPress(lesson)}
              >
                <View style={styles.lessonIconContainer}>
                  <Text
                    style={[styles.lessonNumber, { color: theme.primary }]}
                  >
                    {lesson.order.toString().padStart(2, "0")}
                  </Text>
                </View>

                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, { color: theme.text }]}>
                    {lesson.title}
                  </Text>

                  <Text
                    style={[
                      styles.lessonDescription,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {lesson.description}
                  </Text>

                  {/* Información adicional */}
                  <View style={styles.lessonMetaContainer}>
                    <View style={styles.lessonMeta}>
                      <MaterialIcons
                        name="access-time"
                        size={14}
                        color={theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.lessonMetaText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {lesson.estimatedMinutes} min
                      </Text>
                    </View>

                    <View style={styles.lessonMeta}>
                      <MaterialIcons
                        name="quiz"
                        size={14}
                        color={theme.textSecondary}
                      />
                      <Text
                        style={[
                          styles.lessonMetaText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {lesson.challenges.length} retos
                      </Text>
                    </View>
                  </View>

                  {/* Barra de progreso */}
                  <Progress.Bar
                    progress={progress}
                    width={null}
                    height={8}
                    color={course.color}
                    unfilledColor={isDarkMode ? "#444" : "#E0E0E0"}
                    borderWidth={0}
                    style={styles.progressBar}
                  />

                  {/* Porcentaje de progreso */}
                  {progress > 0 && (
                    <Text
                      style={[styles.progressText, { color: theme.primary }]}
                    >
                      {Math.round(progress * 100)}% completado
                    </Text>
                  )}
                </View>

                {progress === 1 && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color="#4CAF50"
                    style={styles.completedIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseScreen;

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1 },

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
  },

  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  iconButton: {
    padding: 8,
    borderRadius: 20,
  },

  contentContainer: {
    flex: 1,
  },

  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 25,
    elevation: 3,
  },

  logo: {
    width: 130,
    height: 130,
    marginTop: 20,
    marginBottom: 10,
  },

  courseTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },

  courseInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  infoText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "500",
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  menuContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
    maxHeight: "70%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },

  menuTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 12,
  },

  menuOptions: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },

  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuOptionTitle: {
    fontSize: FONT_SIZES.medium,
    fontWeight: "600",
    marginBottom: 2,
  },

  menuOptionDescription: {
    fontSize: FONT_SIZES.small,
  },

  menuDivider: {
    height: 1,
    marginVertical: 8,
  },

  subtitle: {
    fontSize: 23,
    marginLeft: 10,
    marginBottom: 10,
    fontWeight: "bold",
  },

  description: {
    fontSize: 16,
    textAlign: "left",
    marginHorizontal: 10,
    marginBottom: 20,
    lineHeight: 24,
  },

  lessonText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 10,
    marginBottom: 10,
  },

  lessonList: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },

  lessonCard: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
    position: "relative",
  },

  lessonIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E3ECF9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  lessonNumber: {
    fontSize: 28,
    fontWeight: "bold",
  },

  lessonInfo: {
    flex: 1,
  },

  lessonTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },

  lessonDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },

  lessonMetaContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 10,
  },

  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  lessonMetaText: {
    fontSize: 12,
  },

  progressBar: {
    marginTop: 5,
  },

  progressText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },

  completedIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
});
