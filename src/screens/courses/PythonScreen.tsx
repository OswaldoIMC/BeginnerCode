import React, { useState, useEffect } from "react";
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
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, FONT_SIZES, Course, Lesson } from "../../../types";
import * as Progress from "react-native-progress";
import DataService from "../../services/DataService";

const PythonImage = require("../../../assets/python.png");

const PythonScreen = () => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  /**
   * Carga los datos del curso y sus lecciones
   */
  useEffect(() => {
    loadCourseData();
  }, []);

  /**
   * Función para cargar los datos del curso
   */
  const loadCourseData = () => {
    try {
      setLoading(true);

      // Obtener el curso de Python
      const pythonCourse = DataService.getCourseById("python");
      setCourse(pythonCourse || null);

      // Obtener las lecciones del curso
      const pythonLessons = DataService.getLessonsByCourse("python");
      setLessons(pythonLessons);

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar los datos del curso:", error);
      setLoading(false);
    }
  };

  /**
   * Maneja el clic en una lección
   */
  const handleLessonPress = (lesson: Lesson) => {
    console.log("Navegando a lección:", lesson.title);
    navigation.navigate("LessonDetail", { lessonId: lesson.id });
  };

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = (): void => {
    setMenuVisible(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  /**
   * Maneja la navegación al perfil del usuario
   */
  const handleProfile = (): void => {
    console.log("Navegando a perfil de usuario");
    setMenuVisible(false);
    handleComingSoon("Perfil de Usuario");
  };

  /**
   * Muestra mensaje de funcionalidad próximamente disponible
   */
  const handleComingSoon = (feature: string): void => {
    console.log(`Funcionalidad: ${feature} - Próximamente disponible`);
  };

  /**
   * Abre el menú de hamburguesa
   */
  const openMenu = (): void => {
    setMenuVisible(true);
  };

  /**
   * Cierra el menú de hamburguesa
   */
  const closeMenu = (): void => {
    setMenuVisible(false);
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando curso...</Text>
      </View>
    );
  }

  // Si no hay datos del curso, mostrar error
  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>No se pudo cargar el curso</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BeginnerCode</Text>
        <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal del menú de hamburguesa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú</Text>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>
                Cerrar Sesión
              </Text>
            </Pressable>
            <Pressable style={styles.closeMenuButton} onPress={closeMenu}>
              <Text style={styles.closeMenuText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.lessonList}>
        <View style={styles.contentContainer}>
          {/* Header del curso */}
          <View style={styles.headerContainer}>
            <Image source={PythonImage} style={styles.logo} />
            <Text style={styles.courseTitle}>{course.name}</Text>

            {/* Información adicional del curso */}
            <View style={styles.courseInfoContainer}>
              <View style={styles.infoItem}>
                <MaterialIcons name="school" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  {course.totalLessons} lecciones
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons
                  name="schedule"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.infoText}>~{course.estimatedHours}h</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons
                  name="trending-up"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.infoText}>
                  {course.difficulty === "beginner"
                    ? "Principiante"
                    : course.difficulty}
                </Text>
              </View>
            </View>
          </View>

          {/* Descripción del curso */}
          <Text style={styles.subtitle}>Detalles del curso</Text>
          <Text style={styles.description}>{course.description}</Text>

          <Text style={styles.lessonText}>Lecciones ({lessons.length})</Text>

          {/* Lista de lecciones */}
          {lessons.map((lesson, index) => {
            const progress = DataService.getLessonProgress(lesson.id);

            return (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                activeOpacity={0.8}
                onPress={() => handleLessonPress(lesson)}
              >
                <View style={styles.lessonIconContainer}>
                  <Text style={styles.lessonNumber}>
                    {lesson.order < 10 ? `0${lesson.order}` : lesson.order}
                  </Text>
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonDescription} numberOfLines={2}>
                    {lesson.description}
                  </Text>

                  {/* Información adicional */}
                  <View style={styles.lessonMetaContainer}>
                    <View style={styles.lessonMeta}>
                      <MaterialIcons
                        name="access-time"
                        size={14}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.lessonMetaText}>
                        {lesson.estimatedMinutes} min
                      </Text>
                    </View>
                    <View style={styles.lessonMeta}>
                      <MaterialIcons
                        name="quiz"
                        size={14}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.lessonMetaText}>
                        {lesson.challenges.length} retos
                      </Text>
                    </View>
                  </View>

                  {/* Barra de progreso */}
                  <Progress.Bar
                    progress={progress}
                    width={null}
                    color="#3776AB"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                    style={styles.progressBar}
                  />

                  {/* Porcentaje de progreso */}
                  {progress > 0 && (
                    <Text style={styles.progressText}>
                      {Math.round(progress * 100)}% completado
                    </Text>
                  )}
                </View>

                {/* Icono de completado */}
                {progress === 1.0 && (
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
    </SafeAreaProvider>
  );
};

export default PythonScreen;

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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.surface,
    flex: 1,
    textAlign: "center",
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
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
    color: COLORS.text,
    textAlign: "center",
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
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  menuTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 15,
    fontWeight: "500",
  },
  closeMenuButton: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeMenuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 23,
    marginLeft: 10,
    marginBottom: 10,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "left",
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
    lineHeight: 24,
  },
  lessonText: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.primary,
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
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "flex-start",
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
    color: COLORS.primary,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#142646",
    marginBottom: 5,
  },
  lessonDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
  },
  progressBar: {
    marginTop: 5,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 5,
    fontWeight: "600",
  },
  completedIcon: {
    position: "absolute",
    top: 15,
    right: 15,
  },
});
