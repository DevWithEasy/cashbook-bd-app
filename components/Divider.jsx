import { StyleSheet, View } from 'react-native'

export default function Divider({color}) {
  return (
    <View style={styles.divider}>
    </View>
  )
}

const styles = StyleSheet.create({
    divider : {
        height : 1,
        width : '100%',
        backgroundColor : '#b4b4b4ff',
        marginVertical : 4
    }
})