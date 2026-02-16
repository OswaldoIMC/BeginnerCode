/**
 * Pantalla de Challenges (REFACTORIZADA)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Animated,
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
import { useChallengeViewModel } from "../../hooks/useChallengeViewModel";

// ==========================================
// TIPOS
// ==========================================
type ChallengeScreenRouteProp = RouteProp<RootStackParamList, "Challenge">;
type ChallengeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Challenge"
>;

interface ChallengeScreenProps {
  route: ChallengeScreenRouteProp;
  navigation: ChallengeScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  route,
  navigation,
}) => {
  const { courseId, lessonId } = route.params;
  const { theme, isDarkMode } = useTheme();

  // ViewModel
  const viewModel = useChallengeViewModel({ courseId, lessonId });

  // ==========================================
  // RENDERIZADO CONDICIONAL
  // ==========================================

  // Loading
  if (viewModel.loading) {
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

  // Error - No hay lección
  if (!viewModel.lesson || viewModel.lesson.challenges.length === 0) {
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

  // Pantalla de resultados
  if (viewModel.showResults) {
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
            name={viewModel.passed ? "emoji-events" : "sentiment-dissatisfied"}
            size={100}
            color={viewModel.passed ? "#FFD700" : theme.textSecondary}
          />

          <Text style={[styles.resultsTitle, { color: theme.text }]}>
            {viewModel.passed ? "¡Felicidades!" : "Sigue Intentando"}
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
                { color: viewModel.passed ? "#4CAF50" : "#FF9800" },
              ]}
            >
              {viewModel.correctAnswers} / {viewModel.lesson.challenges.length}
            </Text>
            <Text
              style={[styles.scorePercentage, { color: theme.textSecondary }]}
            >
              {viewModel.percentage}%
            </Text>
          </View>

          {/* Estadísticas */}
          <View style={styles.resultsStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="check-circle" size={30} color="#4CAF50" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {viewModel.correctAnswers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Correctas
              </Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="cancel" size={30} color="#F44336" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {viewModel.lesson.challenges.length - viewModel.correctAnswers}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Incorrectas
              </Text>
            </View>
          </View>

          {!viewModel.passed && (
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
              onPress={viewModel.retry}
            >
              <MaterialIcons name="refresh" size={24} color="#fff" />
              <Text style={styles.resultButtonText}>Intentar de nuevo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="check" size={24} color="#fff" />
              <Text style={styles.resultButtonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla principal de retos
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
            {viewModel.currentChallengeIndex + 1} /{" "}
            {viewModel.lesson.challenges.length}
          </Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {/* Barra de progreso */}
      <View
        style={[styles.progressContainer, { backgroundColor: theme.surface }]}
      >
        <Progress.Bar
          progress={viewModel.progress}
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
        <Animated.View style={{ opacity: viewModel.fadeAnim }}>
          {/* Tipo de pregunta */}
          <View style={styles.typeContainer}>
            <MaterialIcons name="quiz" size={20} color={theme.primary} />
            <Text style={[styles.typeText, { color: theme.textSecondary }]}>
              {viewModel.currentChallenge?.type === "multiple-choice"
                ? "Opción Múltiple"
                : viewModel.currentChallenge?.type === "true-false"
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
              {viewModel.currentChallenge?.question}
            </Text>
          </View>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
            {viewModel.currentChallenge?.options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: viewModel.getOptionColor(
                      option,
                      viewModel.currentChallenge!,
                      theme.card,
                    ),
                    borderColor:
                      viewModel.selectedOption === option.id &&
                      !viewModel.isAnswered
                        ? theme.primary
                        : "transparent",
                    borderWidth:
                      viewModel.selectedOption === option.id &&
                      !viewModel.isAnswered
                        ? 2
                        : 0,
                  },
                ]}
                onPress={() => viewModel.selectOption(option.id)}
                disabled={viewModel.isAnswered}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={
                    viewModel.getOptionIcon(
                      option,
                      viewModel.currentChallenge!,
                    ) as any
                  }
                  size={24}
                  color={
                    viewModel.isAnswered &&
                    (option.id ===
                      viewModel.currentChallenge!.correctAnswerId ||
                      viewModel.selectedOption === option.id)
                      ? "#fff"
                      : theme.primary
                  }
                />

                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        viewModel.isAnswered &&
                        (option.id ===
                          viewModel.currentChallenge!.correctAnswerId ||
                          viewModel.selectedOption === option.id)
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
          {viewModel.isAnswered && viewModel.currentChallenge && (
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
                    viewModel.selectedOption ===
                    viewModel.currentChallenge.correctAnswerId
                      ? "check-circle"
                      : "info"
                  }
                  size={24}
                  color={
                    viewModel.selectedOption ===
                    viewModel.currentChallenge.correctAnswerId
                      ? "#4CAF50"
                      : "#2196F3"
                  }
                />
                <Text style={[styles.explanationTitle, { color: theme.text }]}>
                  {viewModel.selectedOption ===
                  viewModel.currentChallenge.correctAnswerId
                    ? "¡Correcto!"
                    : "Explicación"}
                </Text>
              </View>

              <Text style={[styles.explanationText, { color: theme.text }]}>
                {viewModel.currentChallenge.explanation}
              </Text>

              {viewModel.selectedOption ===
                viewModel.currentChallenge.correctAnswerId && (
                <View style={styles.pointsContainer}>
                  <MaterialIcons name="stars" size={20} color="#FFD700" />
                  <Text style={styles.pointsText}>
                    +{viewModel.currentChallenge.points} puntos
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Botón de acción */}
      <View
        style={[styles.buttonContainer, { backgroundColor: theme.surface }]}
      >
        {!viewModel.isAnswered ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.primary,
                opacity: viewModel.selectedOption ? 1 : 0.5,
              },
            ]}
            onPress={viewModel.confirmAnswer}
            disabled={!viewModel.selectedOption}
          >
            <Text style={styles.actionButtonText}>Confirmar respuesta</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.nextButton]}
            onPress={viewModel.nextChallenge}
          >
            <Text style={styles.actionButtonText}>
              {viewModel.currentChallengeIndex <
              viewModel.lesson.challenges.length - 1
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
