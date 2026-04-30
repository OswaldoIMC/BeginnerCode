/**
 * Servicio de Almacenamiento con SQLite
 * Alternativa tecnológica a AsyncStorage
 */

import * as SQLite from "expo-sqlite";
import {
  UserProfile,
  CourseProgress,
  LessonProgress,
  Badge,
} from "../../types";

/**
 * Interface para un usuario registrado en SQLite
 */
export interface SQLiteRegisteredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  security_question: string;
  security_answer: string;
  created_at: string;
}

/**
 * Servicio SQLite
 * Maneja la persistencia de datos del usuario usando una base de datos SQLite
 */
class SQLiteStorageService {
  private db: SQLite.SQLiteDatabase | null = null;
  private currentUsername: string | null = null;
  private isInitialized: boolean = false;

  // ==========================================
  // INICIALIZACIÓN DE LA BASE DE DATOS
  // ==========================================

  /**
   * Inicializa la base de datos y crea las tablas si no existen
   */
  async initDatabase(): Promise<boolean> {
    try {
      // Abrir o crear la base de datos
      this.db = await SQLite.openDatabaseAsync("beginnercode.db");

      // Crear las tablas usando transacciones
      await this.db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        -- Tabla de usuarios registrados
        CREATE TABLE IF NOT EXISTS registered_users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          security_question TEXT NOT NULL,
          security_answer TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        -- Tabla de perfiles de usuario
        CREATE TABLE IF NOT EXISTS user_profiles (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          total_points INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          joined_at TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabla de progreso de cursos
        CREATE TABLE IF NOT EXISTS course_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          course_id TEXT NOT NULL,
          completed_lessons TEXT DEFAULT '[]',
          total_points INTEGER DEFAULT 0,
          started_at TEXT NOT NULL,
          last_accessed_at TEXT NOT NULL,
          progress_percentage REAL DEFAULT 0,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(username, course_id),
          FOREIGN KEY (username) REFERENCES user_profiles(username) ON DELETE CASCADE
        );

        -- Tabla de progreso de lecciones
        CREATE TABLE IF NOT EXISTS lesson_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          lesson_id TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          completed_at TEXT,
          challenges_completed TEXT DEFAULT '[]',
          score INTEGER DEFAULT 0,
          attempts INTEGER DEFAULT 0,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(username, lesson_id),
          FOREIGN KEY (username) REFERENCES user_profiles(username) ON DELETE CASCADE
        );

        -- Tabla de medallas/badges
        CREATE TABLE IF NOT EXISTS badges (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          badge_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          is_unlocked INTEGER DEFAULT 0,
          earned_at TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(username, badge_id),
          FOREIGN KEY (username) REFERENCES user_profiles(username) ON DELETE CASCADE
        );

        -- Índices para mejorar rendimiento en búsquedas
        CREATE INDEX IF NOT EXISTS idx_course_progress_username ON course_progress(username);
        CREATE INDEX IF NOT EXISTS idx_lesson_progress_username ON lesson_progress(username);
        CREATE INDEX IF NOT EXISTS idx_badges_username ON badges(username);
      `);

      this.isInitialized = true;
      console.log("Base de datos SQLite inicializada correctamente");
      return true;
    } catch (error) {
      console.error("Error al inicializar base de datos SQLite:", error);
      return false;
    }
  }

  /**
   * Obtiene la instancia de la base de datos, inicializándola si es necesario
   */
  private async getDB(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db || !this.isInitialized) {
      await this.initDatabase();
    }
    return this.db!;
  }

  /**
   * Establece el usuario actual
   */
  setCurrentUsername(username: string | null): void {
    this.currentUsername = username;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUsername(): string | null {
    return this.currentUsername;
  }

  // ==========================================
  // PERFIL DE USUARIO (CREATE / READ / UPDATE)
  // ==========================================

  /**
   * Crea un perfil inicial para un nuevo usuario
   * Operación: INSERT
   */
  async createInitialProfile(username: string): Promise<UserProfile> {
    const db = await this.getDB();
    this.setCurrentUsername(username);

    const id = Date.now().toString();
    const joinedAt = new Date().toISOString();

    // Insertar perfil del usuario
    await db.runAsync(
      `INSERT OR IGNORE INTO user_profiles (id, username, total_points, level, joined_at, updated_at) 
       VALUES (?, ?, 0, 1, ?, ?)`,
      [id, username, joinedAt, joinedAt]
    );

    // Insertar medallas iniciales
    const initialBadges = this.getInitialBadges();
    for (const badge of initialBadges) {
      await db.runAsync(
        `INSERT OR IGNORE INTO badges (username, badge_id, name, description, icon, is_unlocked) 
         VALUES (?, ?, ?, ?, ?, 0)`,
        [username, badge.id, badge.name, badge.description, badge.icon]
      );
    }

    console.log(`Perfil SQLite creado para: ${username}`);

    // Retornar el perfil completo
    return {
      id,
      username,
      coursesProgress: [],
      lessonsProgress: [],
      badges: initialBadges,
      totalPoints: 0,
      level: 1,
      joinedAt,
    };
  }

  /**
   * Obtiene el perfil completo del usuario
   * Operación: SELECT con JOIN
   */
  async getUserProfile(username?: string): Promise<UserProfile | null> {
    try {
      const db = await this.getDB();
      const user = username || this.currentUsername;

      if (!user) {
        console.error("No hay usuario actual establecido");
        return null;
      }

      // 1. Obtener datos del perfil
      const profileRow = await db.getFirstAsync<{
        id: string;
        username: string;
        total_points: number;
        level: number;
        joined_at: string;
      }>("SELECT * FROM user_profiles WHERE username = ?", [user]);

      if (!profileRow) return null;

      // 2. Obtener progreso de cursos
      const courseRows = await db.getAllAsync<{
        course_id: string;
        completed_lessons: string;
        total_points: number;
        started_at: string;
        last_accessed_at: string;
        progress_percentage: number;
      }>("SELECT * FROM course_progress WHERE username = ?", [user]);

      const coursesProgress: CourseProgress[] = courseRows.map((row) => ({
        courseId: row.course_id,
        completedLessons: JSON.parse(row.completed_lessons),
        totalPoints: row.total_points,
        startedAt: row.started_at,
        lastAccessedAt: row.last_accessed_at,
        progressPercentage: row.progress_percentage,
      }));

      // 3. Obtener progreso de lecciones
      const lessonRows = await db.getAllAsync<{
        lesson_id: string;
        completed: number;
        completed_at: string | null;
        challenges_completed: string;
        score: number;
        attempts: number;
      }>("SELECT * FROM lesson_progress WHERE username = ?", [user]);

      const lessonsProgress: LessonProgress[] = lessonRows.map((row) => ({
        lessonId: row.lesson_id,
        completed: row.completed === 1,
        completedAt: row.completed_at || undefined,
        challengesCompleted: JSON.parse(row.challenges_completed),
        score: row.score,
        attempts: row.attempts,
      }));

      // 4. Obtener medallas
      const badgeRows = await db.getAllAsync<{
        badge_id: string;
        name: string;
        description: string;
        icon: string;
        is_unlocked: number;
        earned_at: string | null;
      }>("SELECT * FROM badges WHERE username = ?", [user]);

      const badges: Badge[] = badgeRows.map((row) => ({
        id: row.badge_id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        isUnlocked: row.is_unlocked === 1,
        earnedAt: row.earned_at || undefined,
      }));

      return {
        id: profileRow.id,
        username: profileRow.username,
        coursesProgress,
        lessonsProgress,
        badges,
        totalPoints: profileRow.total_points,
        level: profileRow.level,
        joinedAt: profileRow.joined_at,
      };
    } catch (error) {
      console.error("Error al obtener perfil SQLite:", error);
      return null;
    }
  }

  /**
   * Actualiza los puntos totales del usuario
   * Operación: UPDATE
   */
  async updateTotalPoints(points: number): Promise<boolean> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return false;

      await db.runAsync(
        `UPDATE user_profiles 
         SET total_points = total_points + ?, 
             level = CAST((total_points + ?) / 100 AS INTEGER) + 1,
             updated_at = ? 
         WHERE username = ?`,
        [points, points, new Date().toISOString(), this.currentUsername]
      );

      console.log(`Puntos actualizados: +${points}`);
      return true;
    } catch (error) {
      console.error("Error al actualizar puntos:", error);
      return false;
    }
  }

  // ==========================================
  // PROGRESO DE CURSOS
  // ==========================================

  /**
   * Inicializa el progreso de un curso
   * Operación: INSERT OR IGNORE
   */
  async initializeCourseProgress(courseId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return false;

      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT OR IGNORE INTO course_progress 
         (username, course_id, completed_lessons, total_points, started_at, last_accessed_at, progress_percentage) 
         VALUES (?, ?, '[]', 0, ?, ?, 0)`,
        [this.currentUsername, courseId, now, now]
      );

