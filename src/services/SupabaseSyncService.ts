/**
 * Servicio de Sincronización con Supabase
 * Maneja la sincronización bidireccional entre AsyncStorage y Supabase
 * Implementa estrategia offline-first
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import NetInfo from "@react-native-community/netinfo";
import StorageService from "./StorageService";
import { UserProfile } from "../../types";

// Configuración de Supabase
const SUPABASE_URL = "https://otrwowwyzgczspclzcwl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cndvd3d5emdjenNwY2x6Y3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDk4MDUsImV4cCI6MjA4MDc4NTgwNX0.2D7sYYrjhLUKpDpM5sO0ORdvJm7QLq5HLW7OHsqhaos";

// Keys para AsyncStorage
const SYNC_KEYS = {
  LAST_SYNC: "@BeginnerCode:lastSync",
  PENDING_CHANGES: "@BeginnerCode:pendingChanges",
  SYNC_ENABLED: "@BeginnerCode:syncEnabled",
};

/**
 * Interface para cambios pendientes
 */
interface PendingChange {
  id: string;
  type: "profile" | "course_progress" | "lesson_progress" | "badge";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: string;
}

class SupabaseSyncService {
  private supabase;
  private isOnline: boolean = false;
  private isSyncing: boolean = false;

  constructor() {
    // Inicializar cliente de Supabase
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    // Monitorear conectividad
    this.setupConnectivityListener();
  }

  // ==========================================
  // CONECTIVIDAD
  // ==========================================

  /**
   * Configura el listener de conectividad
   */
  private setupConnectivityListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log(
        `Estado de conexión: ${this.isOnline ? "Online" : "Offline"}`
      );

