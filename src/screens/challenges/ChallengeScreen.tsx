import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConnectivityIndicator from "../../components/ConnectivityIndicator";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import { FONT_SIZES, Lesson, Challenge, ChallengeOption } from "../../../types";
import DataService from "../../services/DataService";
import StorageService from "../../services/StorageService";
import * as Progress from "react-native-progress";
import { useTheme } from "../../context/ThemeContext";

/**
 * Props de navegación para esta pantalla
 */
type ChallengeScreenRouteProp = RouteProp<RootStackParamList, "Challenge">;
type ChallengeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Challenge"
>;

interface ChallengeScreenProps {
  route: ChallengeScreenRouteProp;
  navigation: ChallengeScreenNavigationProp;
}

/**
 * Pantalla de retos/desafíos
 * Muestra las preguntas una por una y permite al usuario responderlas
 */
const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  route,
  navigation,
}) => {
  const { courseId, lessonId } = route.params;

  /** THEME */
  const { theme, isDarkMode } = useTheme();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  /**
   * Carga los datos de la lección
   */
  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  /**
   * Animación de entrada
   */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentChallengeIndex]);

  /**
   * Función para cargar los datos de la lección
   */
  const loadLessonData = () => {
    try {
      setLoading(true);
      const lessonData = DataService.getLessonById(courseId, lessonId);
      setLesson(lessonData || null);
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar la lección:", error);
      setLoading(false);
    }
  };

  /**
   * Maneja la selección de una opción
   */
  const handleSelectOption = (optionId: string) => {
    if (!isAnswered) setSelectedOption(optionId);
  };

  /**
   * Confirma la respuesta seleccionada
   */
  const handleConfirmAnswer = () => {
    if (!selectedOption || !lesson) return;

    const currentChallenge = lesson.challenges[currentChallengeIndex];
    const isCorrect = selectedOption === currentChallenge.correctAnswerId;

    setIsAnswered(true);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  /**
   * Avanza al siguiente reto
   */
  const handleNextChallenge = () => {
    if (!lesson) return;

    // Resetear animación
    fadeAnim.setValue(0);

    if (currentChallengeIndex < lesson.challenges.length - 1) {
      setCurrentChallengeIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);

      // Animar entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Guardar progreso antes de mostrar resultados
      saveProgress();
      setShowResults(true);
    }
  };

  /**
   * Guarda el progreso de la lección
   */
  const saveProgress = async () => {
    if (!lesson) return;

    try {
      const percentage = Math.round(
        (correctAnswers / lesson.challenges.length) * 100
      );
      const allChallengesIds = lesson.challenges.map((c) => c.id);

      // Guardar progreso
      await StorageService.saveLessonProgress(
        lesson.id,
        lesson.courseId,
        allChallengesIds,
        percentage,
        lesson.challenges.length
      );

      const totalPoints = correctAnswers * 10;
      await StorageService.updateTotalPoints(totalPoints);

      // Verificar y desbloquear medallas
      const profile = await StorageService.getUserProfile();
      if (profile) {
        const unlockedBadges = await StorageService.checkAndUnlockBadges(
          profile
        );

        if (unlockedBadges.length > 0) {
          // Mostrar notificación de medallas desbloqueadas
          setTimeout(() => {
            Alert.alert(
              "¡Nueva Medalla! 🏆",
              `Has desbloqueado ${unlockedBadges.length} medalla(s) nueva(s)`,
              [{ text: "¡Genial!" }]
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error al guardar progreso:", error);
    }
  };

  /**
   * Reinicia los retos
   */
  const handleRetry = () => {
    setCurrentChallengeIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setShowResults(false);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleFinish = () => navigation.goBack();

  /** COLORES DE OPCIONES (hardcodeados los correctos e incorrectos) */
  const getOptionColor = (
    option: ChallengeOption,
    challenge: Challenge
  ): string => {
    if (!isAnswered) return theme.card;

    if (option.id === challenge.correctAnswerId) return "#4CAF50";
    if (selectedOption === option.id) return "#F44336";

    return theme.card;
  };

  /**
   * Obtiene el icono de una opción
   */
  const getOptionIcon = (option: ChallengeOption, challenge: Challenge) => {
    if (!isAnswered) {
      return selectedOption === option.id
        ? "radio-button-checked"
        : "radio-button-unchecked";
    }

    if (option.id === challenge.correctAnswerId) return "check-circle";
    if (selectedOption === option.id) return "cancel";

    return "radio-button-unchecked";
  };

  // Mostrar loading
  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando retos...
        </Text>
      </View>
    );
  }

  if (!lesson || lesson.challenges.length === 0) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <MaterialIcons name="error-outline" size={50} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>
          No hay retos disponibles
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

  const currentChallenge = lesson.challenges[currentChallengeIndex];
  const progress = (currentChallengeIndex + 1) / lesson.challenges.length;

  // Modal de resultados finales
  if (showResults) {
    const percentage = Math.round(
      (correctAnswers / lesson.challenges.length) * 100
    );
    const passed = percentage >= 70;

    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.surface }]}
      >
        <StatusBar
          backgroundColor={theme.primary}
          barStyle={isDarkMode ? "light-content" : "dark-content"}
        />

        <ConnectivityIndicator />

        <View style={styles.resultsContainer}>
          <MaterialIcons
            name={passed ? "emoji-events" : "sentiment-dissatisfied"}
            size={100}
            color={passed ? "#FFD700" : theme.textSecondary}
          />

          <Text style={[styles.resultsTitle, { color: theme.text }]}>
            {passed ? "¡Felicidades!" : "Sigue Intentando"}
          </Text>

          <Text
            style={[styles.resultsSubtitle, { color: theme.textSecondary }]}
          >
            Has completado los retos
          </Text>

          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
              Tu puntuación
            </Text>

            <Text
              style={[
                styles.scoreValue,
                { color: passed ? "#4CAF50" : "#FF9800" },
              ]}
            >
              {correctAnswers} / {lesson.challenges.length}
            </Text>

            <Text
              style={[styles.scorePercentage, { color: theme.textSecondary }]}
            >
              {percentage}%
            </Text>
          </View>

          {/* Estadísticas */}
          <View style={styles.resultsStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="check-circle" size={30} color="#4CAF50" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {correctAnswers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Correctas
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="cancel" size={30} color="#F44336" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {lesson.challenges.length - correctAnswers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Incorrectas
              </Text>
            </View>
          </View>

          {!passed && (
            <View style={styles.encouragementContainer}>
              <Text style={[styles.encouragementText, { color: theme.text }]}>
                Necesitas al menos 70% para aprobar. ¡Puedes intentarlo de
                nuevo!
              </Text>
            </View>
          )}

          <View style={styles.resultsButtons}>
            <TouchableOpacity
              style={[styles.resultButton, styles.retryButton]}
              onPress={handleRetry}
            >
              <MaterialIcons name="refresh" size={24} color="#fff" />
              <Text style={styles.resultButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: theme.primary }]}
              onPress={handleFinish}
            >
              <MaterialIcons name="check" size={24} color="#fff" />
              <Text style={styles.resultButtonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
      <View
        style={[
          styles.headerBar,
          { backgroundColor: theme.primary, shadowColor: theme.text },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerProgress}>
          <Text style={styles.headerProgressText}>
            {currentChallengeIndex + 1} / {lesson.challenges.length}
          </Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {/* Barra de progreso */}
      <View
        style={[styles.progressContainer, { backgroundColor: theme.surface }]}
      >
        <Progress.Bar
          progress={progress}
          width={null}
          color="#4CAF50"
          unfilledColor="#E0E0E0"
          borderWidth={0}
          height={8}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Tipo */}
          <View style={styles.typeContainer}>
            <MaterialIcons name="quiz" size={20} color={theme.primary} />
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>
              {currentChallenge.type === "multiple-choice"
                ? "Opción Múltiple"
                : currentChallenge.type === "true-false"
                ? "Verdadero o Falso"
                : "Completar Código"}
            </Text>
          </View>

          {/* Pregunta */}
          <View
            style={[
              styles.questionContainer,
              {
                backgroundColor: theme.background,
                borderLeftColor: theme.primary,
              },
            ]}
          >
            <Text style={[styles.questionText, { color: theme.text }]}>
              {currentChallenge.question}
            </Text>
          </View>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
            {currentChallenge.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: getOptionColor(option, currentChallenge),
                    borderColor:
                      selectedOption === option.id && !isAnswered
                        ? theme.primary
                        : "transparent",
                    borderWidth:
                      selectedOption === option.id && !isAnswered ? 2 : 0,
                  },
                ]}
                onPress={() => handleSelectOption(option.id)}
                disabled={isAnswered}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={getOptionIcon(option, currentChallenge)}
                  size={24}
                  color={
                    isAnswered &&
                    (option.id === currentChallenge.correctAnswerId ||
                      selectedOption === option.id)
                      ? "#fff"
                      : theme.primary
                  }
                />

                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        isAnswered &&
                        (option.id === currentChallenge.correctAnswerId ||
                          selectedOption === option.id)
                          ? "#fff"
                          : theme.text,
                    },
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Explicación */}
          {isAnswered && (
            <View
              style={[
                styles.explanationContainer,
                {
                  backgroundColor: "#E3F2FD",
                  borderLeftColor: "#2196F3",
                },
              ]}
            >
              <View style={styles.explanationHeader}>
                <MaterialIcons
                  name={
                    selectedOption === currentChallenge.correctAnswerId
                      ? "check-circle"
                      : "info"
                  }
                  size={24}
                  color={
                    selectedOption === currentChallenge.correctAnswerId
                      ? "#4CAF50"
                      : "#2196F3"
                  }
                />
                <Text style={[styles.explanationTitle, { color: theme.text }]}>
                  {selectedOption === currentChallenge.correctAnswerId
                    ? "¡Correcto!"
                    : "Explicación"}
                </Text>
              </View>

              <Text style={[styles.explanationText, { color: theme.text }]}>
                {currentChallenge.explanation}
              </Text>

              {selectedOption === currentChallenge.correctAnswerId && (
                <View style={styles.pointsContainer}>
                  <MaterialIcons name="stars" size={20} color="#FFD700" />
                  <Text style={styles.pointsText}>
                    +{currentChallenge.points} puntos
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Botón */}
      <View
        style={[styles.buttonContainer, { backgroundColor: theme.surface }]}
      >
        {!isAnswered ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.primary,
                opacity: selectedOption ? 1 : 0.5,
              },
            ]}
            onPress={handleConfirmAnswer}
            disabled={!selectedOption}
          >
            <Text style={styles.actionButtonText}>Confirmar respuesta</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.nextButton]}
            onPress={handleNextChallenge}
          >
            <Text style={styles.actionButtonText}>
              {currentChallengeIndex < lesson.challenges.length - 1
                ? "Siguiente pregunta"
                : "Ver Resultados"}
            </Text>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ChallengeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, fontSize: FONT_SIZES.medium },
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
  headerProgress: { flex: 1, alignItems: "center" },
  headerProgressText: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: "#fff",
  },

  progressContainer: { paddingHorizontal: 20, paddingVertical: 10 },

  scrollView: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100 },

  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  typeText: {
    fontSize: FONT_SIZES.small,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  questionContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 25,
    borderLeftWidth: 4,
  },
  questionText: { fontSize: 20, fontWeight: "600", lineHeight: 28 },

  optionsContainer: { gap: 12 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 18,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionText: { fontSize: 16, flex: 1, lineHeight: 22 },

  explanationContainer: {
    padding: 20,
    borderRadius: 12,
    marginTop: 25,
    borderLeftWidth: 4,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  explanationTitle: { fontSize: 18, fontWeight: "bold" },
  explanationText: { fontSize: 15, lineHeight: 22 },

  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  pointsText: { fontSize: 16, fontWeight: "bold", color: "#FF9800" },

  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },

  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  nextButton: { backgroundColor: "#4CAF50" },
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  resultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  resultsTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  resultsSubtitle: { fontSize: 16, marginBottom: 30 },

  scoreContainer: { alignItems: "center", marginBottom: 40 },
  scoreLabel: { fontSize: 16, marginBottom: 10 },
  scoreValue: { fontSize: 48, fontWeight: "bold" },
  scorePercentage: { fontSize: 24, marginTop: 5 },

  resultsStats: { flexDirection: "row", gap: 40, marginBottom: 30 },
  statItem: { alignItems: "center", gap: 8 },
  statValue: { fontSize: 28, fontWeight: "bold" },
  statLabel: { fontSize: 14 },

  encouragementContainer: {
    backgroundColor: "#FFF3E0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  encouragementText: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  resultsButtons: { width: "100%", gap: 12 },
  resultButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
  },
  retryButton: { backgroundColor: "#FF9800" },
  resultButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
