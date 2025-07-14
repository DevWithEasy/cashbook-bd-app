import AsyncStorage from '@react-native-async-storage/async-storage';

const saveData = async (key,value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log(`Async saveData ${e}`)
  }
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
    return null;
  } catch (e) {
    console.log(`Async saveData ${e}`)
  }
};

const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key)
  } catch(e) {
    console.log(`Async RemoveData ${e}`)
  }

  console.log('Remove Done.')
}

const clearAll = async () => {
  try {
    await AsyncStorage.clear()
  } catch(e) {
    console.log(`Async RemoveData ${e}`)
  }

  console.log('Done.')
}

export {saveData,getData,removeData,clearAll}