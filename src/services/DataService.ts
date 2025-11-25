/**
 * Servicio para manejar la carga de datos de cursos y lecciones
 */

import { Course, Lesson } from "../../types";
import StorageService from "./StorageService";

// Importar los datos JSON
import pythonCourseData from "../../data/courses/python.json";
import pythonLessonsData from "../../data/lessons/python_lessons.json";

/**
 * Servicio de datos
 * Maneja la obtención de cursos, lecciones y retos
 */
class DataService {
  /**
   * Obtiene todos los cursos disponibles
   */
  getCourses(): Course[] {
    return [
      {
        ...(pythonCourseData as Course),
        icon: require("../../assets/python.png"),
      },
      // Aquí puedes añadir más cursos cuando los crees
    ];
  }

  /**
   * Obtiene un curso por su ID
   */
  getCourseById(courseId: string): Course | undefined {
    const courses = this.getCourses();
    return courses.find((course) => course.id === courseId);
  }

  /**
   * Obtiene todas las lecciones de un curso
   */
  getLessonsByCourse(courseId: string): Lesson[] {
    if (courseId === "python") {
      return pythonLessonsData as Lesson[];
    }
    // Aquí añadirías más casos para otros cursos
    return [];
  }

  /**
   * Obtiene una lección específica por su ID
   */
  getLessonById(lessonId: string): Lesson | undefined {
    // Por ahora solo tenemos Python, pero esto escala fácilmente
    const allLessons = pythonLessonsData as Lesson[];
    return allLessons.find((lesson) => lesson.id === lessonId);
  }

  /**
   * Obtiene el número de lecciones completadas de un curso
   */
  async getCompletedLessonsCount(courseId: string): Promise<number> {
    const courseProgress = await StorageService.getCourseProgress(courseId);
    return courseProgress ? courseProgress.completedLessons.length : 0;
  }

  /**
   * Calcula el progreso de un curso (0 a 1)
   */
  async getCourseProgress(courseId: string): Promise<number> {
    const courseProgress = await StorageService.getCourseProgress(courseId);
    return courseProgress ? courseProgress.progressPercentage : 0;
  }

  /**
   * Obtiene el progreso de una lección específica (0 a 1)
   */
  async getLessonProgress(lessonId: string): Promise<number> {
    const lessonProgress = await StorageService.getLessonProgress(lessonId);

    if (!lessonProgress) return 0;
    if (lessonProgress.completed) return 1.0;

    // Calcular progreso basado en retos completados
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return 0;

    const totalChallenges = lesson.challenges.length;
    const completedChallenges = lessonProgress.challengesCompleted.length;

    return completedChallenges / totalChallenges;
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new DataService();
