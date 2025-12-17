/**
 * Servicio para manejar la carga de datos de cursos y lecciones
 */

import { Course, Lesson } from "../../types";
import StorageService from "./StorageService";

// Importar los datos JSON
import pythonCourseData from "../../data/courses/python.json";
import pythonLessonsData from "../../data/lessons/python_lessons.json";
import javaCourseData from "../../data/courses/java.json";
import javaLessonsData from "../../data/lessons/java_lessons.json";
import jsCourseData from "../../data/courses/js.json";
import jsLessonsData from "../../data/lessons/js_lessons.json";
import csharpCourseData from "../../data/courses/csharp.json";
import csharpLessonsData from "../../data/lessons/csharp_lessons.json";
import cppCourseData from "../../data/courses/cpp.json";
import cppLessonsData from "../../data/lessons/cpp_lessons.json";

/**
 * Servicio de datos
 * Maneja la obtención de cursos, lecciones y retos
 */
class DataService {
  // Mapeo de lecciones por curso
  private lessonsByCourse: Record<string, Lesson[]> = {
    python: pythonLessonsData as Lesson[],
    java: javaLessonsData as Lesson[],
    javascript: jsLessonsData as Lesson[],
    csharp: csharpLessonsData as Lesson[],
    cpp: cppLessonsData as Lesson[],
  };

  /**
   * Obtiene todos los cursos disponibles
   */
  getCourses(): Course[] {
    return [
      {
        ...(pythonCourseData as Course),
        icon: require("../../assets/python.png"),
      },
      {
        ...(javaCourseData as Course),
        icon: require("../../assets/java.png"),
      },
      {
        ...(jsCourseData as Course),
        icon: require("../../assets/js.png"),
      },
      {
        ...(csharpCourseData as Course),
        icon: require("../../assets/c-sharp.png"),
      },
      {
        ...(cppCourseData as Course),
        icon: require("../../assets/c-.png"),
      },
    ];
  }

  /**
   * Obtiene un curso por su ID
   */
  getCourseById(courseId: string): Course | undefined {
    const courses = this.getCourses();
    return courses.find(
      (course) => course.id.toLowerCase() === courseId.toLowerCase()
    );
  }

  /**
   * Obtiene todas las lecciones de un curso
   */
  getLessonsByCourse(courseId: string): Lesson[] {
    return this.lessonsByCourse[courseId.toLowerCase()] || [];
  }

  /**
   * Obtiene una lección específica por su ID y curso
   */
  getLessonById(courseId: string, lessonId: string): Lesson | undefined {
    const lessons = this.getLessonsByCourse(courseId);
    return lessons.find((lesson) => lesson.id === lessonId);
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
    // Inicializar el curso si no existe
    await StorageService.initializeCourseProgress(courseId);

    const courseProgress = await StorageService.getCourseProgress(courseId);
    return courseProgress ? courseProgress.progressPercentage : 0;
  }

  /**
   * Obtiene el progreso de una lección específica (0 a 1)
   */
  async getLessonProgress(courseId: string, lessonId: string): Promise<number> {
    const lessonProgress = await StorageService.getLessonProgress(lessonId);

    if (!lessonProgress) return 0;
    if (lessonProgress.completed) return 1.0;

    // Buscar la lección usando el courseId
    const lesson = this.getLessonById(courseId, lessonId);
    if (!lesson) return 0;

    const totalChallenges = lesson.challenges.length;
    const completedChallenges = lessonProgress.challengesCompleted.length;

    return completedChallenges / totalChallenges;
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new DataService();
