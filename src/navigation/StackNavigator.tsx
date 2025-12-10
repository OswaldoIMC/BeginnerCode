import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
// Importación de pantallas
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import RecoverPasswordScreen from "../screens/auth/RecoverPasswordScreen";
import HomeScreen from "../screens/home/HomeScreen";
import PythonScreen from "../screens/courses/PythonScreen";
import JavaScreen from "../screens/courses/JavaScreen";
import LessonDetailScreen from "../screens/lessons/LessonDetailScreen";
import ChallengeScreen from "../screens/challenges/ChallengeScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";

/**
 * Definición de los tipos para los parámetros de navegación
 * Esto ayuda a TypeScript a entender qué parámetros espera cada pantalla
 */

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  RecoverPassword: undefined;
  Home: undefined;
  Python: undefined;
  Java: undefined;
  LessonDetail: {
    lessonId: string;
    courseId: string;
  };
  Challenge: {
    lessonId: string;
    courseId: string;
  };
  Profile: undefined;
  Settings: undefined;
};

/**
 * Props para el StackNavigator
 */
interface StackNavigatorProps {
  initialRoute?: "Login" | "Home";
}

/**
 * Creamos el Stack Navigator con tipado
 */

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Componente principal de navegación
 * Gestiona todas las rutas de la aplicación
 */

const StackNavigator: React.FC<StackNavigatorProps> = ({
  initialRoute = "Login",
}) => {
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false, // Oculta el header globalmente
      }}
    >
      {/* Pantalla de Login */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Iniciar Sesión",
        }}
      />

      {/* Pantalla de Registro */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Registro",
        }}
      />

      {/* Pantalla de Recuperar Contraseña */}
      <Stack.Screen
        name="RecoverPassword"
        component={RecoverPasswordScreen}
        options={{
          title: "Recuperar Contraseña",
        }}
      />

      {/* Pantalla Principal */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Menú Principal",
          headerLeft: () => null, // Evitamos el botón de regreso
        }}
      />

      {/* Pantallas de los cursos */}
      <Stack.Screen
        name="Python"
        component={PythonScreen}
        options={{
          title: "Python",
        }}
      />
      <Stack.Screen
        name="Java"
        component={JavaScreen}
        options={{
          title: "Java",
        }}
      />

      {/* Pantalla de detalle de lección */}
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{
          title: "Detalle de Lección",
        }}
      />

      {/* Pantalla de retos/desafíos */}
      <Stack.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          title: "Retos",
        }}
      />

      {/* Pantalla de perfil */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Mi Perfil",
        }}
      />

      {/* Pantalla de configuración */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Configuración",
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
