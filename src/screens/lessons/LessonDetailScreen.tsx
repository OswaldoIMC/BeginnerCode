/**
 * Pantalla de detalle de una lección (MVVM)
 * Muestra el contenido completo, ejemplos de código y permite ir a los retos
 */

import React from "react";
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
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import {
  FONT_SIZES,
  CodeExample,
  ContentSection,
} from "../../../types";
import { useTheme } from "../../context/ThemeContext";
import { useLessonDetailViewModel } from "../../hooks/useLessonDetailViewModel";

// ==========================================
// TIPOS
// ==========================================
type LessonDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "LessonDetail"
>;
type LessonDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "LessonDetail"
>;

interface LessonDetailScreenProps {
  route: LessonDetailScreenRouteProp;
  navigation: LessonDetailScreenNavigationProp;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { courseId, lessonId } = route.params;
  const { theme, isDarkMode } = useTheme();

  // ViewModel
  const viewModel = useLessonDetailViewModel({
    courseId,
    lessonId,
    navigation,
  });

  /** Sección de contenido */
  const renderContentSection = (section: ContentSection) => (
    <View key={section.id} style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: theme.primary }]}>
        {section.title}
      </Text>
      <Text style={[styles.sectionContent, { color: theme.text }]}>
        {section.content}
      </Text>
    </View>
  );

  /** Ejemplo de código */
  const renderCodeExample = (example: CodeExample) => (
    <View key={example.id} style={styles.codeContainer}>
      <View style={styles.codeHeader}>
        <MaterialIcons name="code" size={20} color={theme.primary} />
        <Text style={[styles.codeTitle, { color: theme.text }]}>
          {example.title}
        </Text>
      </View>

      {/* Bloque de código (NO SE MODIFICA COLOR MANUAL) */}
      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{example.code}</Text>
      </View>

      <Text style={[styles.codeExplanation, { color: theme.textSecondary }]}>
        {example.explanation}
      </Text>
    </View>
  );

  /** Punto clave */
  const renderKeyPoint = (point: string, index: number) => (
    <View key={index} style={styles.keyPointContainer}>
      <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
      <Text style={[styles.keyPointText, { color: theme.text }]}>{point}</Text>
    </View>
  );

  // Loading
  if (viewModel.loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando lección...
        </Text>
      </View>
    );
  }

  // No data
  if (!viewModel.lesson) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.surface }]}
      >
        <MaterialIcons name="error-outline" size={50} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>
          No se pudo cargar la lección
        </Text>

        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.primary }]}
          onPress={viewModel.handleGoBack}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const lesson = viewModel.lesson;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.surface }]}
      edges={["top", "bottom"]}
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

        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          Lección {lesson.order}
        </Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header de la lección */}
        <View style={[styles.lessonHeader, { backgroundColor: theme.card }]}>
          <Text style={[styles.lessonTitle, { color: theme.text }]}>
            {lesson.title}
          </Text>

          <Text
            style={[styles.lessonDescription, { color: theme.textSecondary }]}
          >
            {lesson.description}
          </Text>

          <View style={styles.lessonInfoContainer}>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="access-time"
                size={18}
                color={theme.primary}
              />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {lesson.estimatedMinutes} min
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="quiz" size={18} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {lesson.challenges.length} retos
              </Text>
            </View>
          </View>
        </View>

        {/* Introducción */}
        <View style={styles.introContainer}>
          <Text style={[styles.introText, { color: theme.text }]}>
            {lesson.content.introduction}
          </Text>
        </View>

        {/* Secciones */}
        <View style={styles.sectionsContainer}>
          {lesson.content.sections.map(renderContentSection)}
        </View>

        {/* Ejemplos de código */}
        {lesson.content.codeExamples &&
          lesson.content.codeExamples.length > 0 && (
            <View style={styles.examplesContainer}>
              <Text style={[styles.sectionMainTitle, { color: theme.text }]}>
                <MaterialIcons name="code" size={24} color={theme.primary} />{" "}
                Ejemplos de Código
              </Text>

              {lesson.content.codeExamples.map(renderCodeExample)}
            </View>
          )}

        {/* Puntos clave */}
        <View style={styles.keyPointsContainer}>
          <Text style={[styles.sectionMainTitle, { color: theme.text }]}>
            <MaterialIcons name="lightbulb" size={24} color={theme.primary} />{" "}
            Puntos Clave
          </Text>

          {lesson.content.keyPoints.map(renderKeyPoint)}
        </View>

        {/* Resumen */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.sectionMainTitle, { color: theme.text }]}>
            <MaterialIcons name="summarize" size={24} color={theme.primary} />{" "}
            Resumen
          </Text>

          <Text style={styles.summaryText}>{lesson.content.summary}</Text>
        </View>

        {/* Botón de retos */}
        <TouchableOpacity
          style={[styles.challengeButton, { backgroundColor: theme.primary }]}
          onPress={viewModel.handleStartChallenges}
          activeOpacity={0.8}
        >
          <MaterialIcons name="emoji-events" size={24} color="#fff" />
          <Text style={styles.challengeButtonText}>
            Comenzar Retos ({lesson.challenges.length})
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default LessonDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: FONT_SIZES.medium },
  errorText: { marginTop: 10, fontSize: FONT_SIZES.medium, marginBottom: 20 },

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
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },

  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 20 },

  lessonHeader: {
    padding: 20,
    marginBottom: 20,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  lessonDescription: {
    fontSize: 16,
    marginBottom: 15,
    lineHeight: 24,
  },
  lessonInfoContainer: {
    flexDirection: "row",
    gap: 20,
  },
  infoItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  infoText: { fontSize: FONT_SIZES.small, fontWeight: "500" },

  introContainer: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  introText: { fontSize: 15, lineHeight: 22 },

  sectionsContainer: { paddingHorizontal: 15 },
  sectionContainer: { marginBottom: 25 },
  sectionMainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  sectionContent: { fontSize: 15, lineHeight: 24 },

  examplesContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  codeContainer: { marginBottom: 20 },
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  codeTitle: { fontSize: 16, fontWeight: "600" },

  codeBlock: {
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#D4D4D4",
    lineHeight: 20,
  },
  codeExplanation: { fontSize: 14, fontStyle: "italic", lineHeight: 20 },

  keyPointsContainer: { paddingHorizontal: 15, marginBottom: 20 },
  keyPointContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  keyPointText: { fontSize: 15, flex: 1, lineHeight: 22 },

  summaryContainer: { paddingHorizontal: 15, marginBottom: 25 },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    backgroundColor: "#FFF9C4",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FBC02D",
  },

  challengeButton: {
    marginHorizontal: 15,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 3,
  },
  challengeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
