import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/tabs";
import { StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native";
import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";

const BUSINESS_FILE = FileSystem.documentDirectory + "business.json";
const SETTINGS_FILE = FileSystem.documentDirectory + "settings.json";

// Custom Header Component
const CustomHeader = ({ onBusinessChange }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  // Load businesses and selected business
  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      // Load businesses
      const businessContent = await FileSystem.readAsStringAsync(BUSINESS_FILE);
      const businessData = JSON.parse(businessContent);
      setBusinesses(businessData);

      // Load selected business
      const settingsContent = await FileSystem.readAsStringAsync(SETTINGS_FILE);
      const settingsData = JSON.parse(settingsContent);
      const selected = businessData.find(
        (b) => b.id === settingsData.selected_business
      );
      setSelectedBusiness(selected);
    } catch (error) {
      console.error("Business data load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelect = async (business) => {
    try {
      // Update settings with selected business
      const settingsContent = await FileSystem.readAsStringAsync(SETTINGS_FILE);
      const settingsData = JSON.parse(settingsContent);

      const updatedSettings = {
        ...settingsData,
        selected_business: business.id,
      };

      await FileSystem.writeAsStringAsync(
        SETTINGS_FILE,
        JSON.stringify(updatedSettings)
      );
      setSelectedBusiness(business);
      setModalVisible(false);

      // Call the callback function to refresh home screen
      if (onBusinessChange) {
        onBusinessChange(business.id);
      }
    } catch (error) {
      console.error("Business selection error:", error);
    }
  };

  const handleAddBusiness = () => {
    setModalVisible(false);
    router.push('/create-business')
  };

  if (loading) {
    return (
      <View style={styles.headerButton}>
        <Text style={styles.title}>লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.headerButton}
        activeOpacity={0.7}
      >
        <View
          style={{
            borderWidth: 0.5,
            borderColor: "#ccc",
            borderRadius: 6,
            padding: 4,
            marginRight: 8,
          }}
        >
          <Ionicons name="business" size={22} color="#ccc" />
        </View>
        <View>
          <Text style={styles.title} numberOfLines={1}>
            {selectedBusiness?.name || "ব্যবসা নির্বাচন করুন"}
          </Text>
          <Text
            style={{
              fontFamily: "bangla_regular",
              fontSize: 10,
              marginTop: -4,
            }}
            numberOfLines={1}
          >
            ব্যবসা পরিবর্তনে ক্লিক করুন
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ব্যবসা নির্বাচন করুন</Text>

            {/* Business List */}
            {businesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                style={[
                  styles.modalItem,
                  selectedBusiness?.id === business.id && styles.selectedItem,
                ]}
                onPress={() => handleBusinessSelect(business)}
              >
                <Ionicons
                  name="business"
                  size={20}
                  color={
                    selectedBusiness?.id === business.id ? "#007AFF" : "#666"
                  }
                />
                <Text
                  style={[
                    styles.modalItemText,
                    selectedBusiness?.id === business.id &&
                      styles.selectedItemText,
                  ]}
                >
                  {business.name}
                </Text>
                {selectedBusiness?.id === business.id && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}

            {/* Add New Business */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddBusiness}
            >
              <Ionicons name="add-circle" size={20} color="#34C759" />
              <Text style={styles.addButtonText}>নতুন ব্যবসা যোগ করুন</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default function MainLayout() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBusinessChange = (businessId) => {
    // Refresh the home screen by changing the key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Tabs
      key={refreshKey} // This will force re-render when business changes
      screenOptions={{
        headerTitleAlign: "center",
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#f8f9fa",
          borderTopWidth: 1,
          borderTopColor: "#e5e5e5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          fontFamily: "bangla_medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "হোম",
          headerTitleAlign: "left",
          headerTitle: () => <CustomHeader onBusinessChange={handleBusinessChange} />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarLabel: "ক্যাটাগরি",
          title: "ক্যাটাগরি সমূহ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers" size={size} color={color} />
          ),
          headerTitleStyle: {
            fontFamily: "bangla_semibold",
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "সেটিংস",
          title: "সেটিংস",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          headerTitleStyle: {
            fontFamily: "bangla_semibold",
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    color: "#007AFF",
    fontFamily: "bangla_semibold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    width: "85%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "bangla_semibold",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  selectedItem: {
    backgroundColor: "#e6f2ff",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontFamily: "bangla_medium",
    flex: 1,
  },
  selectedItemText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: "#f0fdf4",
    borderColor: "#34C759",
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 16,
    color: "#34C759",
    marginLeft: 12,
    fontFamily: "bangla_medium",
    fontWeight: "600",
  },
});