      // Si acabamos de conectarnos, intentar sincronizar
      if (wasOffline && this.isOnline) {
        console.log("Conexión restaurada, iniciando sincronización...");
        this.syncPendingChanges();
      }
    });
  }

  /**
   * Verifica si hay conexión a internet
   */
  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  // ==========================================
  // GESTIÓN DE CAMBIOS PENDIENTES
  // ==========================================

  /**
   * Obtiene los cambios pendientes de sincronización
   */
  private async getPendingChanges(): Promise<PendingChange[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_KEYS.PENDING_CHANGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al obtener cambios pendientes:", error);
      return [];
    }
  }

  /**
   * Guarda un cambio pendiente para sincronizar más tarde
   */
  private async addPendingChange(
    change: Omit<PendingChange, "id" | "timestamp">
  ): Promise<void> {
    try {
      const pendingChanges = await this.getPendingChanges();

      const newChange: PendingChange = {
        ...change,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      pendingChanges.push(newChange);
      await AsyncStorage.setItem(
        SYNC_KEYS.PENDING_CHANGES,
        JSON.stringify(pendingChanges)
      );

      console.log(
        `Cambio pendiente guardado: ${change.type} - ${change.action}`
      );
    } catch (error) {
      console.error("Error al guardar cambio pendiente:", error);
    }
  }

  /**
   * Elimina un cambio pendiente después de sincronizarlo
   */
  private async removePendingChange(changeId: string): Promise<void> {
    try {
      const pendingChanges = await this.getPendingChanges();
      const filteredChanges = pendingChanges.filter((c) => c.id !== changeId);
      await AsyncStorage.setItem(
        SYNC_KEYS.PENDING_CHANGES,
        JSON.stringify(filteredChanges)
      );
    } catch (error) {
      console.error("Error al eliminar cambio pendiente:", error);
    }
  }

  // ==========================================
  // SINCRONIZACIÓN
  // ==========================================

  /**
   * Sincroniza el perfil del usuario con Supabase
   */
  async syncUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      // Si no hay conexión, guardar como cambio pendiente
      if (!this.isOnline) {
        await this.addPendingChange({
          type: "profile",
          action: "update",
          data: profile,
        });
        console.log("Sin conexión, cambio guardado para sincronizar después");
        return true;
      }

      // Verificar si el perfil ya existe en Supabase
      const { data: existingProfile, error: selectError } = await this.supabase
        .from("user_profiles")
        .select("*")
        .eq("username", profile.username)
        .maybeSingle();

      if (selectError) {
        console.error("Error al verificar perfil existente:", selectError);
        throw selectError;
      }

      if (existingProfile) {
        // Actualizar perfil existente
        const { error } = await this.supabase
          .from("user_profiles")
          .update({
            total_points: profile.totalPoints,
            level: profile.level,
            updated_at: new Date().toISOString(),
          })
          .eq("username", profile.username);

        if (error) throw error;
        console.log("Perfil actualizado en Supabase");
      } else {
        // Crear nuevo perfil con upsert para evitar duplicados
        const { error } = await this.supabase.from("user_profiles").upsert(
          {
            username: profile.username,
            total_points: profile.totalPoints,
            level: profile.level,
            joined_at: profile.joinedAt,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "username",
            ignoreDuplicates: false,
          }
        );

        if (error) throw error;
        console.log("Perfil creado/actualizado en Supabase");
      }

      // Sincronizar progreso de cursos
      await this.syncCourseProgress(profile);

      // Sincronizar progreso de lecciones
      await this.syncLessonProgress(profile);

      // Sincronizar medallas
      await this.syncBadges(profile);

      // Actualizar última sincronización
      await AsyncStorage.setItem(SYNC_KEYS.LAST_SYNC, new Date().toISOString());

      return true;
    } catch (error) {
      console.error("Error al sincronizar perfil:", error);

      // Solo guardar como pendiente si no es un error de duplicado
      const errorMessage = JSON.stringify(error);
      if (!errorMessage.includes("duplicate key")) {
        await this.addPendingChange({
          type: "profile",
          action: "update",
          data: profile,
        });
      }

      return false;
    }
  }

  /**
   * Sincroniza el progreso de cursos
   */
  private async syncCourseProgress(profile: UserProfile): Promise<void> {
    try {
      for (const courseProgress of profile.coursesProgress) {
        const { error } = await this.supabase.from("course_progress").upsert(
          {
            username: profile.username,
            course_id: courseProgress.courseId,
            completed_lessons: courseProgress.completedLessons,
            total_points: courseProgress.totalPoints,
            progress_percentage: courseProgress.progressPercentage,
            started_at: courseProgress.startedAt,
            last_accessed_at: courseProgress.lastAccessedAt,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "username,course_id",
          }
        );

        if (error) throw error;
      }
      console.log("Progreso de cursos sincronizado");
    } catch (error) {
      console.error("Error al sincronizar cursos:", error);
      throw error;
    }
  }

  /**
   * Sincroniza el progreso de lecciones
   */
  private async syncLessonProgress(profile: UserProfile): Promise<void> {
    try {
      for (const lessonProgress of profile.lessonsProgress) {
        const { error } = await this.supabase.from("lesson_progress").upsert(
          {
            username: profile.username,
            lesson_id: lessonProgress.lessonId,
            completed: lessonProgress.completed,
            completed_at: lessonProgress.completedAt,
            challenges_completed: lessonProgress.challengesCompleted,
            score: lessonProgress.score,
            attempts: lessonProgress.attempts,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "username,lesson_id",
          }
        );

        if (error) throw error;
      }
      console.log("Progreso de lecciones sincronizado");
    } catch (error) {
      console.error("Error al sincronizar lecciones:", error);
      throw error;
    }
  }

  /**
   * Sincroniza las medallas
   */
  private async syncBadges(profile: UserProfile): Promise<void> {
    try {
      for (const badge of profile.badges) {
        if (badge.isUnlocked) {
          const { error } = await this.supabase.from("user_badges").upsert(
            {
              username: profile.username,
              badge_id: badge.id,
              unlocked_at: badge.earnedAt,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "username,badge_id",
            }
          );

          if (error) throw error;
        }
      }
      console.log("Medallas sincronizadas");
    } catch (error) {
      console.error("Error al sincronizar medallas:", error);
      throw error;
    }
  }

  /**
   * Sincroniza todos los cambios pendientes
   */
  async syncPendingChanges(): Promise<void> {
    if (this.isSyncing) {
      console.log("Sincronización ya en progreso...");
      return;
    }

    try {
      this.isSyncing = true;

      const isOnline = await this.checkConnection();
      if (!isOnline) {
        console.log("Sin conexión, cancelando sincronización");
        return;
      }

      const pendingChanges = await this.getPendingChanges();

      if (pendingChanges.length === 0) {
        console.log("No hay cambios pendientes para sincronizar");
        return;
      }

      console.log(
        `Sincronizando ${pendingChanges.length} cambios pendientes...`
      );

      for (const change of pendingChanges) {
        try {
          // Obtener el perfil actual
          const profile = await StorageService.getUserProfile();

          if (!profile) {
            console.log("No hay perfil local, omitiendo cambio");
            await this.removePendingChange(change.id);
            continue;
          }

          // Sincronizar según el tipo de cambio
          await this.syncUserProfile(profile);

          // Eliminar cambio pendiente
          await this.removePendingChange(change.id);

          console.log(`Cambio sincronizado: ${change.type}`);
        } catch (error) {
          console.error(`Error al sincronizar cambio ${change.id}:`, error);
          // Mantener el cambio en la cola para reintentarlo más tarde
        }
      }

      console.log("Sincronización completada");
    } catch (error) {
      console.error("Error en sincronización general:", error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Descarga datos desde Supabase
   */
  async downloadFromCloud(username: string): Promise<UserProfile | null> {
    try {
      const isOnline = await this.checkConnection();
      if (!isOnline) {
        console.log("Sin conexión, usando datos locales");
        return await StorageService.getUserProfile();
      }

      // Obtener perfil
      const { data: profileData, error: profileError } = await this.supabase
        .from("user_profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError || !profileData) {
        console.log("No se encontró perfil en la nube");
        return null;
      }

      // Obtener progreso de cursos
      const { data: coursesData } = await this.supabase
        .from("course_progress")
        .select("*")
        .eq("username", username);

      // Obtener progreso de lecciones
      const { data: lessonsData } = await this.supabase
        .from("lesson_progress")
        .select("*")
        .eq("username", username);

      // Obtener medallas
      const { data: badgesData } = await this.supabase
        .from("user_badges")
        .select("*")
        .eq("username", username);

      // Construir perfil completo
      const profile: UserProfile = {
        id: profileData.id,
        username: profileData.username,
        totalPoints: profileData.total_points,
        level: profileData.level,
        joinedAt: profileData.joined_at,
        coursesProgress: coursesData || [],
        lessonsProgress: lessonsData || [],
        badges: badgesData || [],
      };

      console.log("Datos descargados desde la nube");
      return profile;
    } catch (error) {
      console.error("Error al descargar desde la nube:", error);
      return null;
    }
  }

  /**
   * Elimina TODA la información de un usuario de Supabase
   */
  async deleteUserAccount(username: string): Promise<boolean> {
    try {
      const isOnline = await this.checkConnection();
      if (!isOnline) {
        console.error("No hay conexión para eliminar cuenta");
        return false;
      }

      console.log(`Eliminando cuenta de Supabase para: ${username}`);

      // Eliminar medallas del usuario
      const { error: badgesError } = await this.supabase
        .from("user_badges")
        .delete()
        .eq("username", username);

      if (badgesError) {
        console.error("Error al eliminar medallas:", badgesError);
      } else {
        console.log("Medallas eliminadas");
      }

      // Eliminar progreso de lecciones
      const { error: lessonsError } = await this.supabase
        .from("lesson_progress")
        .delete()
        .eq("username", username);

      if (lessonsError) {
        console.error("Error al eliminar progreso de lecciones:", lessonsError);
      } else {
        console.log("Progreso de lecciones eliminado");
      }

      // Eliminar progreso de cursos
      const { error: coursesError } = await this.supabase
        .from("course_progress")
        .delete()
        .eq("username", username);

      if (coursesError) {
        console.error("Error al eliminar progreso de cursos:", coursesError);
      } else {
        console.log("Progreso de cursos eliminado");
      }

      // Eliminar perfil del usuario
      const { error: profileError } = await this.supabase
        .from("user_profiles")
        .delete()
        .eq("username", username);

      if (profileError) {
        console.error("Error al eliminar perfil:", profileError);
        return false;
      }

      console.log(`Cuenta eliminada completamente de Supabase: ${username}`);
      return true;
    } catch (error) {
      console.error("Error al eliminar cuenta de Supabase:", error);
      return false;
    }
  }

  /**
   * Obtiene la fecha de la última sincronización
   */
  async getLastSyncDate(): Promise<Date | null> {
    try {
      const lastSync = await AsyncStorage.getItem(SYNC_KEYS.LAST_SYNC);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error("Error al obtener última sincronización:", error);
      return null;
    }
  }

  /**
   * Fuerza una sincronización manual
   */
  async forceSyncNow(): Promise<boolean> {
    try {
      const profile = await StorageService.getUserProfile();

      if (!profile) {
        console.log("No hay perfil para sincronizar");
        return false;
      }

      const isOnline = await this.checkConnection();
      if (!isOnline) {
        console.log("Sin conexión");
        return false;
      }

      console.log("Forzando sincronización...");
      const success = await this.syncUserProfile(profile);

      if (success) {
        await this.syncPendingChanges();
      }

      return success;
    } catch (error) {
      console.error("Error en sincronización forzada:", error);
      return false;
    }
  }

  /**
   * Limpia todos los datos de sincronización
   */
  async clearSyncData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        SYNC_KEYS.LAST_SYNC,
        SYNC_KEYS.PENDING_CHANGES,
      ]);
      console.log("Datos de sincronización limpiados");
    } catch (error) {
      console.error("Error al limpiar datos de sincronización:", error);
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new SupabaseSyncService();
