/**
 * Servicio de Base de Datos SQLite
 * Maneja la inicialización, creación de tablas y operaciones CRUD
 * Reemplaza AsyncStorage para datos de negocio (perfiles, progreso, medallas)
 */

import * as SQLite from "expo-sqlite";

// Nombre de la base de datos local
const DATABASE_NAME = "BeginnerCode.db";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Inicializa la base de datos y crea las tablas si no existen
   * Debe llamarse al arrancar la app (en App.tsx)
   */
  async init(): Promise<void> {
    try {
      // expo-sqlite v14+ usa openDatabaseAsync
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      // Habilitar WAL mode para mejor rendimiento
      await this.db.execAsync("PRAGMA journal_mode = WAL;");

      // Crear tablas
      await this.createTables();

      console.log("Base de datos SQLite inicializada correctamente");
    } catch (error) {
      console.error("Error al inicializar la base de datos:", error);
      throw error;
    }
  }

  /**
   * Obtiene la instancia de la base de datos
   * Lanza error si no se ha inicializado
   */
  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error(
        "La base de datos no ha sido inicializada. Llama a DatabaseService.init() primero."
      );
    }
    return this.db;
  }

  /**
   * Crea las tablas necesarias si no existen
   */
  private async createTables(): Promise<void> {
    const db = this.getDatabase();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        avatar_url TEXT,
        total_points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        joined_at TEXT NOT NULL,
        updated_at TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS course_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        course_id TEXT NOT NULL,
        completed_lessons TEXT DEFAULT '[]',
        total_points INTEGER DEFAULT 0,
        started_at TEXT NOT NULL,
        last_accessed_at TEXT NOT NULL,
        progress_percentage REAL DEFAULT 0,
        updated_at TEXT,
        UNIQUE(username, course_id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        challenges_completed TEXT DEFAULT '[]',
        score INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        updated_at TEXT,
        UNIQUE(username, lesson_id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        badge_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        is_unlocked INTEGER DEFAULT 0,
        earned_at TEXT,
        updated_at TEXT,
        UNIQUE(username, badge_id)
      );
    `);

    console.log("Tablas SQLite creadas/verificadas correctamente");
  }

  /**
   * Cierra la conexión a la base de datos
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log("Base de datos cerrada");
    }
  }

  /**
   * Elimina toda la base de datos (para desarrollo/testing)
   */
  async deleteDatabase(): Promise<void> {
    await this.close();
    await SQLite.deleteDatabaseAsync(DATABASE_NAME);
    console.log("Base de datos eliminada");
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new DatabaseService();
