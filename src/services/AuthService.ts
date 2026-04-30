/**
 * Servicio de autenticación
 * Maneja registro, login, recuperación de contraseña y gestión de sesiones
 * CON SINCRONIZACIÓN A SUPABASE
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import SQLiteStorageService from "./SQLiteStorageService";

// Configuración de Supabase
const SUPABASE_URL = "https://otrwowwyzgczspclzcwl.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90cndvd3d5emdjenNwY2x6Y3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDk4MDUsImV4cCI6MjA4MDc4NTgwNX0.2D7sYYrjhLUKpDpM5sO0ORdvJm7QLq5HLW7OHsqhaos";

// Keys para AsyncStorage
const AUTH_KEYS = {
  USERS: "@BeginnerCode:users",
  CURRENT_USER: "@BeginnerCode:currentUser",
  USE_CLOUD_AUTH: "@BeginnerCode:useCloudAuth",
};

/**
 * Interface para un usuario registrado
 */
export interface RegisteredUser {
  id: string;
  username: string;
  email: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  createdAt: string;
}

/**
 * Interface para datos de registro
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
}

/**
 * Resultado de operaciones de autenticación
 */
export interface AuthResult {
  success: boolean;
  message: string;
  user?: RegisteredUser;
}

class AuthService {
  private supabase;
  private useCloudAuth: boolean = true;

  constructor() {
    // Inicializar cliente de Supabase
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    // Cargar preferencia de autenticación
    this.loadAuthPreference();
  }

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  /**
   * Carga la preferencia de autenticación
   */
  private async loadAuthPreference(): Promise<void> {
    try {
      const preference = await AsyncStorage.getItem(AUTH_KEYS.USE_CLOUD_AUTH);
      this.useCloudAuth = preference !== "false"; // Por defecto true
    } catch (error) {
      console.error("Error al cargar preferencia de auth:", error);
      this.useCloudAuth = true;
    }
  }

  /**
   * Establece si se usa autenticación en la nube
   */
  async setUseCloudAuth(value: boolean): Promise<void> {
    this.useCloudAuth = value;
    await AsyncStorage.setItem(AUTH_KEYS.USE_CLOUD_AUTH, value.toString());
  }

  // ==========================================
  // GESTIÓN DE USUARIOS LOCAL
  // ==========================================

  /**
   * Obtiene todos los usuarios registrados localmente
   */
  private async getAllUsers(): Promise<RegisteredUser[]> {
    try {
      const usersData = await AsyncStorage.getItem(AUTH_KEYS.USERS);
      return usersData ? JSON.parse(usersData) : [];
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      return [];
    }
  }

  /**
   * Guarda la lista de usuarios localmente
   */
  private async saveUsers(users: RegisteredUser[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error("Error al guardar usuarios:", error);
      return false;
    }
  }

