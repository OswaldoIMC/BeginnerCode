/**
 * ViewModel para la pantalla de Cursos
 */

import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Course, Lesson } from "../../types";
import DataService from "../services/DataService";
import AuthService from "../services/AuthService";
import StorageService from "../services/StorageService";

type CourseScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Course"
>;

interface UseCourseViewModelProps {
  courseId: string;
  navigation: CourseScreenNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface CourseState {
  course: Course | null;
  lessons: Lesson[];
  loading: boolean;
  lessonsProgress: { [key: string]: number };
  menuVisible: boolean;
}

export const useCourseViewModel = ({
  courseId,
  navigation,
}: UseCourseViewModelProps) => {
  const [state, setState] = useState<CourseState>({
    course: null,
    lessons: [],
    loading: true,
    lessonsProgress: {},
    menuVisible: false,
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  /**
   * Carga los datos del curso al montar y cada vez que la pantalla recibe foco
   */
  useEffect(() => {
    loadCourseData();
    const unsubscribe = navigation.addListener("focus", loadCourseData);
    return unsubscribe;
  }, [navigation, courseId]);

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * Carga los datos del curso y el progreso de sus lecciones
   */
  const loadCourseData = async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Obtener el curso
      const courseData = DataService.getCourseById(courseId);

      // Obtener las lecciones del curso
      const courseLessons = DataService.getLessonsByCourse(courseId);

      // Cargar progreso de todas las lecciones
      const progressMap: { [key: string]: number } = {};
      for (const lesson of courseLessons) {
        progressMap[lesson.id] = await DataService.getLessonProgress(
          courseId,
          lesson.id,
        );
      }

      setState((prev) => ({
        ...prev,
        course: courseData || null,
        lessons: courseLessons,
        lessonsProgress: progressMap,
        loading: false,
      }));
    } catch (error) {
      console.error("Error al cargar datos del curso:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Navega al detalle de una lección
   */
  const handleLessonPress = (lesson: Lesson): void => {
    navigation.navigate("LessonDetail", {
      courseId,
      lessonId: lesson.id,
    });
  };

  /**
   * Maneja el cierre de sesión con confirmación
   */
  const handleLogout = (): void => {
    Alert.alert("Cerrar Sesión", "¿Deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          setMenuVisible(false);

          const success = await AuthService.logout();

          if (success) {
            console.log("Sesión cerrada exitosamente");
            StorageService.setCurrentUsername(null);
            navigation.dispatch(
              CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
            );
          } else {
            console.error("Error al cerrar sesión");
            Alert.alert(
              "Error",
              "No se pudo cerrar la sesión. Intenta de nuevo.",
            );
          }
        },
      },
    ]);
  };

  /**
   * Muestra u oculta el menú lateral
   */
  const setMenuVisible = (visible: boolean): void => {
    setState((prev) => ({ ...prev, menuVisible: visible }));
  };

  /**
   * Navega al perfil cerrando el menú
   */
  const handleNavigateToProfile = (): void => {
    setMenuVisible(false);
    navigation.navigate("Profile");
  };

  /**
   * Navega a configuración cerrando el menú
   */
  const handleNavigateToSettings = (): void => {
    setMenuVisible(false);
    navigation.navigate("Settings");
  };

  /**
   * Vuelve a la pantalla anterior
   */
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Traduce la dificultad al español
   */
  const getDifficultyLabel = (difficulty: string): string => {
    switch (difficulty) {
      case "beginner":
        return "Principiante";
      case "intermediate":
        return "Intermedio";
      case "advanced":
        return "Avanzado";
      default:
        return difficulty;
    }
  };

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    course: state.course,
    lessons: state.lessons,
    loading: state.loading,
    lessonsProgress: state.lessonsProgress,
    menuVisible: state.menuVisible,

    // Acciones
    handleLessonPress,
    handleLogout,
    setMenuVisible,
    handleNavigateToProfile,
    handleNavigateToSettings,
    handleGoBack,

    // Helpers
    getDifficultyLabel,
  };
};
