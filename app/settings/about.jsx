import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function About() {
  const router = useRouter()
  const openWebsite = () => {
    Linking.openURL("https://devwitheasy.vercel.app");
  };

  const contactSupport = () => {
    Linking.openURL("mailto:robiulawal68@gmail.com");
  };

  const openPrivacyPolicy = () => {
    router.push('/settings/privacy')
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.appName}>ক্যাশবুক BD</Text>
        <Text style={styles.appVersion}>Version 2.0.0</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>অ্যাপ সম্পর্কে</Text>
        <Text style={styles.description}>
          CashBook BD হল একটি সম্পূর্ণ বাংলা ভাষার ব্যবসায়িক হিসাবরক্ষণের অ্যাপ্লিকেশন। 
          এই অ্যাপের মাধ্যমে আপনি আপনার ব্যবসা পরিচালনা, নগদ লেনদেন ট্র্যাকিং এবং 
          পেশাদার রিপোর্ট তৈরি করতে পারবেন সহজেই।
        </Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.subHeading}>মূল বৈশিষ্ট্যসমূহ</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="business-outline" size={24} color="#3b82f6" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>বহু ব্যবসা ব্যবস্থাপনা</Text>
              <Text style={styles.featureDescription}>
                একাধিক ব্যবসা তৈরি ও পরিচালনা করুন। প্রতিটি ব্যবসার জন্য আলাদা হিসাব রাখুন।
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="book-outline" size={24} color="#3b82f6" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>বহু ক্যাশবুক</Text>
              <Text style={styles.featureDescription}>
                প্রতিটি ব্যবসার অধীনে একাধিক ক্যাশবুক তৈরি করুন। দৈনিক, সাপ্তাহিক বা মাসিক হিসাব আলাদাভাবে রাখুন।
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cash-outline" size={24} color="#3b82f6" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>লেনদেন ব্যবস্থাপনা</Text>
              <Text style={styles.featureDescription}>
                আয়-ব্যয়ের পূর্ণাঙ্গ রেকর্ড রাখুন। ক্যাটাগরি অনুযায়ী লেনদেন বিন্যাস করুন এবং বিশ্লেষণ করুন।
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="document-text-outline" size={24} color="#3b82f6" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>পিডিএফ রিপোর্ট</Text>
              <Text style={styles.featureDescription}>
                আপনার ব্যবসার লেনদেনের পূর্ণাঙ্গ পিডিএফ রিপোর্ট তৈরি করুন এবং শেয়ার করুন।
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="analytics-outline" size={24} color="#3b82f6" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>আয়-ব্যয় বিশ্লেষণ</Text>
              <Text style={styles.featureDescription}>
                চার্ট ও গ্রাফের মাধ্যমে আপনার আয়-ব্যয়ের বিশ্লেষণ দেখুন এবং সিদ্ধান্ত নিন।
              </Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cloud-download-outline" size={24} color="#3b82f6" />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>ডেটা ব্যাকআপ</Text>
              <Text style={styles.featureDescription}>
                আপনার সমস্ত ডেটা ব্যাকআপ করুন এবং প্রয়োজন时 পুনরুদ্ধার করুন।
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.howToUse}>
          <Text style={styles.subHeading}>কিভাবে ব্যবহার করবেন</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>১</Text>
              <Text style={styles.stepText}>প্রথমে একটি ব্যবসা প্রোফাইল তৈরি করুন</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>২</Text>
              <Text style={styles.stepText}>ব্যয় ও আয়ের ক্যাটাগরি সেটআপ করুন</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>৩</Text>
              <Text style={styles.stepText}>নতুন ক্যাশবুক তৈরি করুন</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>৪</Text>
              <Text style={styles.stepText}>দৈনিক লেনদেন যোগ করুন</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>৫</Text>
              <Text style={styles.stepText}>রিপোর্ট দেখুন এবং পিডিএফ তৈরি করুন</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heading}>ডেভেলপার তথ্য</Text>
        <Text style={styles.description}>
          Robi Awal টিম দ্বারা উন্নত। আমাদের লক্ষ্য বাংলাদেশের ছোট ও মাঝারি ব্যবসায়ীদের 
          জন্য সহজে হিসাব রাখার ব্যবস্থা করা।
        </Text>

        <View style={styles.contactContainer}>
          <Text style={styles.contactHeading}>যোগাযোগ করুন</Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={contactSupport}
          >
            <Ionicons name="mail-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>ইমেইল সাপোর্ট</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={openWebsite}>
            <Ionicons name="globe-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>ওয়েবসাইট ভিজিট করুন</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={openPrivacyPolicy}>
            <Ionicons name="shield-checkmark-outline" size={20} color="white" />
            <Text style={styles.contactButtonText}>গোপনীয়তা নীতি</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>
          © {new Date().getFullYear()} ক্যাশবুক BD. সর্বস্বত্ব সংরক্ষিত।
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#3b82f6",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    padding: 10,
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'bangla_bold',
    color: "white",
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: 'bangla_regular',
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'bangla_bold',
    color: "#2c3e50",
    marginBottom: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    fontFamily: 'bangla_bold',
    color: "#3b82f6",
    marginBottom: 15,
    marginTop: 20,
  },
  description: {
    lineHeight: 24,
    color: "#34495e",
    marginBottom: 25,
    fontFamily: 'bangla_regular',
  },
  featuresContainer: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontFamily: 'bangla_bold',
    color: "#2c3e50",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    fontFamily: 'bangla_regular',
  },
  howToUse: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    elevation: 2,
  },
  stepContainer: {
    marginLeft: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    color: 'white',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
    fontFamily: 'bangla_bold',
  },
  stepText: {
    color: "#34495e",
    flex: 1,
    fontFamily: 'bangla_regular',
  },
  contactContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    elevation: 1,
  },
  contactHeading: {
    fontSize: 18,
    fontFamily: 'bangla_bold',
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
  },
  contactButtonText: {
    color: "white",
    fontFamily: 'bangla_bold',
    marginLeft: 10,
  },
  copyright: {
    textAlign: "center",
    marginTop: 30,
    color: "#64748b",
    fontSize: 14,
    fontFamily: 'bangla_regular',
  },
});