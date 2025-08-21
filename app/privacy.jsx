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
        <Text style={styles.listItem}>• আপনি প্রবেশ করানো আর্থিক লেনদেনের তথ্য</Text>
        <Text style={styles.listItem}>• অ্যাপ্লিকেশন বিশ্লেষণের জন্য ডিভাইস তথ্য</Text>
        <Text style={styles.listItem}>• অ্যাপ ব্যবহারের পরিসংখ্যান</Text>

        <Text style={styles.sectionTitle}>২. আমরা আপনার তথ্য কিভাবে ব্যবহার করি</Text>
        <Text style={styles.sectionText}>
          আমরা সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করি:
        </Text>
        <Text style={styles.listItem}>• আমাদের সেবা প্রদান ও উন্নয়ন</Text>
        <Text style={styles.listItem}>• ব্যক্তিগতকৃত আর্থিক বিশ্লেষণ তৈরি</Text>
        <Text style={styles.listItem}>• অ্যাপ নিরাপত্তা বৃদ্ধি ও প্রতারণা রোধ</Text>
        <Text style={styles.listItem}>• গুরুত্বপূর্ণ আপডেট জানানো</Text>

        <Text style={styles.sectionTitle}>৩. তথ্য সুরক্ষা</Text>
        <Text style={styles.sectionText}>
          আমরা শিল্প-মানের নিরাপত্তা ব্যবস্থা প্রয়োগ করি:
        </Text>
        <Text style={styles.listItem}>• সংবেদনশীল তথ্যের জন্য এন্ড-টু-এন্ড এনক্রিপশন</Text>
        <Text style={styles.listItem}>• নিয়মিত নিরাপত্তা অডিট</Text>
        <Text style={styles.listItem}>• নিরাপদ সার্ভার অবকাঠামো</Text>

        <Text style={styles.sectionTitle}>৪. তৃতীয় পক্ষের সেবা</Text>
        <Text style={styles.sectionText}>
          আমরা নিম্নলিখিত তৃতীয় পক্ষের সেবা ব্যবহার করতে পারি:
        </Text>
        <Text style={styles.listItem}>• অ্যাপ ব্যবহার বিশ্লেষণের জন্য গুগল অ্যানালিটিক্স</Text>
        <Text style={styles.listItem}>• ক্রাশ রিপোর্টিংয়ের জন্য ফায়ারবেস</Text>
        <Text style={styles.listItem}>• নিরাপদ তথ্য সংরক্ষণের জন্য AWS</Text>

        <Text style={styles.sectionTitle}>৫. আপনার অধিকার</Text>
        <Text style={styles.sectionText}>
          আপনার নিম্নলিখিত অধিকার রয়েছে:
        </Text>
        <Text style={styles.listItem}>• আপনার ব্যক্তিগত তথ্য দেখার অধিকার</Text>
        <Text style={styles.listItem}>• আপনার তথ্য মুছে ফেলার অনুরোধ করার অধিকার</Text>
        <Text style={styles.listItem}>• তথ্য সংগ্রহ থেকে বিরত থাকার অধিকার</Text>
        <Text style={styles.listItem}>• যে কোন সময় সম্মতি প্রত্যাহারের অধিকার</Text>

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
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 28,
    marginBottom: 12,
    textAlign: 'right',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#4b5563',
    marginBottom: 12,
    textAlign: 'right',
  },
  listItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 8,
    textAlign: 'right',
    paddingRight: 16,
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
    elevation: 3,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
    textAlign: 'right',
  },
  contactText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'right',
  },
  contactButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  contactButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  updateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 32,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
});