      return true;
    } catch (error) {
      console.error("Error al inicializar progreso del curso:", error);
      return false;
    }
  }

  /**
   * Obtiene el progreso de un curso específico
   * Operación: SELECT con WHERE
   */
  async getCourseProgress(courseId: string): Promise<CourseProgress | null> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return null;

      const row = await db.getFirstAsync<{
        course_id: string;
        completed_lessons: string;
        total_points: number;
        started_at: string;
        last_accessed_at: string;
        progress_percentage: number;
      }>(
        "SELECT * FROM course_progress WHERE username = ? AND course_id = ?",
        [this.currentUsername, courseId]
      );

      if (!row) return null;

      return {
        courseId: row.course_id,
        completedLessons: JSON.parse(row.completed_lessons),
        totalPoints: row.total_points,
        startedAt: row.started_at,
        lastAccessedAt: row.last_accessed_at,
        progressPercentage: row.progress_percentage,
      };
    } catch (error) {
      console.error("Error al obtener progreso del curso:", error);
      return null;
    }
  }

  // ==========================================
  // PROGRESO DE LECCIONES
  // ==========================================

  /**
   * Guarda o actualiza el progreso de una lección
   * Operación: INSERT OR REPLACE (UPSERT)
   */
  async saveLessonProgress(
    lessonId: string,
    courseId: string,
    challengesCompleted: string[],
    score: number,
    totalChallenges: number
  ): Promise<boolean> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return false;

      const completed =
        challengesCompleted.length === totalChallenges && score >= 70;
      const completedAt = completed ? new Date().toISOString() : null;
      const now = new Date().toISOString();

      // Obtener intentos previos
      const existing = await db.getFirstAsync<{ attempts: number }>(
        "SELECT attempts FROM lesson_progress WHERE username = ? AND lesson_id = ?",
        [this.currentUsername, lessonId]
      );
      const attempts = existing ? existing.attempts + 1 : 1;

      // UPSERT del progreso de lección
      await db.runAsync(
        `INSERT OR REPLACE INTO lesson_progress 
         (username, lesson_id, completed, completed_at, challenges_completed, score, attempts, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.currentUsername,
          lessonId,
          completed ? 1 : 0,
          completedAt,
          JSON.stringify(challengesCompleted),
          score,
          attempts,
          now,
        ]
      );

      // Si completó la lección, actualizar progreso del curso
      if (completed) {
        const courseRow = await db.getFirstAsync<{
          completed_lessons: string;
        }>(
          "SELECT completed_lessons FROM course_progress WHERE username = ? AND course_id = ?",
          [this.currentUsername, courseId]
        );

        if (courseRow) {
          const completedLessons: string[] = JSON.parse(
            courseRow.completed_lessons
          );
          if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);

            const totalLessons = 20;
            const progressPercentage = completedLessons.length / totalLessons;

            await db.runAsync(
              `UPDATE course_progress 
               SET completed_lessons = ?, progress_percentage = ?, updated_at = ?
               WHERE username = ? AND course_id = ?`,
              [
                JSON.stringify(completedLessons),
                progressPercentage,
                now,
                this.currentUsername,
                courseId,
              ]
            );
          }
        }
      }

      console.log(`Progreso de lección guardado: ${lessonId} (score: ${score})`);
      return true;
    } catch (error) {
      console.error("Error al guardar progreso de lección:", error);
      return false;
    }
  }

  /**
   * Obtiene el progreso de una lección
   * Operación: SELECT
   */
  async getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return null;

      const row = await db.getFirstAsync<{
        lesson_id: string;
        completed: number;
        completed_at: string | null;
        challenges_completed: string;
        score: number;
        attempts: number;
      }>(
        "SELECT * FROM lesson_progress WHERE username = ? AND lesson_id = ?",
        [this.currentUsername, lessonId]
      );

      if (!row) return null;

      return {
        lessonId: row.lesson_id,
        completed: row.completed === 1,
        completedAt: row.completed_at || undefined,
        challengesCompleted: JSON.parse(row.challenges_completed),
        score: row.score,
        attempts: row.attempts,
      };
    } catch (error) {
      console.error("Error al obtener progreso de lección:", error);
      return null;
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
   * Operación: UPDATE
   */
  async unlockBadge(badgeId: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return false;

      const now = new Date().toISOString();
      const result = await db.runAsync(
        `UPDATE badges SET is_unlocked = 1, earned_at = ?, updated_at = ? 
         WHERE username = ? AND badge_id = ? AND is_unlocked = 0`,
        [now, now, this.currentUsername, badgeId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error("Error al desbloquear medalla:", error);
      return false;
    }
  }

  // ==========================================
  // ESTADÍSTICAS (Consultas SQL avanzadas)
  // ==========================================

  async getUserStats(): Promise<{
    totalLessonsCompleted: number;
    totalPoints: number;
    level: number;
    badgesUnlocked: number;
    coursesStarted: number;
    averageScore: number;
  } | null> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return null;

      // Consulta SQL que calcula todas las estadísticas en una sola operación
      const profileStats = await db.getFirstAsync<{
        total_points: number;
        level: number;
      }>("SELECT total_points, level FROM user_profiles WHERE username = ?", [
        this.currentUsername,
      ]);

      if (!profileStats) return null;

      // Lecciones completadas y promedio de puntuación
      const lessonStats = await db.getFirstAsync<{
        completed_count: number;
        avg_score: number;
      }>(
        `SELECT 
          COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_count,
          COALESCE(AVG(CASE WHEN score > 0 THEN score END), 0) as avg_score
         FROM lesson_progress 
         WHERE username = ?`,
        [this.currentUsername]
      );

      // Medallas desbloqueadas
      const badgeStats = await db.getFirstAsync<{ unlocked_count: number }>(
        `SELECT COUNT(*) as unlocked_count FROM badges 
         WHERE username = ? AND is_unlocked = 1`,
        [this.currentUsername]
      );

      // Cursos iniciados
      const courseStats = await db.getFirstAsync<{ started_count: number }>(
        `SELECT COUNT(*) as started_count FROM course_progress 
         WHERE username = ?`,
        [this.currentUsername]
      );

      return {
        totalLessonsCompleted: lessonStats?.completed_count ?? 0,
        totalPoints: profileStats.total_points,
        level: profileStats.level,
        badgesUnlocked: badgeStats?.unlocked_count ?? 0,
        coursesStarted: courseStats?.started_count ?? 0,
        averageScore: Math.round(lessonStats?.avg_score ?? 0),
      };
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      return null;
    }
  }

  // ==========================================
  // LIMPIEZA DE DATOS
  // ==========================================

  async clearAllData(): Promise<boolean> {
    try {
      const db = await this.getDB();
      if (!this.currentUsername) return false;

      // se eliminan automáticamente: course_progress, lesson_progress, badges
      await db.runAsync("DELETE FROM user_profiles WHERE username = ?", [
        this.currentUsername,
      ]);

      console.log(
        `Todos los datos eliminados para: ${this.currentUsername}`
      );
      return true;
    } catch (error) {
      console.error("Error al eliminar datos:", error);
      return false;
    }
  }

  // ==========================================
  // USUARIOS REGISTRADOS
  // ==========================================

  /**
   * Guarda un usuario registrado en SQLite
   * Se llama desde AuthService al registrar un usuario real
   */
  async saveRegisteredUser(user: {
    id: string;
    username: string;
    email: string;
    password: string;
    securityQuestion: string;
    securityAnswer: string;
    createdAt: string;
  }): Promise<boolean> {
    try {
      const db = await this.getDB();
      await db.runAsync(
        `INSERT OR IGNORE INTO registered_users (id, username, email, password, security_question, security_answer, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.username,
          user.email,
          user.password,
          user.securityQuestion,
          user.securityAnswer,
          user.createdAt,
        ]
      );
      console.log(`[SQLite] Usuario registrado: ${user.username}`);
      return true;
    } catch (error) {
      console.error("[SQLite] Error al guardar usuario registrado:", error);
      return false;
    }
  }

  /**
   * Elimina un usuario registrado de SQLite
   */
  async deleteRegisteredUser(username: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      await db.runAsync(
        "DELETE FROM registered_users WHERE username = ?",
        [username]
      );
      console.log(`[SQLite] Usuario eliminado: ${username}`);
      return true;
    } catch (error) {
      console.error("[SQLite] Error al eliminar usuario:", error);
      return false;
    }
  }

  // ==========================================
  // CONSULTAR BASE DE DATOS
  // ==========================================

  /**
   * Obtiene información sobre las tablas de la base de datos
   */
  async getTableInfo(): Promise<
    { tableName: string; rowCount: number }[]
  > {
    try {
      const db = await this.getDB();
      const tables = [
        "registered_users",
        "user_profiles",
        "course_progress",
        "lesson_progress",
        "badges",
      ];

      const info: { tableName: string; rowCount: number }[] = [];

      for (const table of tables) {
        const result = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        info.push({
          tableName: table,
          rowCount: result?.count ?? 0,
        });
      }

      return info;
    } catch (error) {
      console.error("Error al obtener info de tablas:", error);
      return [];
    }
  }

  /**
   * Obtiene todos los registros de una tabla (para el visor)
   * Retorna los datos como array de objetos genéricos
   */
  async getAllRows(tableName: string): Promise<Record<string, any>[]> {
    try {
      const db = await this.getDB();
      // Validar nombre de tabla para evitar SQL injection
      const validTables = [
        "registered_users",
        "user_profiles",
        "course_progress",
        "lesson_progress",
        "badges",
      ];
      if (!validTables.includes(tableName)) return [];

      const rows = await db.getAllAsync<Record<string, any>>(
        `SELECT * FROM ${tableName} ORDER BY rowid DESC`
      );
      return rows;
    } catch (error) {
      console.error(`Error al leer tabla ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Cierra la conexión a la base de datos
   */
  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log("Base de datos SQLite cerrada");
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new SQLiteStorageService();
