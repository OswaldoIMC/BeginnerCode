/**
 * Servicio de Notificaciones
 * Maneja notificaciones locales y preferencias del usuario
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Key para AsyncStorage
const NOTIFICATIONS_KEY = "@BeginnerCode:notificationsEnabled";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  /**
   * Solicita permisos de notificaciones
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("No se concedieron permisos de notificaciones");
        return false;
      }

      // Configurar canal de notificaciones para Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return true;
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      return false;
    }
  }

  /**
   * Obtiene la preferencia de notificaciones
   */
  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return value === "true";
    } catch (error) {
      console.error("Error al obtener preferencia de notificaciones:", error);
      return false;
    }
  }

  /**
   * Guarda la preferencia de notificaciones
   */
  async setNotificationsEnabled(enabled: boolean): Promise<boolean> {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, enabled.toString());

      if (enabled) {
        await this.requestPermissions();
        await this.scheduleDailyReminder();
      } else {
        await this.cancelAllNotifications();
      }

      return true;
    } catch (error) {
      console.error("Error al guardar preferencia de notificaciones:", error);
      return false;
    }
  }

  /**
   * Programa una notificación de recordatorio diario
   */
  async scheduleDailyReminder(): Promise<void> {
    try {
      await this.cancelAllNotifications();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📚 ¡Hora de aprender!",
          body: "Continúa con tus lecciones de programación hoy",
          data: { type: "daily_reminder" },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        } as unknown as Notifications.NotificationTriggerInput,
      });

      console.log("Recordatorio diario programado");
    } catch (error) {
      console.error("Error al programar notificación:", error);
    }
  }

  /**
   * Envía una notificación inmediata (para testing)
   */
  async sendTestNotification(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();

      if (!hasPermission) {
        console.log("No hay permisos para notificaciones");
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Notificaciones activadas",
          body: "Recibirás recordatorios diarios para continuar aprendiendo",
          data: { type: "test" },
        },
        trigger: null,
      });

      console.log("Notificación de prueba enviada");
    } catch (error) {
      console.error("Error al enviar notificación de prueba:", error);
    }
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("Todas las notificaciones canceladas");
    } catch (error) {
      console.error("Error al cancelar notificaciones:", error);
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error al obtener notificaciones programadas:", error);
      return [];
    }
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new NotificationService();
