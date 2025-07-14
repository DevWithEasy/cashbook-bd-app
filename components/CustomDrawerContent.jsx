import { View, Text, Image, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";

export default function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.appName}>HisabiFy Pro</Text>
        <Text style={styles.appTagline}>Your Finance Manager</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
    backgroundColor: 'white',
    padding: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 5,
  },
  appTagline: {
    fontSize: 14,
    color: '#737475ff',
  },
});