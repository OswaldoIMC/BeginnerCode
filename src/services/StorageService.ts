/**
 * Servicio para manejar el almacenamiento persistente del progreso del usuario
 * Utiliza AsyncStorage para guardar datos localmente
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  UserProfile,
  CourseProgress,
  LessonProgress,
  Badge,
} from "../../types";

// Keys para AsyncStorage
const STORAGE_KEYS = {
  USER_PROFILE: "@BeginnerCode:userProfile",
  COURSE_PROGRESS: "@BeginnerCode:courseProgress",
  LESSON_PROGRESS: "@BeginnerCode:lessonProgress",
  BADGES: "@BeginnerCode:badges",
};

/**
 * Servicio de almacenamiento
 * Maneja la persistencia de datos del usuario
 */
class StorageService {
  // ==========================================
  // PERFIL DE USUARIO
  // ==========================================

  /**
   * Obtiene el perfil completo del usuario
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error al obtener perfil de usuario:", error);
      return null;
    }
  }

  /**
   * Guarda el perfil del usuario
   */
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
      return true;
    } catch (error) {
      console.error("Error al guardar perfil de usuario:", error);
      return false;
    }
  }

  /**
   * Crea un perfil inicial para un nuevo usuario
   */
  async createInitialProfile(username: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: Date.now().toString(),
      username,
      coursesProgress: [],
      lessonsProgress: [],
      badges: this.getInitialBadges(),
      totalPoints: 0,
      level: 1,
      joinedAt: new Date().toISOString(),
    };

    await this.saveUserProfile(profile);
    return profile;
  }

  /**
   * Actualiza los puntos totales del usuario
   */
  async updateTotalPoints(points: number): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      profile.totalPoints += points;
      profile.level = this.calculateLevel(profile.totalPoints);

      return await this.saveUserProfile(profile);
    } catch (error) {
      console.error("Error al actualizar puntos:", error);
      return false;
    }
  }

  // ==========================================
  // PROGRESO DE CURSOS
  // ==========================================

  /**
   * Obtiene el progreso de un curso específico
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      return (
        profile.coursesProgress.find((cp) => cp.courseId === courseId) || null
      );
    } catch (error) {
      console.error("Error al obtener progreso del curso:", error);
      return null;
    }
  }

  /**
   * Inicializa el progreso de un curso
   */
  async initializeCourseProgress(courseId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      // Verificar si ya existe progreso para este curso
      const existingProgress = profile.coursesProgress.find(
        (cp) => cp.courseId === courseId
      );
      if (existingProgress) return true;

      // Crear nuevo progreso
      const newProgress: CourseProgress = {
        courseId,
        completedLessons: [],
        totalPoints: 0,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        progressPercentage: 0,
      };

      profile.coursesProgress.push(newProgress);
      return await this.saveUserProfile(profile);
    } catch (error) {
      console.error("Error al inicializar progreso del curso:", error);
      return false;
    }
  }

  /**
   * Actualiza la última vez que se accedió a un curso
   */
  async updateCourseLastAccessed(courseId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      const courseProgress = profile.coursesProgress.find(
        (cp) => cp.courseId === courseId
      );
      if (courseProgress) {
        courseProgress.lastAccessedAt = new Date().toISOString();
        return await this.saveUserProfile(profile);
      }
      return false;
    } catch (error) {
      console.error("Error al actualizar último acceso:", error);
      return false;
    }
  }

  // ==========================================
  // PROGRESO DE LECCIONES
  // ==========================================

  /**
   * Obtiene el progreso de una lección específica
   */
  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      return (
        profile.lessonsProgress.find((lp) => lp.lessonId === lessonId) || null
      );
    } catch (error) {
      console.error("Error al obtener progreso de lección:", error);
      return null;
    }
  }

  /**
   * Guarda o actualiza el progreso de una lección
   */
  async saveLessonProgress(
    lessonId: string,
    courseId: string,
    challengesCompleted: string[],
    score: number,
    totalChallenges: number
  ): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      // Buscar si ya existe progreso para esta lección
      const existingIndex = profile.lessonsProgress.findIndex(
        (lp) => lp.lessonId === lessonId
      );

      const completed =
        challengesCompleted.length === totalChallenges && score >= 70;

      const lessonProgress: LessonProgress = {
        lessonId,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
        challengesCompleted,
        score,
        attempts:
          existingIndex >= 0
            ? profile.lessonsProgress[existingIndex].attempts + 1
            : 1,
      };

      if (existingIndex >= 0) {
        // Actualizar progreso existente
        profile.lessonsProgress[existingIndex] = lessonProgress;
      } else {
        // Añadir nuevo progreso
        profile.lessonsProgress.push(lessonProgress);
      }

      // Si completó la lección, añadirla a completedLessons del curso
      const courseProgress = profile.coursesProgress.find(
        (cp) => cp.courseId === courseId
      );
      if (completed && courseProgress) {
        if (!courseProgress.completedLessons.includes(lessonId)) {
          courseProgress.completedLessons.push(lessonId);
          console.log(
            `Lección ${lessonId} añadida a completadas. Total: ${courseProgress.completedLessons.length}`
          );
        }
      }

      // Actualizar progreso del curso
      await this.updateCourseProgressPercentage(courseId, profile);

      const saved = await this.saveUserProfile(profile);
      console.log(`Progreso guardado: ${saved}`);
      return saved;
    } catch (error) {
      console.error("Error al guardar progreso de lección:", error);
      return false;
    }
  }

  /**
   * Actualiza el porcentaje de progreso de un curso
   */
  private async updateCourseProgressPercentage(
    courseId: string,
    profile: UserProfile
  ): Promise<void> {
    const courseProgress = profile.coursesProgress.find(
      (cp) => cp.courseId === courseId
    );
    if (!courseProgress) return;

    const completedLessons = courseProgress.completedLessons.length;

    // Obtener el total de lecciones del curso desde los datos
    let totalLessons = 20; // Por defecto Python tiene 20 lecciones

    // Podrías mejorar esto importando DataService, pero por ahora es estático
    if (courseId === "python") {
      totalLessons = 20;
    }

    courseProgress.progressPercentage =
      totalLessons > 0 ? completedLessons / totalLessons : 0;
    courseProgress.totalPoints = profile.lessonsProgress
      .filter((lp) => lp.completed)
      .reduce((sum, lp) => sum + lp.score, 0);

    console.log(
      `Progreso del curso ${courseId}: ${completedLessons}/${totalLessons} = ${courseProgress.progressPercentage}`
    );
  }

  /**
   * Marca una lección como vista (sin completar necesariamente)
   */
  async markLessonAsViewed(lessonId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      const existingProgress = profile.lessonsProgress.find(
        (lp) => lp.lessonId === lessonId
      );
      if (!existingProgress) {
        // Crear progreso inicial si no existe
        profile.lessonsProgress.push({
          lessonId,
          completed: false,
          challengesCompleted: [],
          score: 0,
          attempts: 0,
        });
        return await this.saveUserProfile(profile);
      }

      return true;
    } catch (error) {
      console.error("Error al marcar lección como vista:", error);
      return false;
    }
  }

  // ==========================================
  // MEDALLAS Y LOGROS
  // ==========================================

  /**
   * Obtiene las medallas iniciales
   */
  private getInitialBadges(): Badge[] {
    return [
      {
        id: "first_lesson",
        name: "Primera Lección",
        description: "Completa tu primera lección",
        icon: "🎓",
        isUnlocked: false,
      },
      {
        id: "perfect_score",
        name: "Puntuación Perfecta",
        description: "Obtén 100% en un reto",
        icon: "💯",
        isUnlocked: false,
      },
      {
        id: "five_lessons",
        name: "5 Lecciones",
        description: "Completa 5 lecciones",
        icon: "⭐",
        isUnlocked: false,
      },
      {
        id: "course_complete",
        name: "Curso Completado",
        description: "Completa un curso completo",
        icon: "🏆",
        isUnlocked: false,
      },
      {
        id: "persistent_learner",
        name: "Estudiante Persistente",
        description: "Completa lecciones 7 días seguidos",
        icon: "🔥",
        isUnlocked: false,
      },
    ];
  }

  /**
   * Desbloquea una medalla
   */
  async unlockBadge(badgeId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return false;

      const badge = profile.badges.find((b) => b.id === badgeId);
      if (badge && !badge.isUnlocked) {
        badge.isUnlocked = true;
        badge.earnedAt = new Date().toISOString();
        return await this.saveUserProfile(profile);
      }

      return false;
    } catch (error) {
      console.error("Error al desbloquear medalla:", error);
      return false;
    }
  }

  /**
   * Verifica y desbloquea medallas basadas en el progreso
   */
  async checkAndUnlockBadges(profile: UserProfile): Promise<string[]> {
    const unlockedBadges: string[] = [];

    try {
      // Primera Lección
      const completedLessons = profile.lessonsProgress.filter(
        (lp) => lp.completed
      ).length;
      if (
        completedLessons >= 1 &&
        !profile.badges.find((b) => b.id === "first_lesson")?.isUnlocked
      ) {
        await this.unlockBadge("first_lesson");
        unlockedBadges.push("first_lesson");
      }

      // 5 Lecciones
      if (
        completedLessons >= 5 &&
        !profile.badges.find((b) => b.id === "five_lessons")?.isUnlocked
      ) {
        await this.unlockBadge("five_lessons");
        unlockedBadges.push("five_lessons");
      }

      // Puntuación Perfecta
      const hasPerfectScore = profile.lessonsProgress.some(
        (lp) => lp.score === 100
      );
      if (
        hasPerfectScore &&
        !profile.badges.find((b) => b.id === "perfect_score")?.isUnlocked
      ) {
        await this.unlockBadge("perfect_score");
        unlockedBadges.push("perfect_score");
      }

      return unlockedBadges;
    } catch (error) {
      console.error("Error al verificar medallas:", error);
      return unlockedBadges;
    }
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  /**
   * Calcula el nivel basado en los puntos totales
   */
  private calculateLevel(totalPoints: number): number {
    // Cada nivel requiere 100 puntos más que el anterior
    return Math.floor(totalPoints / 100) + 1;
  }

  /**
   * Limpia todos los datos (útil para testing o reset)
   */
  async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.COURSE_PROGRESS,
        STORAGE_KEYS.LESSON_PROGRESS,
        STORAGE_KEYS.BADGES,
      ]);
      return true;
    } catch (error) {
      console.error("Error al limpiar datos:", error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas generales del usuario
   */
  async getUserStats(): Promise<{
    totalLessonsCompleted: number;
    totalPoints: number;
    level: number;
    badgesUnlocked: number;
    coursesStarted: number;
  } | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      return {
        totalLessonsCompleted: profile.lessonsProgress.filter(
          (lp) => lp.completed
        ).length,
        totalPoints: profile.totalPoints,
        level: profile.level,
        badgesUnlocked: profile.badges.filter((b) => b.isUnlocked).length,
        coursesStarted: profile.coursesProgress.length,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return null;
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new StorageService();
