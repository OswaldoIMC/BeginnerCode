import React from "react";
import { createStackNavigator } from "@react-navigation/stack"; // Importación de pantallas
import LoginScreen from "../screens/auth/LoginScreen";
import HomeScreen from "../screens/home/HomeScreen";
import PythonScreen from "../screens/courses/PythonScreen";

/**
 * Definición de los tipos para los parámetros de navegación
 * Esto ayuda a TypeScript a entender qué parámetros espera cada pantalla
 */

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Python: undefined;
};

/**
 * Creamos el Stack Navigator con tipado
 */

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Componente principal de navegación
 * Gestiona todas las rutas de la aplicación
 */

const StackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
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
      {/* Pantalla Principal */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Menú Principal",
          headerLeft: () => null, // Evitamos el botón de regreso
        }}
      />
      {/* Pantallas de los cursos*/}
      <Stack.Screen
        name="Python"
        component={PythonScreen}
        options={{
          title: "Python",
        }}
      />
    </Stack.Navigator>
  );
};
export default StackNavigator;
