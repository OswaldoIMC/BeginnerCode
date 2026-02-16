/**
 * ViewModel para la pantalla de Challenges
 */

import { useState, useEffect } from "react";
import { Animated, Alert } from "react-native";
import { Lesson, Challenge, ChallengeOption } from "../../types";
import ChallengeService from "../services/ChallengeService";

interface UseChallengeViewModelProps {
  courseId: string;
  lessonId: string;
}

interface ChallengeState {
  lesson: Lesson | null;
  loading: boolean;
  currentChallengeIndex: number;
  selectedOption: string | null;
  isAnswered: boolean;
  correctAnswers: number;
  showResults: boolean;
}

export const useChallengeViewModel = ({
  courseId,
  lessonId,
}: UseChallengeViewModelProps) => {
  // ==========================================
  // ESTADO
  // ==========================================
  const [state, setState] = useState<ChallengeState>({
    lesson: null,
    loading: true,
    currentChallengeIndex: 0,
    selectedOption: null,
    isAnswered: false,
    correctAnswers: 0,
    showResults: false,
  });

  const [fadeAnim] = useState(new Animated.Value(0));

  // ==========================================
  // EFECTOS
  // ==========================================

  /**
   * Cargar datos de la lección al montar
   */
  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  /**
   * Animación al cambiar de pregunta
   */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [state.currentChallengeIndex]);

  // ==========================================
  // LÓGICA DE NEGOCIO
  // ==========================================

  /**
   * Carga los datos de la lección desde el servicio
   */
  const loadLessonData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const lessonData = await ChallengeService.getLesson(courseId, lessonId);

      setState((prev) => ({
        ...prev,
        lesson: lessonData,
        loading: false,
      }));
    } catch (error) {
      console.error("Error al cargar la lección:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  /**
   * Maneja la selección de una opción
   */
  const selectOption = (optionId: string) => {
    if (!state.isAnswered) {
      setState((prev) => ({ ...prev, selectedOption: optionId }));
    }
  };

  /**
   * Confirma la respuesta y valida si es correcta
   */
  const confirmAnswer = () => {
    if (!state.selectedOption || !state.lesson) return;

    const currentChallenge = getCurrentChallenge();
    if (!currentChallenge) return;

    const isCorrect = state.selectedOption === currentChallenge.correctAnswerId;

    setState((prev) => ({
      ...prev,
      isAnswered: true,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
    }));
  };

  /**
   * Avanza al siguiente reto o muestra resultados
   */
  const nextChallenge = async () => {
    if (!state.lesson) return;

    // Reset animación
    fadeAnim.setValue(0);

    const isLastChallenge =
      state.currentChallengeIndex >= state.lesson.challenges.length - 1;

    if (!isLastChallenge) {
      // Avanzar a la siguiente pregunta
      setState((prev) => ({
        ...prev,
        currentChallengeIndex: prev.currentChallengeIndex + 1,
        selectedOption: null,
        isAnswered: false,
      }));

      // Animar entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Guardar progreso y mostrar resultados
      await saveProgress();
      setState((prev) => ({ ...prev, showResults: true }));
    }
  };

  /**
   * Guarda el progreso de la lección
   */
  const saveProgress = async () => {
    if (!state.lesson) return;

    try {
      const result = await ChallengeService.saveLessonProgress({
        lessonId: state.lesson.id,
        courseId: state.lesson.courseId,
        correctAnswers: state.correctAnswers,
        totalChallenges: state.lesson.challenges.length,
      });

      // Mostrar notificación de medallas si las hay
      if (result.unlockedBadges && result.unlockedBadges.length > 0) {
        setTimeout(() => {
          Alert.alert(
            "¡Nueva Medalla! 🏆",
            `Has desbloqueado ${result.unlockedBadges.length} medalla(s) nueva(s)`,
            [{ text: "¡Genial!" }],
          );
        }, 1000);
      }
    } catch (error) {
      console.error("Error al guardar progreso:", error);
    }
  };

  /**
   * Reinicia los retos
   */
  const retry = () => {
    setState({
      ...state,
      currentChallengeIndex: 0,
      selectedOption: null,
      isAnswered: false,
      correctAnswers: 0,
      showResults: false,
    });

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // ==========================================
  // HELPERS
  // ==========================================

  /**
   * Obtiene el reto actual
   */
  const getCurrentChallenge = (): Challenge | null => {
    if (!state.lesson) return null;
    return state.lesson.challenges[state.currentChallengeIndex] || null;
  };

  /**
   * Calcula el progreso actual (0 a 1)
   */
  const getProgress = (): number => {
    if (!state.lesson) return 0;
    return (state.currentChallengeIndex + 1) / state.lesson.challenges.length;
  };

  /**
   * Obtiene el color de una opción según su estado
   */
  const getOptionColor = (
    option: ChallengeOption,
    challenge: Challenge,
    cardColor: string,
  ): string => {
    if (!state.isAnswered) return cardColor;
    if (option.id === challenge.correctAnswerId) return "#4CAF50";
    if (state.selectedOption === option.id) return "#F44336";
    return cardColor;
  };

  /**
   * Obtiene el icono de una opción según su estado
   */
  const getOptionIcon = (
    option: ChallengeOption,
    challenge: Challenge,
  ): string => {
    if (!state.isAnswered) {
      return state.selectedOption === option.id
        ? "radio-button-checked"
        : "radio-button-unchecked";
    }
    if (option.id === challenge.correctAnswerId) return "check-circle";
    if (state.selectedOption === option.id) return "cancel";
    return "radio-button-unchecked";
  };

  /**
   * Calcula el porcentaje de respuestas correctas
   */
  const getPercentage = (): number => {
    if (!state.lesson) return 0;
    return Math.round(
      (state.correctAnswers / state.lesson.challenges.length) * 100,
    );
  };

  /**
   * Verifica si el usuario aprobó
   */
  const hasPassed = (): boolean => {
    return getPercentage() >= 70;
  };

  // ==========================================
  // INTERFACE PÚBLICA
  // ==========================================
  return {
    // Estado
    ...state,
    fadeAnim,

    // Datos computados
    currentChallenge: getCurrentChallenge(),
    progress: getProgress(),
    percentage: getPercentage(),
    passed: hasPassed(),

    // Acciones
    selectOption,
    confirmAnswer,
    nextChallenge,
    retry,

    // Helpers
    getOptionColor,
    getOptionIcon,
  };
};
