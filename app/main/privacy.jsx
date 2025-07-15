import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Privacy() {
  const contactPrivacy = () => {
    Linking.openURL('mailto:robiulawal68@gmail.com');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#0047AB']}
        style={styles.header}
      >
        <Ionicons name="shield-checkmark" size={40} color="white" />
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.headerSubtitle}>Last Updated: {new Date().toLocaleDateString()}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.sectionText}>
          HisabiFy Pro collects the following types of information:
        </Text>
        <Text style={styles.listItem}>• Financial transaction data you enter</Text>
        <Text style={styles.listItem}>• Device information for analytics</Text>
        <Text style={styles.listItem}>• App usage statistics</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.sectionText}>
          We use the collected information to:
        </Text>
        <Text style={styles.listItem}>• Provide and improve our services</Text>
        <Text style={styles.listItem}>• Generate personalized financial insights</Text>
        <Text style={styles.listItem}>• Enhance app security and prevent fraud</Text>
        <Text style={styles.listItem}>• Communicate important updates</Text>

        <Text style={styles.sectionTitle}>3. Data Security</Text>
        <Text style={styles.sectionText}>
          We implement industry-standard security measures:
        </Text>
        <Text style={styles.listItem}>• End-to-end encryption for sensitive data</Text>
        <Text style={styles.listItem}>• Regular security audits</Text>
        <Text style={styles.listItem}>• Secure server infrastructure</Text>

        <Text style={styles.sectionTitle}>4. Third-Party Services</Text>
        <Text style={styles.sectionText}>
          We may use these third-party services that have their own privacy policies:
        </Text>
        <Text style={styles.listItem}>• Google Analytics for app usage data</Text>
        <Text style={styles.listItem}>• Firebase for crash reporting</Text>
        <Text style={styles.listItem}>• AWS for secure data storage</Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.sectionText}>
          You have the right to:
        </Text>
        <Text style={styles.listItem}>• Access your personal data</Text>
        <Text style={styles.listItem}>• Request deletion of your data</Text>
        <Text style={styles.listItem}>• Opt-out of data collection</Text>
        <Text style={styles.listItem}>• Withdraw consent at any time</Text>

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Privacy Concerns?</Text>
          <Text style={styles.contactText}>
            If you have any questions about our privacy practices, please contact our Data Protection Officer.
          </Text>
          <View style={styles.contactButton} onTouchEnd={contactPrivacy}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
            <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
          </View>
        </View>

        <Text style={styles.updateText}>
          This policy may be updated periodically. We&apos;ll notify you of significant changes.
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
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 25,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    marginLeft: 15,
    marginBottom: 5,
  },
  contactBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginTop: 30,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  contactText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#34495e',
    marginBottom: 15,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
  },
  contactButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  updateText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});