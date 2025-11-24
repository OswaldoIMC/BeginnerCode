/**
 * Servicio para manejar la carga de datos de cursos y lecciones
 */

import { Course, Lesson } from "../../types";

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
   * (Por ahora devuelve 0, lo implementaremos con AsyncStorage después)
   */
  getCompletedLessonsCount(courseId: string): number {
    // TODO: Implementar con AsyncStorage
    return 0;
  }

  /**
   * Calcula el progreso de un curso (0 a 1)
   * (Por ahora devuelve valores aleatorios de ejemplo)
   */
  getCourseProgress(courseId: string): number {
    // TODO: Implementar con AsyncStorage
    // Por ahora devolvemos valores de ejemplo
    const progressMap: { [key: string]: number } = {
      python: 0.15,
      java: 0.0,
      javascript: 0.0,
    };
    return progressMap[courseId] || 0;
  }

  /**
   * Obtiene el progreso de una lección específica (0 a 1)
   */
  getLessonProgress(lessonId: string): number {
    // TODO: Implementar con AsyncStorage
    // Por ahora simulamos progresos diferentes
    const lessons = pythonLessonsData as Lesson[];
    const lessonIndex = lessons.findIndex((l) => l.id === lessonId);

    if (lessonIndex === -1) return 0;

    // Simulamos que las primeras lecciones tienen más progreso
    if (lessonIndex === 0) return 1.0;
    if (lessonIndex === 1) return 0.6;
    if (lessonIndex === 2) return 0.3;

    return Math.random() * 0.5; // Progreso aleatorio para las demás
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new DataService();
