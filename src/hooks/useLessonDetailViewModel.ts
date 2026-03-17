/**
 * ViewModel para la pantalla de LessonDetail
 * Maneja la carga de datos de la lección y navegación a retos
 */

import { useState, useEffect } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/StackNavigator";
import { Lesson } from "../../types";
import DataService from "../services/DataService";

type LessonDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LessonDetail"
>;

interface UseLessonDetailViewModelProps {
  courseId: string;
  lessonId: string;
  navigation: LessonDetailNavigationProp;
}

// ==========================================
// ESTADO
// ==========================================
interface LessonDetailState {
  lesson: Lesson | null;
  loading: boolean;
}

export const useLessonDetailViewModel = ({
  courseId,
  lessonId,
  navigation,
}: UseLessonDetailViewModelProps) => {
  const [state, setState] = useState<LessonDetailState>({
    lesson: null,
    loading: true,
  });

  // ==========================================
  // EFECTOS
  // ==========================================

  /**
   * Carga los datos de la lección al montar
   */
  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * Carga los datos de la lección desde el servicio
   */
  const loadLessonData = (): void => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const lessonData = DataService.getLessonById(courseId, lessonId);
      setState((prev) => ({
        ...prev,
        lesson: lessonData || null,
        loading: false,
      }));
    } catch (error) {
      console.error("Error al cargar la lección:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Navega a la pantalla de retos
   */
  const handleStartChallenges = (): void => {
    if (state.lesson) {
      navigation.navigate("Challenge", {
        courseId,
        lessonId: state.lesson.id,
      });
    }
  };

  /**
   * Vuelve a la pantalla anterior
   */
  const handleGoBack = (): void => {
    navigation.goBack();
  };

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    lesson: state.lesson,
    loading: state.loading,

    // Acciones
    handleStartChallenges,
    handleGoBack,
  };
};
