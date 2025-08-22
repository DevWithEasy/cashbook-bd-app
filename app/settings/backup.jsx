import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as fflate from "fflate";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const APP_DIR = FileSystem.documentDirectory;
const BUSINESS_FILE = "business.json";
const BOOK_FILE = "books.json";
const CATEGORIES_FILE = "categories.json";
const APP_SETTINGS_FILE = "settings.json";
const BACKUP_DIR = APP_DIR + "backups/";

const BACKUP_SIGNATURE = "CASHBOOK_APP_BD_v1";

export default function Backup() {
  const [isProcessing, setIsProcessing] = useState(false);

  // অ্যাপের সমস্ত ফাইল লিস্ট
  const getAllAppFiles = async () => {
    try {
      // প্রধান ফাইলগুলো
      const mainFiles = [
        BUSINESS_FILE,
        BOOK_FILE,
        CATEGORIES_FILE,
        APP_SETTINGS_FILE,
      ];

      // বই ফাইলগুলো যোগ করুন
      try {
        const bookContent = await FileSystem.readAsStringAsync(
          APP_DIR + BOOK_FILE
        );
        const books = JSON.parse(bookContent);
        const booksFiles = books.map((book) => `book_${book.id}.json`);

        // সমস্ত ফাইল একত্রিত করুন
        const allFiles = [...mainFiles, ...booksFiles];

        // শুধুমাত্র বিদ্যমান ফাইলগুলো ফিল্টার করুন
        const existingFiles = [];

        for (const file of allFiles) {
          try {
            const exists = await FileSystem.getInfoAsync(APP_DIR + file);
            if (exists.exists) {
              existingFiles.push(file);
            }
          } catch (error) {
            console.error(`Error checking file ${file}:`, error);
          }
        }

        return existingFiles;
      } catch (error) {
        console.error("Error reading books file:", error);
        // শুধুমাত্র প্রধান ফাইলগুলো চেক করুন
        const existingMainFiles = [];
        for (const file of mainFiles) {
          try {
            const exists = await FileSystem.getInfoAsync(APP_DIR + file);
            if (exists.exists) {
              existingMainFiles.push(file);
            }
          } catch (error) {
            console.error(`Error checking file ${file}:`, error);
          }
        }
        return existingMainFiles;
      }
    } catch (error) {
      console.error("Error getting app files:", error);
      return [];
    }
  };

  const ensureBackupDirExists = async () => {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }
  };

  const createBackup = async () => {
    setIsProcessing(true);
    try {
      await ensureBackupDirExists();

      const fileNames = await getAllAppFiles();

      if (fileNames.length === 0) {
        Alert.alert("তথ্য", "ব্যাকআপ করার জন্য কোনো ডাটা পাওয়া যায়নি");
        return null;
      }

      const fileContents = {};
      let hasError = false;
      let filesFound = 0;

      for (const fileName of fileNames) {
        try {
          const filePath = APP_DIR + fileName;
          const content = await FileSystem.readAsStringAsync(filePath, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          fileContents[fileName] = content;
          filesFound++;
          console.log(`Added to backup: ${fileName}`);
        } catch (error) {
          console.error(`Error reading file ${fileName}:`, error);
          hasError = true;
        }
      }

      if (filesFound === 0) {
        Alert.alert("তথ্য", "ব্যাকআপ করার জন্য কোনো ডাটা পাওয়া যায়নি");
        return null;
      }

      if (hasError) {
        Alert.alert(
          "সতর্কতা",
          "কিছু ফাইল পড়া যায়নি, ব্যাকআপটি অসম্পূর্ণ হতে পারে"
        );
      }

      // ভেরিফিকেশন ফাইল যোগ করুন
      fileContents["backup_signature.json"] = JSON.stringify({
        signature: BACKUP_SIGNATURE,
        app_name: "Cashbook BD",
        backup_date: new Date().toISOString(),
        version: "1.0.0"
      });

      // ফাইল কন্টেন্টগুলোকে Buffer-এ কনভার্ট করুন
      const fileBuffers = {};
      Object.keys(fileContents).forEach((key) => {
        fileBuffers[key] = fflate.strToU8(fileContents[key]);
      });

      const zipData = fflate.zipSync(fileBuffers);

      // ফাইলনেমে তারিখ যোগ করুন
      const date = new Date();
      const dateStr = date.toISOString().split("T")[0];
      const timeStr = date.toTimeString().split(" ")[0].replace(/:/g, "-");
      const zipFileName = `cashbookbd_backup_${dateStr}_${timeStr}.zip`;

      const zipPath = BACKUP_DIR + zipFileName;

      // Base64 এনকোড করে ফাইল হিসেবে সেভ করুন
      const base64Zip = Buffer.from(zipData).toString("base64");

      await FileSystem.writeAsStringAsync(zipPath, base64Zip, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Alert.alert(
        "সফল",
        `ব্যাকআপ সফলভাবে তৈরি হয়েছে! ${filesFound}টি ফাইল সংরক্ষণ করা হয়েছে।`
      );
      return zipPath;
    } catch (error) {
      console.error("Backup error:", error);
      Alert.alert(
        "ত্রুটি",
        "ব্যাকআপ তৈরি করতে ব্যর্থ হয়েছে: " + error.message
      );
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const shareBackup = async () => {
    const zipPath = await createBackup();
    if (!zipPath) return;

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipPath, {
          mimeType: "application/zip",
          dialogTitle: "অ্যাপ ব্যাকআপ শেয়ার করুন",
          UTI: "public.zip-archive",
        });
      } else {
        Alert.alert("ত্রুটি", "আপনার ডিভাইসে শেয়ারিং সাপোর্ট করে না");
      }
    } catch (error) {
      console.error("Sharing error:", error);
      Alert.alert("ত্রুটি", "ব্যাকআপ শেয়ার করতে ব্যর্থ হয়েছে");
    }
  };

  const saveBackupToDevice = async () => {
    setIsProcessing(true);
    try {
      const zipPath = await createBackup();
      if (!zipPath) return;

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (!permissions.granted) {
          Alert.alert(
            "অনুমতি প্রয়োজন",
            "ব্যাকআপ সংরক্ষণ করতে অনুগ্রহ করে অনুমতি দিন"
          );
          return;
        }

        const base64Content = await FileSystem.readAsStringAsync(zipPath, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const fileName = zipPath.split("/").pop();
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "application/zip"
        );

        await FileSystem.writeAsStringAsync(newUri, base64Content, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(
          "সফল",
          `${fileName} নামে ডিভাইসে ব্যাকআপ সংরক্ষণ করা হয়েছে`
        );
      } else if (Platform.OS === "ios") {
        const result = await Share.share({
          url: `file://${zipPath}`,
          title: "ব্যাকআপ সংরক্ষণ করুন",
          type: "application/zip",
        });

        if (result.action === Share.sharedAction) {
          Alert.alert("সফল", "ব্যাকআপ সফলভাবে সংরক্ষণ করা হয়েছে");
        } else if (result.action === Share.dismissedAction) {
          Alert.alert("তথ্য", "ব্যাকআপ সংরক্ষণ বাতিল করা হয়েছে");
        }
      }
    } catch (error) {
      console.error("Save to device error:", error);
      Alert.alert("ত্রুটি", "ডিভাইসে ব্যাকআপ সংরক্ষণ করতে ব্যর্থ হয়েছে");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="cloud-download" size={36} color="#3b82f6" />
          </View>
          <Text style={styles.title}>ডাটা ব্যাকআপ</Text>
          <Text style={styles.subtitle}>
            আপনার অ্যাপের সমস্ত ডেটা এবং সেটিংসের একটি ব্যাকআপ তৈরি করুন। নিরাপদ
            স্থানে সংরক্ষণ করুন যাতে ভবিষ্যতে প্রয়োজন হলে পুনরুদ্ধার করতে
            পারেন।
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, isProcessing && styles.buttonDisabled]}
          onPress={shareBackup}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="share-social" size={20} color="white" />
              <Text style={styles.buttonText}>শেয়ার করুন</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            isProcessing && styles.buttonDisabled,
          ]}
          onPress={saveBackupToDevice}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#3b82f6" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#3b82f6" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                ডিভাইসে সংরক্ষণ করুন
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          দ্রষ্টব্য: ব্যাকআপ ফাইলটি নিরাপদ স্থানে সংরক্ষণ করুন। এটি আপনার সমস্ত
          গুরুত্বপূর্ণ ডেটা ধারণ করে।
        </Text>
      </View>
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
  secondaryButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  secondaryButtonText: {
    color: "#3b82f6",
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
  note: {
    fontFamily: "bangla_regular",
    fontSize: 12,
    color: "#adb5bd",
    textAlign: "center",
    marginTop: 24,
    maxWidth: "90%",
  },
});