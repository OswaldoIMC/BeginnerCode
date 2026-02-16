/**
 * Servicio de Challenges (Retos)
 */

import { Lesson } from "../../types";
import DataService from "./DataService";
import StorageService from "./StorageService";

interface SaveProgressParams {
  lessonId: string;
  courseId: string;
  correctAnswers: number;
  totalChallenges: number;
}

interface SaveProgressResult {
  success: boolean;
  percentage: number;
  unlockedBadges: string[];
}

class ChallengeService {
  /**
   * Obtiene una lección con sus retos
   */
  async getLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
    try {
      const lesson = DataService.getLessonById(courseId, lessonId);
      return lesson || null;
    } catch (error) {
      console.error("Error al obtener lección:", error);
      return null;
    }
  }

  /**
   * Guarda el progreso de una lección
   */
  async saveLessonProgress(
    params: SaveProgressParams,
  ): Promise<SaveProgressResult> {
    const { lessonId, courseId, correctAnswers, totalChallenges } = params;

    try {
      // Calcular porcentaje
      const percentage = Math.round((correctAnswers / totalChallenges) * 100);

      // Obtener todos los IDs de los retos
      const lesson = await this.getLesson(courseId, lessonId);
      if (!lesson) {
        throw new Error("Lección no encontrada");
      }

      const allChallengesIds = lesson.challenges.map((c) => c.id);

      // Guardar progreso en storage
      await StorageService.saveLessonProgress(
        lessonId,
        courseId,
        allChallengesIds,
        percentage,
        totalChallenges,
      );

      // Actualizar puntos totales
      const totalPoints = correctAnswers * 10;
      await StorageService.updateTotalPoints(totalPoints);

      // Verificar y desbloquear medallas
      const profile = await StorageService.getUserProfile();
      let unlockedBadges: string[] = [];

      if (profile) {
        unlockedBadges = await StorageService.checkAndUnlockBadges(profile);
      }

      return {
        success: true,
        percentage,
        unlockedBadges,
      };
    } catch (error) {
      console.error("Error al guardar progreso:", error);
      return {
        success: false,
        percentage: 0,
        unlockedBadges: [],
      };
    }
  }

  /**
   * Valida si una respuesta es correcta
   */
  validateAnswer(correctAnswerId: string, selectedAnswerId: string): boolean {
    return correctAnswerId === selectedAnswerId;
  }

  /**
   * Calcula el puntaje de una lección
   */
  calculateScore(correctAnswers: number, totalChallenges: number): number {
    if (totalChallenges === 0) return 0;
    return Math.round((correctAnswers / totalChallenges) * 100);
  }

  /**
   * Determina si el usuario aprobó la lección
   */
  hasPassed(percentage: number): boolean {
    return percentage >= 70;
  }

  /**
   * Calcula los puntos ganados
   */
  calculatePoints(
    correctAnswers: number,
    pointsPerQuestion: number = 10,
  ): number {
    return correctAnswers * pointsPerQuestion;
  }
}

// Exportar instancia única (Singleton)
export default new ChallengeService();