  /**
   * Guarda el usuario actual en sesión
   */
  private async setCurrentUser(username: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(AUTH_KEYS.CURRENT_USER, username);
      return true;
    } catch (error) {
      console.error("Error al guardar usuario actual:", error);
      return false;
    }
  }

  /**
   * Obtiene el usuario actual en sesión
   */
  async getCurrentUser(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_KEYS.CURRENT_USER);
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  }

  /**
   * Cierra la sesión actual
   */
  async logout(): Promise<boolean> {
    try {
      // Cerrar sesión en Supabase si está habilitado
      if (this.useCloudAuth) {
        await this.supabase.auth.signOut();
      }

      // Eliminar usuario actual de AsyncStorage
      await AsyncStorage.removeItem(AUTH_KEYS.CURRENT_USER);
      return true;
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      return false;
    }
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  /**
   * Valida el formato de email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida la fortaleza de la contraseña
   */
  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
      return {
        valid: false,
        message: "La contraseña debe tener al menos 6 caracteres",
      };
    }
    if (!/\d/.test(password)) {
      return {
        valid: false,
        message: "La contraseña debe contener al menos un número",
      };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return {
        valid: false,
        message: "La contraseña debe contener al menos una letra",
      };
    }
    return { valid: true, message: "Contraseña válida" };
  }

  /**
   * Valida el nombre de usuario
   */
  validateUsername(username: string): { valid: boolean; message: string } {
    if (username.length < 3) {
      return {
        valid: false,
        message: "El usuario debe tener al menos 3 caracteres",
      };
    }
    if (username.length > 20) {
      return {
        valid: false,
        message: "El usuario no puede tener más de 20 caracteres",
      };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        valid: false,
        message: "El usuario solo puede contener letras, números y guión bajo",
      };
    }
    return { valid: true, message: "Usuario válido" };
  }

  // ==========================================
  // REGISTRO
  // ==========================================

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validar username
      const usernameValidation = this.validateUsername(data.username);
      if (!usernameValidation.valid) {
        return { success: false, message: usernameValidation.message };
      }

      // Validar email
      if (!this.isValidEmail(data.email)) {
        return { success: false, message: "El email no es válido" };
      }

      // Validar contraseña
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message };
      }

      // Validar pregunta y respuesta de seguridad
      if (!data.securityQuestion || data.securityQuestion.trim().length < 5) {
        return {
          success: false,
          message: "La pregunta de seguridad es muy corta",
        };
      }

      if (!data.securityAnswer || data.securityAnswer.trim().length < 2) {
        return {
          success: false,
          message: "La respuesta de seguridad es muy corta",
        };
      }

      // Si se usa autenticación en la nube
      if (this.useCloudAuth) {
        return await this.registerWithSupabase(data);
      } else {
        return await this.registerLocal(data);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, message: "Error al registrar usuario" };
    }
  }

  /**
   * Registro local (sin Supabase)
   */
  private async registerLocal(data: RegisterData): Promise<AuthResult> {
    // Obtener usuarios existentes
    const users = await this.getAllUsers();

    // Verificar si el usuario ya existe
    const userExists = users.find(
      (u) => u.username.toLowerCase() === data.username.toLowerCase()
    );
    if (userExists) {
      return {
        success: false,
        message: "Este nombre de usuario ya está en uso",
      };
    }

    // Verificar si el email ya existe
    const emailExists = users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (emailExists) {
      return { success: false, message: "Este email ya está registrado" };
    }

    // Crear nuevo usuario
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      username: data.username,
      email: data.email,
      password: data.password,
      securityQuestion: data.securityQuestion,
      securityAnswer: data.securityAnswer.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    };

    // Guardar usuario
    users.push(newUser);
    await this.saveUsers(users);

    // Guardar también en SQLite
    await SQLiteStorageService.saveRegisteredUser(newUser);

    console.log("Usuario registrado localmente:", data.username);
    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: newUser,
    };
  }

  /**
   * Registro con Supabase
   */
  private async registerWithSupabase(data: RegisterData): Promise<AuthResult> {
    try {
      // Primero registrar localmente para mantener preguntas de seguridad
      const localResult = await this.registerLocal(data);
      if (!localResult.success) {
        return localResult;
      }

      // Luego registrar en Supabase con confirmación de email deshabilitada
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
          emailRedirectTo: undefined, // No redirigir
        },
      });

      if (error) {
        console.warn(
          "Registro en Supabase falló, usando solo local:",
          error.message
        );
        // No eliminar usuario local, solo advertir
        // El usuario puede seguir usando la app sin Supabase
        return {
          success: true,
          message: "Usuario registrado exitosamente (solo local)",
          user: localResult.user,
        };
      }

      console.log("Usuario registrado en Supabase:", data.username);
      return {
        success: true,
        message: "Usuario registrado exitosamente",
        user: localResult.user,
      };
    } catch (error) {
      console.warn("Error en registro con Supabase, usando local:", error);
      // Ya está registrado localmente, no fallar
      const users = await this.getAllUsers();
      const user = users.find((u) => u.username === data.username);
      return {
        success: true,
        message: "Usuario registrado exitosamente (solo local)",
        user: user,
      };
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================

  /**
   * Inicia sesión con credenciales
   */
  async login(username: string, password: string): Promise<AuthResult> {
    try {
      // Validar que no estén vacíos
      if (!username || !password) {
        return {
          success: false,
          message: "Usuario y contraseña son requeridos",
        };
      }

      if (this.useCloudAuth) {
        return await this.loginWithSupabase(username, password);
      } else {
        return await this.loginLocal(username, password);
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: "Error al iniciar sesión" };
    }
  }

  /**
   * Login local (sin Supabase)
   */
  private async loginLocal(
    username: string,
    password: string
  ): Promise<AuthResult> {
    // Obtener usuarios
    const users = await this.getAllUsers();

    // Buscar usuario (case-insensitive)
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );

    if (!user) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Verificar contraseña
    if (user.password !== password) {
      return { success: false, message: "Contraseña incorrecta" };
    }

    // Guardar sesión
    await this.setCurrentUser(user.username);

    console.log("Login local exitoso:", user.username);
    return {
      success: true,
      message: "Login exitoso",
      user: user,
    };
  }

  /**
   * Login con Supabase
   */
  private async loginWithSupabase(
    username: string,
    password: string
  ): Promise<AuthResult> {
    try {
      // Primero obtener el email del usuario localmente
      const users = await this.getAllUsers();
      const user = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      // Intentar login en Supabase con email
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        console.warn(
          "Login en Supabase falló, usando autenticación local:",
          error.message
        );
        // Siempre usar login local como fallback
        return await this.loginLocal(username, password);
      }

      // Guardar sesión
      await this.setCurrentUser(user.username);

      console.log("Login con Supabase exitoso:", user.username);
      return {
        success: true,
        message: "Login exitoso",
        user: user,
      };
    } catch (error) {
      console.warn("Error en login con Supabase, usando local:", error);
      // Intentar login local como fallback
      return await this.loginLocal(username, password);
    }
  }

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================

  /**
   * Verifica si el usuario existe y devuelve su pregunta de seguridad
   */
  async getSecurityQuestion(
    username: string
  ): Promise<{ success: boolean; question?: string; message: string }> {
    try {
      const users = await this.getAllUsers();
      const user = users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (!user) {
        return { success: false, message: "Usuario no encontrado" };
      }

      return {
        success: true,
        question: user.securityQuestion,
        message: "Pregunta obtenida",
      };
    } catch (error) {
      console.error("Error al obtener pregunta:", error);
      return {
        success: false,
        message: "Error al obtener pregunta de seguridad",
      };
    }
  }

  /**
   * Verifica la respuesta de seguridad y cambia la contraseña
   */
  async resetPassword(
    username: string,
    securityAnswer: string,
    newPassword: string
  ): Promise<AuthResult> {
    try {
      // Validar nueva contraseña
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return { success: false, message: passwordValidation.message };
      }

      const users = await this.getAllUsers();
      const userIndex = users.findIndex(
        (u) => u.username.toLowerCase() === username.toLowerCase()
      );

      if (userIndex === -1) {
        return { success: false, message: "Usuario no encontrado" };
      }

      const user = users[userIndex];

      // Verificar respuesta de seguridad (case-insensitive)
      if (user.securityAnswer !== securityAnswer.toLowerCase().trim()) {
        return { success: false, message: "Respuesta de seguridad incorrecta" };
      }

      // Cambiar contraseña localmente
      users[userIndex].password = newPassword;
      await this.saveUsers(users);

      // Si usa Supabase, también actualizar allí
      if (this.useCloudAuth) {
        try {
          const { error } = await this.supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            console.warn("No se pudo actualizar en Supabase:", error);
          }
        } catch (error) {
          console.warn("Error al actualizar en Supabase:", error);
        }
      }

      console.log("Contraseña cambiada exitosamente para:", username);
      return {
        success: true,
        message: "Contraseña cambiada exitosamente",
        user: users[userIndex],
      };
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      return { success: false, message: "Error al cambiar contraseña" };
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  async hasActiveSession(): Promise<boolean> {
    const currentUser = await this.getCurrentUser();
    return currentUser !== null;
  }

  /**
   * Obtiene información del usuario por username
   */
  async getUserByUsername(username: string): Promise<RegisteredUser | null> {
    const users = await this.getAllUsers();
    return (
      users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ||
      null
    );
  }

  /**
   * Elimina una cuenta de usuario del sistema de autenticación
   */
  async deleteAccount(username: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();

      // Filtrar para eliminar el usuario
      const filteredUsers = users.filter(
        (u) => u.username.toLowerCase() !== username.toLowerCase()
      );

      // Si no cambió el tamaño del array, el usuario no existía
      if (filteredUsers.length === users.length) {
        console.log(
          `Usuario ${username} no encontrado en el sistema de autenticación`
        );
        return false;
      }

      // Guardar la lista actualizada
      await this.saveUsers(filteredUsers);

      // Si usa Supabase, también eliminar de allí
      if (this.useCloudAuth) {
        try {
          // Eliminar usuario de Supabase Auth (requiere permisos admin)
          // Por ahora solo cerramos sesión
          await this.supabase.auth.signOut();
        } catch (error) {
          console.warn("Error al eliminar de Supabase Auth:", error);
        }
      }

      console.log(`Usuario ${username} eliminado del sistema de autenticación`);

      // También eliminar de SQLite
      await SQLiteStorageService.deleteRegisteredUser(username);

      return true;
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      return false;
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new AuthService();
