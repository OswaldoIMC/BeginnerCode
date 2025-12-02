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
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/StackNavigator";
import {
  COLORS,
  FONT_SIZES,
  Lesson,
  CodeExample,
  ContentSection,
} from "../../../types";
import DataService from "../../services/DataService";

/**
 * Props de navegación para esta pantalla
 */
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

/**
 * Pantalla de detalle de una lección
 * Muestra el contenido completo, ejemplos de código y permite ir a los retos
 */
const LessonDetailScreen: React.FC<LessonDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { courseId, lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Carga los datos de la lección
   */
  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

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
   * Navega a la pantalla de retos
   */
  const handleStartChallenges = () => {
    if (lesson) {
      navigation.navigate("Challenge", {
        courseId,
        lessonId: lesson.id,
      });
    }
  };

  /**
   * Renderiza una sección de contenido
   */
  const renderContentSection = (section: ContentSection) => (
    <View key={section.id} style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  /**
   * Renderiza un ejemplo de código
   */
  const renderCodeExample = (example: CodeExample) => (
    <View key={example.id} style={styles.codeContainer}>
      <View style={styles.codeHeader}>
        <MaterialIcons name="code" size={20} color={COLORS.primary} />
        <Text style={styles.codeTitle}>{example.title}</Text>
      </View>
      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{example.code}</Text>
      </View>
      <Text style={styles.codeExplanation}>{example.explanation}</Text>
    </View>
  );

  /**
   * Renderiza un punto clave
   */
  const renderKeyPoint = (point: string, index: number) => (
    <View key={index} style={styles.keyPointContainer}>
      <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
      <Text style={styles.keyPointText}>{point}</Text>
    </View>
  );

  // Mostrar loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando lección...</Text>
      </View>
    );
  }

  // Si no hay datos de la lección
  if (!lesson) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>No se pudo cargar la lección</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Lección {lesson.order}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Título de la lección */}
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonDescription}>{lesson.description}</Text>

          {/* Información de la lección */}
          <View style={styles.lessonInfoContainer}>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="access-time"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>{lesson.estimatedMinutes} min</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="quiz" size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {lesson.challenges.length} retos
              </Text>
            </View>
          </View>
        </View>

        {/* Introducción */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>{lesson.content.introduction}</Text>
        </View>

        {/* Secciones de contenido */}
        <View style={styles.sectionsContainer}>
          {lesson.content.sections.map(renderContentSection)}
        </View>

        {/* Ejemplos de código */}
        {lesson.content.codeExamples &&
          lesson.content.codeExamples.length > 0 && (
            <View style={styles.examplesContainer}>
              <Text style={styles.sectionMainTitle}>
                <MaterialIcons name="code" size={24} color={COLORS.primary} />{" "}
                Ejemplos de Código
              </Text>
              {lesson.content.codeExamples.map(renderCodeExample)}
            </View>
          )}

        {/* Puntos clave */}
        <View style={styles.keyPointsContainer}>
          <Text style={styles.sectionMainTitle}>
            <MaterialIcons name="lightbulb" size={24} color={COLORS.primary} />{" "}
            Puntos Clave
          </Text>
          {lesson.content.keyPoints.map(renderKeyPoint)}
        </View>

        {/* Resumen */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionMainTitle}>
            <MaterialIcons name="summarize" size={24} color={COLORS.primary} />{" "}
            Resumen
          </Text>
          <Text style={styles.summaryText}>{lesson.content.summary}</Text>
        </View>

        {/* Botón de retos */}
        <TouchableOpacity
          style={styles.challengeButton}
          onPress={handleStartChallenges}
          activeOpacity={0.8}
        >
          <MaterialIcons name="emoji-events" size={24} color="#fff" />
          <Text style={styles.challengeButtonText}>
            Comenzar Retos ({lesson.challenges.length})
          </Text>
        </TouchableOpacity>

        {/* Espacio al final */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default LessonDetailScreen;

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
  lessonHeader: {
    backgroundColor: COLORS.background,
    padding: 20,
    marginBottom: 20,
  },
  lessonTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  lessonDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 15,
    lineHeight: 24,
  },
  lessonInfoContainer: {
    flexDirection: "row",
    gap: 20,
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
  introContainer: {
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  introText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  sectionsContainer: {
    paddingHorizontal: 15,
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionMainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  examplesContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  codeContainer: {
    marginBottom: 20,
  },
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  codeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
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
  codeExplanation: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
  },
  keyPointsContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  keyPointContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
    paddingLeft: 5,
  },
  keyPointText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  summaryContainer: {
    paddingHorizontal: 15,
    marginBottom: 25,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    backgroundColor: "#FFF9C4",
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#FBC02D",
  },
  challengeButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 15,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 3,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  challengeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
