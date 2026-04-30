/**
 * Pantalla para ver informacion de la base de datos SQLite
 * Muestra los datos almacenados en SQLite por la app
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import SQLiteStorageService from "../../services/SQLiteStorageService";

// ==========================================
// TIPOS
// ==========================================
interface TableData {
  tableName: string;
  rowCount: number;
  rows: Record<string, any>[];
  isExpanded: boolean;
}

interface SQLiteDemoScreenProps {
  navigation: any;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
const SQLiteDemoScreen: React.FC<SQLiteDemoScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [tables, setTables] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Carga los datos de todas las tablas de SQLite
   */
  const loadAllData = useCallback(async () => {
    try {
      // Obtener info de tablas
      const tableInfo = await SQLiteStorageService.getTableInfo();

      // Cargar los datos de cada tabla
      const tablesData: TableData[] = [];
      for (const info of tableInfo) {
        const rows = await SQLiteStorageService.getAllRows(info.tableName);
        tablesData.push({
          tableName: info.tableName,
          rowCount: info.rowCount,
          rows,
          isExpanded: info.rowCount > 0, // Expandir automáticamente si tiene datos
        });
      }

      setTables(tablesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  /**
   * Refresca los datos al hacer pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData();
  }, [loadAllData]);

  /**
   * Alterna la expansión de una tabla
   */
  const toggleTable = (index: number) => {
    setTables((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, isExpanded: !t.isExpanded } : t
      )
    );
  };

  /**
   * Formatea el nombre de la tabla para mostrar
   */
  const formatTableName = (name: string): string => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /**
   * Obtiene el color de la tabla según su nombre
   */
  const getTableColor = (tableName: string): string => {
    const colors: Record<string, string> = {
      registered_users: "#1565C0",
      user_profiles: "#2E7D32",
      course_progress: "#E65100",
      lesson_progress: "#6A1B9A",
      badges: "#C62828",
    };
    return colors[tableName] || "#424242";
  };

  /**
   * Obtiene el icono de la tabla
   */
  const getTableIcon = (
    tableName: string
  ): "person" | "account-circle" | "school" | "menu-book" | "emoji-events" | "table-chart" => {
    const icons: Record<string, "person" | "account-circle" | "school" | "menu-book" | "emoji-events"> = {
      registered_users: "person",
      user_profiles: "account-circle",
      course_progress: "school",
      lesson_progress: "menu-book",
      badges: "emoji-events",
    };
    return icons[tableName] || "table-chart";
  };

  /**
   * Formatea un valor para mostrar en la tabla
   */
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return "NULL";
    if (key === "password") return "••••••••";
    if (typeof value === "string" && value.length > 50) {
      return value.substring(0, 50) + "...";
    }
    return String(value);
  };

  /**
   * Obtiene la cantidad total de registros
   */
  const totalRecords = tables.reduce((sum, t) => sum + t.rowCount, 0);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.surface }]}
        edges={["top", "bottom"]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B5E20" />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Cargando base de datos SQLite...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.surface }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        backgroundColor={theme.primary}
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.headerBar, { backgroundColor: "#1B5E20" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <MaterialIcons name="storage" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Ver datos en SQLite</Text>
        </View>

        <TouchableOpacity onPress={onRefresh}>
          <MaterialIcons name="refresh" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Banner informativo */}
      <View style={[styles.infoBanner, { backgroundColor: isDarkMode ? '#1a2e1a' : '#E8F5E9' }]}>
        <MaterialIcons name="info" size={18} color={isDarkMode ? '#81C784' : '#1B5E20'} />
        <Text style={[styles.infoBannerText, { color: isDarkMode ? '#81C784' : '#1B5E20' }]}>
          Datos reales de la app almacenados en SQLite.
        </Text>
      </View>

      {/* Resumen */}
      <View style={[styles.summaryContainer, { backgroundColor: theme.card }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: "#1B5E20" }]}>
            {tables.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Tablas
          </Text>
        </View>
        <View
          style={[styles.summaryDivider, { backgroundColor: theme.border }]}
        />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: "#1565C0" }]}>
            {totalRecords}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Registros
          </Text>
        </View>
        <View
          style={[styles.summaryDivider, { backgroundColor: theme.border }]}
        />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: "#E65100" }]}>
            SQLite
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Motor
          </Text>
        </View>
      </View>

      {/* Tablas */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tables.map((table, index) => (
          <View key={table.tableName} style={styles.tableSection}>
            {/* Header de tabla */}
            <TouchableOpacity
              style={[
                styles.tableHeader,
                {
                  backgroundColor: getTableColor(table.tableName),
                },
              ]}
              onPress={() => toggleTable(index)}
              activeOpacity={0.8}
            >
              <View style={styles.tableHeaderLeft}>
                <MaterialIcons
                  name={getTableIcon(table.tableName)}
                  size={22}
                  color="#fff"
                />
                <View>
                  <Text style={styles.tableName}>
                    {formatTableName(table.tableName)}
                  </Text>
                  <Text style={styles.tableCount}>
                    {table.rowCount}{" "}
                    {table.rowCount === 1 ? "registro" : "registros"}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name={
                  table.isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"
                }
                size={24}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Contenido de tabla expandida */}
            {table.isExpanded && (
              <View
                style={[
                  styles.tableContent,
                  { backgroundColor: theme.card },
                ]}
              >
                {table.rows.length === 0 ? (
                  <View style={styles.emptyTable}>
                    <MaterialIcons
                      name="inbox"
                      size={32}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.emptyTableText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Tabla vacia
                    </Text>
                  </View>
                ) : (
                  table.rows.map((row, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={[
                        styles.rowContainer,
                        {
                          borderBottomColor: theme.border,
                          borderBottomWidth:
                            rowIndex < table.rows.length - 1 ? 1 : 0,
                        },
                      ]}
                    >
                      <View style={styles.rowHeader}>
                        <Text
                          style={[
                            styles.rowIndex,
                            {
                              color: getTableColor(table.tableName),
                            },
                          ]}
                        >
                          #{rowIndex + 1}
                        </Text>
                      </View>
                      {Object.entries(row).map(([key, value]) => (
                        <View key={key} style={styles.fieldRow}>
                          <Text
                            style={[
                              styles.fieldKey,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {key}:
                          </Text>
                          <Text
                            style={[
                              styles.fieldValue,
                              { color: theme.text },
                            ]}
                            numberOfLines={2}
                          >
                            {formatValue(key, value)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SQLiteDemoScreen;

// ==========================================
// ESTILOS
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  loadingText: {
    fontSize: 16,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  infoBannerText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 15,
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 35,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
  tableSection: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  tableHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tableName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  tableCount: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
  },
  tableContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyTable: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyTableText: {
    fontSize: 13,
  },
  rowContainer: {
    paddingVertical: 10,
  },
  rowHeader: {
    marginBottom: 6,
  },
  rowIndex: {
    fontSize: 12,
    fontWeight: "bold",
  },
  fieldRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  fieldKey: {
    fontSize: 12,
    fontWeight: "600",
    width: 140,
    fontFamily: "monospace",
  },
  fieldValue: {
    fontSize: 12,
    flex: 1,
  },
});
