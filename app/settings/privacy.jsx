import { Ionicons } from '@expo/vector-icons';
import { Linking, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function Privacy() {
  const contactPrivacy = () => {
    Linking.openURL('mailto:robiulawal68@gmail.com?subject=HisabiFy Pro Privacy Inquiry');
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={48} color="white" />
        <Text style={styles.headerTitle}>গোপনীয়তা নীতি</Text>
        <Text style={styles.headerSubtitle}>সর্বশেষ আপডেট: {formattedDate}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>১. আমরা যে তথ্য সংগ্রহ করি</Text>
        <Text style={styles.sectionText}>
          ক্যাশবুক BD নিম্নলিখিত তথ্য সংগ্রহ করে:
        </Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>• আমরা আপনার কোন ডাটা সংরক্ষন করিনা।</Text>
          <Text style={styles.listItem}>• অ্যাপ্লিকেশন সকল ডাটা আপনার ফোনেই থাকে।</Text>
        </View>

        <Text style={styles.sectionTitle}>২. আপনার অধিকার</Text>
        <Text style={styles.sectionText}>
          আপনার নিম্নলিখিত অধিকার রয়েছে:
        </Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>• আপনার ব্যক্তিগত তথ্য দেখার অধিকার</Text>
          <Text style={styles.listItem}>• আপনার তথ্য মুছে ফেলার  অধিকার</Text>
          <Text style={styles.listItem}>• তথ্য সংগ্রহ থেকে বিরত থাকার অধিকার</Text>
          <Text style={styles.listItem}>• যে কোন সময় সম্মতি প্রত্যাহারের অধিকার</Text>
        </View>

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>গোপনীয়তা সংক্রান্ত প্রশ্ন?</Text>
          <Text style={styles.contactText}>
            আমাদের গোপনীয়তা অনুশীলন সম্পর্কে আপনার কোন প্রশ্ন থাকলে, অনুগ্রহ করে আমাদের ডেটা প্রোটেকশন অফিসারের সাথে যোগাযোগ করুন।
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={contactPrivacy}>
            <Ionicons name="mail-outline" size={20} color="#3b82f6" />
            <Text style={styles.contactButtonText}>গোপনীয়তা টিমে যোগাযোগ করুন</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.updateText}>
          এই নীতি পর্যায়ক্রমে আপডেট হতে পারে। উল্লেখযোগ্য পরিবর্তন সম্পর্কে আমরা আপনাকে জানাবো।
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'bangla_bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'bangla_regular',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'bangla_bold',
    color: '#3b82f6',
    marginTop: 28,
    marginBottom: 12,
    textAlign: 'left',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4b5563',
    marginBottom: 12,
    textAlign: 'left',
    fontFamily: 'bangla_regular',
  },
  listContainer: {
    marginLeft: 16,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 8,
    textAlign: 'left',
    fontFamily: 'bangla_regular',
  },
  contactBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: 'bangla_bold',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'left',
  },
  contactText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'left',
    fontFamily: 'bangla_regular',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  contactButtonText: {
    color: '#3b82f6',
    fontFamily: 'bangla_bold',
    marginLeft: 10,
  },
  updateText: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 32,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'bangla_regular',
  },
});