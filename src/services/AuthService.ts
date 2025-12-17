/**
 * Servicio de autenticación
 * Maneja registro, login, recuperación de contraseña y gestión de sesiones
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Keys para AsyncStorage
const AUTH_KEYS = {
  USERS: "@BeginnerCode:users",
  CURRENT_USER: "@BeginnerCode:currentUser",
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
  // ==========================================
  // GESTIÓN DE USUARIOS
  // ==========================================

  /**
   * Obtiene todos los usuarios registrados
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
   * Guarda la lista de usuarios
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

      console.log("Usuario registrado exitosamente:", data.username);
      return {
        success: true,
        message: "Usuario registrado exitosamente",
        user: newUser,
      };
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, message: "Error al registrar usuario" };
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

      console.log("Login exitoso:", user.username);
      return {
        success: true,
        message: "Login exitoso",
        user: user,
      };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, message: "Error al iniciar sesión" };
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

      // Cambiar contraseña
      users[userIndex].password = newPassword;
      await this.saveUsers(users);

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

      console.log(`Usuario ${username} eliminado del sistema de autenticación`);
      return true;
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      return false;
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new AuthService();
