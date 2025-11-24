import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, FONT_SIZES } from "../../../types";
import * as Progress from "react-native-progress";
const PythonImage = require("../../../assets/python.png");

const PythonScreen = () => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const navigation = useNavigation();

  const lessons = [
    { id: 1, title: "Introducción a Python", progress: 1.0 },
    { id: 2, title: "Instalación y configuración del entorno", progress: 0.6 },
    { id: 3, title: "Tu primer programa", progress: 0.3 },
    { id: 4, title: "Variables y tipos de datos", progress: 0.4 },
    { id: 5, title: "Operadores aritméticos y lógicos", progress: 0.9 },
    { id: 6, title: "Entrada y salida de datos", progress: 0.1 },
    { id: 7, title: "Condicionales", progress: 0.8 },
    { id: 8, title: "Bucles", progress: 0.2 },
    { id: 9, title: "Listas y tuplas", progress: 0.5 },
    { id: 10, title: "Diccionarios y conjuntos", progress: 0.1 },
    { id: 11, title: "Funciones", progress: 0.6 },
    {
      id: 12,
      title: "Ámbito de variables y valores por defecto",
      progress: 0.3,
    },
    { id: 13, title: "Manejo de errores", progress: 0.4 },
    { id: 14, title: "Archivos", progress: 0.9 },
    { id: 15, title: "Módulos y paquetes", progress: 0.1 },
    { id: 16, title: "Introducción a las librerías estándar", progress: 0.8 },
    {
      id: 17,
      title: "Listas por comprensión y expresiones lambda",
      progress: 0.2,
    },
    { id: 18, title: "Introducción a la POO", progress: 0.5 },
    { id: 19, title: "Proyecto final", progress: 0.0 },
    { id: 20, title: "Siguientes pasos", progress: 0.6 },
  ];

  /**
   * Maneja el cierre de sesión
   */
  const handleLogout = (): void => {
    setMenuVisible(false); // Mostramos confirmación antes de cerrar sesión
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  /**
   * Maneja la navegación al perfil del usuario
   */
  const handleProfile = (): void => {
    console.log("Navegando a perfil de usuario");
    setMenuVisible(false); // Aquí iría la navegación al perfil cuando esté implementado
    handleComingSoon("Perfil de Usuario");
  };

  /**
   * Muestra mensaje de funcionalidad próximamente disponible
   */
  const handleComingSoon = (feature: string): void => {
    // Implementación básica por ahora
    console.log(`Funcionalidad: ${feature} - Próximamente disponible`);
  };

  /**
   * Abre el menú de hamburguesa
   */
  const openMenu = (): void => {
    setMenuVisible(true);
  };
  /**
   * Cierra el menú de hamburguesa
   */
  const closeMenu = (): void => {
    setMenuVisible(false);
  };

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BeginnerCode</Text>
        <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
          <MaterialIcons name="menu" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* Modal del menú de hamburguesa */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={closeMenu}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menú</Text>
            <Pressable style={styles.menuOption} onPress={handleProfile}>
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <Text style={styles.menuText}>Mi Perfil</Text>
            </Pressable>
            <Pressable style={styles.menuOption} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={COLORS.error} />
              <Text style={[styles.menuText, { color: COLORS.error }]}>
                Cerrar Sesión
              </Text>
            </Pressable>
            <Pressable style={styles.closeMenuButton} onPress={closeMenu}>
              <Text style={styles.closeMenuText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.lessonList}>
        {/* Grid de opciones principales */}
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Image source={PythonImage} style={styles.logo} />
            <Text style={styles.courseTitle}>Python</Text>
          </View>

          {/* Descripción del curso */}
          <Text style={styles.subtitle}>Detalles del curso</Text>
          <Text style={styles.description}>
            Este curso esta basado en el lenguaje de programación Python, el
            objetivo es aprender los fundamentos básicos del lenguaje, asi como
            su estructura.
          </Text>
          <Text style={styles.lessonText}>Lecciones</Text>

          {/* Lista de lecciones */}
          {lessons.map((lesson) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              activeOpacity={0.8}
            >
              <View style={styles.lessonIconContainer}>
                <Text style={styles.lessonNumber}>
                  {lesson.id < 10 ? `0${lesson.id}` : lesson.id}
                </Text>
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Progress.Bar
                  progress={lesson.progress}
                  width={null}
                  color="#3776AB" // Color del curso Python
                  unfilledColor="#E0E0E0"
                  borderWidth={0}
                  height={8}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default PythonScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: "bold",
    color: COLORS.surface,
    flex: 1,
    textAlign: "center",
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  logo: {
    width: 130,
    height: 130,
    marginTop: 20,
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
  },
  menuTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  menuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginLeft: 15,
    fontWeight: "500",
  },
  closeMenuButton: {
    alignSelf: "center",
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeMenuText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 23,
    marginLeft: 10,
    marginBottom: 10,
    fontWeight: "bold",
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: "left",
    marginLeft: 10,
    marginBottom: 20,
  },
  lessonText: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "left",
    marginLeft: 10,
    marginBottom: 10,
  },
  lessonList: {
    paddingBottom: 30,
    paddingHorizontal: 10,
  },
  lessonCard: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  lessonIconContainer: {
    width: 75,
    height: 75,
    borderRadius: 12,
    backgroundColor: "#E3ECF9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  lessonNumber: {
    fontSize: 50,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#142646",
    marginBottom: 10,
  },
});
