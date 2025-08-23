import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { unzip } from "fflate";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const APP_DIR = FileSystem.documentDirectory;
const BACKUP_SIGNATURE = "CASHBOOK_APP_BD_v1";

export default function Restore() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isValidBackup, setIsValidBackup] = useState(false);
  const [backupInfo, setBackupInfo] = useState(null);
  const router = useRouter();

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });

      // ইউজার যদি ফাইল সিলেক্ট না করে বাতিল করে
      if (result.canceled) {
        Alert.alert("তথ্য", "আপনি কোন ফাইল নির্বাচন করেননি।");
        return;
      }

      // assets array খালি থাকলে
      if (!result.assets || result.assets.length === 0) {
        Alert.alert("তথ্য", "আপনি কোন ফাইল নির্বাচন করেননি।");
        return;
      }

      const file = result.assets[0];
      if (!file) {
        Alert.alert("তথ্য", "আপনি কোন ফাইল নির্বাচন করেননি।");
        return;
      }

      // Get file size and format it
      const fileSize = file.size || 0;
      const formattedSize = formatFileSize(fileSize);

      // ফাইল ভেরিফাই করুন
      const verificationResult = await verifyBackupFile(file.uri);
      
      setSelectedFile({
        uri: file.uri,
        name: file.name,
        size: formattedSize,
        rawSize: fileSize,
        isValid: verificationResult.isValid,
        backupInfo: verificationResult.info
      });
      
      setIsValidBackup(verificationResult.isValid);
      setBackupInfo(verificationResult.info);

      if (!verificationResult.isValid) {
        Alert.alert(
          "সতর্কতা", 
          "এই ফাইলটি একটি বৈধ অ্যাপ ব্যাকআপ ফাইল নয়। রিস্টোর করা বিপজ্জনক হতে পারে।"
        );
      }

    } catch (error) {
      console.log("File selection canceled by user" + error);
    }
  };

  // ব্যাকআপ ফাইল ভেরিফাই করার ফাংশন
  const verifyBackupFile = async (fileUri) => {
    try {
      // 1. Read the file content as base64
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Convert to Uint8Array
      const buffer = Buffer.from(fileContent, "base64");
      const uint8Array = new Uint8Array(buffer);

      // 3. Unzip and check for signature file
      return await new Promise((resolve, reject) => {
        unzip(uint8Array, (err, unzipped) => {
          if (err) {
            console.error("Unzip error:", err);
            return resolve({ isValid: false, info: null });
          }

          // চেক করুন signature ফাইল আছে কিনা
          if (!unzipped["backup_signature.json"]) {
            return resolve({ isValid: false, info: null });
          }

          try {
            // signature ফাইল পড়ুন
            const signatureData = new TextDecoder().decode(unzipped["backup_signature.json"]);
            const signatureInfo = JSON.parse(signatureData);
            
            // স্বাক্ষর मिलছে কिना চেক করুন
            const isValid = signatureInfo.signature === BACKUP_SIGNATURE;
            
            resolve({ 
              isValid, 
              info: isValid ? signatureInfo : null 
            });
          } catch (parseError) {
            console.error("Error parsing signature:", parseError);
            resolve({ isValid: false, info: null });
          }
        });
      });
    } catch (error) {
      console.error("Error verifying backup:", error);
      return { isValid: false, info: null };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleRestore = async () => {
    if (!isValidBackup) {
      Alert.alert(
        "সতর্কতা", 
        "এই ফাইলটি একটি বৈধ অ্যাপ ব্যাকআপ ফাইল নয়। আপনি কি নিশ্চিত যে আপনি রিস্টোর করতে চান?",
        [
          { text: "বাতিল", style: "cancel" },
          { text: "রিস্টোর করুন", onPress: proceedWithRestore }
        ]
      );
      return;
    }
    
    proceedWithRestore();
  };

  const proceedWithRestore = async () => {
    try {
      setIsProcessing(true);
      setShowWarningModal(false);

      if (!selectedFile) {
        throw new Error("কোনো ফাইল নির্বাচন করা হয়নি");
      }

      // 1. Read the file content as base64
      const fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Convert to Uint8Array
      const buffer = Buffer.from(fileContent, "base64");
      const uint8Array = new Uint8Array(buffer);

      // 3. Create app directory if not exists
      const dirInfo = await FileSystem.getInfoAsync(APP_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(APP_DIR, { intermediates: true });
      }

      // 4. Unzip using fflate
      await new Promise((resolve, reject) => {
        unzip(uint8Array, (err, unzipped) => {
          if (err) return reject(err);

          const savePromises = Object.entries(unzipped).map(
            async ([filename, data]) => {
              try {
                // signature ফাইল ছাড়া বাকি সব ফাইল রিস্টোর করুন
                if (filename !== "backup_signature.json") {
                  const filePath = APP_DIR + filename;
                  // Convert Uint8Array to string
                  const text = new TextDecoder().decode(data);
                  await FileSystem.writeAsStringAsync(filePath, text, {
                    encoding: FileSystem.EncodingType.UTF8,
                  });
                }
              } catch (fileError) {
                console.error(`Error restoring file ${filename}:`, fileError);
                throw fileError;
              }
            }
          );

          Promise.all(savePromises).then(resolve).catch(reject);
        });
      });

      // ✅ Success Alert with Restart
      Alert.alert("সফল", "ডাটا সফলভাবে রিস্টোর হয়েছে!", [
        {
          text: "ঠিক আছে",
          onPress: async () => {
            setSelectedFile(null);
            setIsValidBackup(false);
            setBackupInfo(null);
            try {
              await Updates.reloadAsync();
            } catch (e) {
              console.error("Error restarting app:", e);
              router.replace("/");
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Error restoring backup:", error);
      Alert.alert("ত্রুটি", `ডাটা রিস্টোর করতে ব্যর্থ: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const showRestoreWarning = () => {
    if (!selectedFile) {
      Alert.alert("তথ্য", "দয়া করে প্রথমে একটি ব্যাকআপ ফাইল নির্বাচন করুন");
      return;
    }

    setShowWarningModal(true);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setIsValidBackup(false);
    setBackupInfo(null);
  };

  return (
    <View style={styles.container}>
      {/* Warning Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showWarningModal}
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="warning" size={24} color="#dc2626" />
              <Text style={styles.modalTitle}>সতর্কতা</Text>
            </View>
            
            <Text style={styles.modalText}>
              আপনি কি নিশ্চিত যে আপনি ব্যাকআপ থেকে ডাটা রিস্টোর করতে চান?
            </Text>
            
            {isValidBackup && backupInfo && (
              <View style={styles.backupInfo}>
                <Text style={styles.backupInfoText}>
                  ব্যাকআপের বিবরণ:
                </Text>
                <Text style={styles.backupInfoDetail}>
                  অ্যাপ: {backupInfo.app_name}
                </Text>
                <Text style={styles.backupInfoDetail}>
                  তারিখ: {new Date(backupInfo.backup_date).toLocaleDateString()}
                </Text>
                <Text style={styles.backupInfoDetail}>
                  ভার্সন: {backupInfo.version}
                </Text>
              </View>
            )}
            
            {!isValidBackup && (
              <Text style={styles.modalWarningText}>
                ⚠️ এই ফাইলটি একটি বৈধ অ্যাপ ব্যাকআপ ফাইল নয়। রিস্টোর করা বিপজ্জনক হতে পারে।
              </Text>
            )}
            
            <Text style={styles.modalWarningText}>
              ⚠️ এটি আপনার বর্তমান সমস্ত ডাটা মুছে ফেলবে এবং ব্যাকআপ ফাইল দিয়ে প্রতিস্থাপন করবে।
            </Text>
            
            <View style={styles.modalButtons}>
              <Pressable 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWarningModal(false)}
              >
                <Text style={styles.cancelButtonText}>বাতিল</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalButton, styles.restoreModalButton]}
                onPress={handleRestore}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.restoreButtonText}>রিস্টোর করুন</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {!selectedFile ? (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="cloud-upload" size={36} color="#3b82f6" />
            </View>
            <Text style={styles.title}>ডাটা রিস্টোর</Text>
            <Text style={styles.subtitle}>
              আপনার অ্যাপের সমস্ত ডেটা এবং সেটিংস পুনরুদ্ধার করতে আপনার ব্যাকআপ
              ফাইলটি নির্বাচন করুন। আপনি যেন একটি বিশ্বস্ত উৎস থেকে पুনরুদ্ধার
              করছেন, তা নিশ্চিত করুন।
            </Text>
          </View>

          {/* File Selection Button */}
          <TouchableOpacity
            style={[styles.button, isProcessing && styles.buttonDisabled]}
            onPress={handleFilePick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="folder-open" size={20} color="white" />
                <Text style={styles.buttonText}>
                  ব্যাকআপ ফাইল নির্বাচন করুন
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.note}>
            দ্রষ্টব্য: এটি আপনার বর্তমান ডেটা মুছে ফেলবে। প্রয়োজনে আপনার কাছে
            একটি ব্যাকআপ আছে কিনা, তা নিশ্চিত করুন।
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <FontAwesome name="file-zip-o" size={36} color={isValidBackup ? "#10b981" : "#ef4444"} />
            </View>
            <Text style={styles.fileName}>{selectedFile?.name}</Text>
            <Text style={styles.subtitle}>
              ফাইলের সাইজ: {selectedFile?.size}
            </Text>
            
            {/* Validation Status */}
            <View style={[
              styles.validationStatus, 
              isValidBackup ? styles.validStatus : styles.invalidStatus
            ]}>
              <Ionicons 
                name={isValidBackup ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={isValidBackup ? "#10b981" : "#ef4444"} 
              />
              <Text style={[
                styles.validationText,
                { color: isValidBackup ? "#10b981" : "#ef4444" }
              ]}>
                {isValidBackup ? "বৈধ ব্যাকআপ ফাইল" : "অবৈধ ব্যাকআপ ফাইল"}
              </Text>
            </View>
            
            {/* Backup Info */}
            {isValidBackup && backupInfo && (
              <View style={styles.backupInfoContainer}>
                <Text style={styles.backupInfoTitle}>ব্যাকআপের বিবরণ:</Text>
                <Text style={styles.backupInfoText}>অ্যাপ: {backupInfo.app_name}</Text>
                <Text style={styles.backupInfoText}>তারিখ: {new Date(backupInfo.backup_date).toLocaleDateString()}</Text>
                <Text style={styles.backupInfoText}>ভার্সন: {backupInfo.version}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSelection}
            >
              <Ionicons name="close-circle" size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>

          {/* Restore Button - Only shown when file is selected */}
          {isValidBackup && <TouchableOpacity
            style={[
              styles.restoreButton,
              isProcessing && styles.buttonDisabled,
              !isValidBackup && styles.invalidRestoreButton
            ]}
            onPress={showRestoreWarning}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>ডাটা রিস্টোর করুন</Text>
              </>
            )}
          </TouchableOpacity>}
          <Text style={isValidBackup ? styles.note : styles.invalidNote}>
            {isValidBackup ? 'দ্রষ্টব্য: এটি আপনার বর্তমান ডেটা মুছে ফেলবে। প্রয়োজনে আপনার কাছে একটি ব্যাকআপ আছে কিনা, তা নিশ্চিত করুন।' :
            'দ্রষ্টব্য: এই ফাইলটি একটি এই অ্যাপের ব্যাকআপ ফাইল নয়। আপনি এটি রিস্টোর করতে পারবে না।'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    backgroundColor: "white",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e9ecef",
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: "bangla_bold",
    color: "#3b82f6",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "bangla_regular",
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "90%",
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    maxWidth: 300,
    marginBottom: 16,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: "100%",
    maxWidth: 300,
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  invalidRestoreButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontFamily: "bangla_medium",
    marginLeft: 10,
    fontSize: 16,
  },
  fileName: {
    fontFamily: "bangla_medium",
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  clearButton: {
    padding: 4,
    position: "absolute",
    top: 0,
    right: 0,
  },
  note: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 24,
    maxWidth: "90%",
  },
  invalidNote: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#ef4444",
    textAlign: "center",
    marginTop: 24,
    maxWidth: "90%",
  },
  validationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  validStatus: {
    backgroundColor: "#f0fdf4",
  },
  invalidStatus: {
    backgroundColor: "#fef2f2",
  },
  validationText: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    marginLeft: 6,
  },
  backupInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: "100%",
  },
  backupInfoTitle: {
    fontFamily: "bangla_bold",
    fontSize: 14,
    color: "#334155",
    marginBottom: 6,
  },
  backupInfoText: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "bangla_bold",
    fontSize: 20,
    color: "#1f2937",
    marginLeft: 8,
  },
  modalText: {
    fontFamily: "bangla_regular",
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 12,
    lineHeight: 24,
  },
  backupInfo: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  backupInfoDetail: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#0c4a6e",
    marginBottom: 2,
  },
  modalWarningText: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    color: "#dc2626",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  restoreModalButton: {
    backgroundColor: "#10b981",
  },
  cancelButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    color: "#4b5563",
  },
  restoreButtonText: {
    fontFamily: "bangla_medium",
    fontSize: 14,
    color: "white",
  },
});