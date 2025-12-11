/**
 * Indicador de Conectividad
 * Muestra un banner cuando se pierde o recupera la conexión a internet
 */

import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";

const ConnectivityIndicator: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Suscribirse a cambios de conectividad
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;

      // Si cambió el estado de conexión
      if (connected !== isConnected) {
        setIsConnected(connected);
        setShowBanner(true);

        // Mostrar banner
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(3000),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowBanner(false);
        });

        // Log para debugging
        if (connected) {
          console.log("Conectado a internet");
        } else {
          console.log("Sin conexión a internet");
        }
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  if (!showBanner) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: isConnected ? "#4CAF50" : "#FF9800",
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MaterialIcons
        name={isConnected ? "wifi" : "wifi-off"}
        size={20}
        color="#fff"
      />
      <Text style={styles.bannerText}>
        {isConnected
          ? "Conectado - Sincronizando datos..."
          : "Sin conexión - Los datos se sincronizarán cuando te conectes"}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    gap: 10,
  },
  bannerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
});

export default ConnectivityIndicator;
