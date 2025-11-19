import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private appPrefix = '@transformapp_';
  private debug = false; // Set true to log storage operations

  /** 🔹 Save data */
  async save<T>(key: string, data: T): Promise<void> {
    try {
      const jsonData = JSON.stringify({
        _version: 1,
        value: data,
      });
      await AsyncStorage.setItem(this.appPrefix + key, jsonData);
      if (this.debug) console.log(`💾 Saved [${key}]`);
    } catch (error) {
      console.error(`❌ Error saving ${key}:`, error);
      throw error;
    }
  }

  /** 🔹 Load data */
  async load<T>(key: string): Promise<T | null> {
    try {
      const jsonData = await AsyncStorage.getItem(this.appPrefix + key);
      if (!jsonData) return null;

      const parsed = JSON.parse(jsonData);
      if (parsed && typeof parsed === 'object' && 'value' in parsed) {
        if (this.debug) console.log(`📦 Loaded [${key}]`);
        return parsed.value as T;
      }

      // fallback for old format (non-versioned)
      return parsed as T;
    } catch (error) {
      console.error(`❌ Error loading ${key}:`, error);
      return null;
    }
  }

  /** 🔹 Remove a key */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.appPrefix + key);
      if (this.debug) console.log(`🧹 Removed [${key}]`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
      throw error;
    }
  }

  /** 🔹 Clear all app data */
  async clear(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(k => k.startsWith(this.appPrefix));
      await AsyncStorage.multiRemove(appKeys);
      if (this.debug) console.log('🧼 Cleared all TransformApp data');
    } catch (error) {
      console.error('❌ Error clearing storage:', error);
      throw error;
    }
  }

  /** 🔹 Get all keys (app-scoped only) */
  async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const filtered = allKeys.filter(k => k.startsWith(this.appPrefix));
      return filtered.map(k => k.replace(this.appPrefix, ''));
    } catch (error) {
      console.error('❌ Error getting keys:', error);
      return [];
    }
  }

  /** 🔹 Multi-get (returns a dictionary) */
  async multiGet(keys: string[]): Promise<Record<string, any>> {
    try {
      const prefixedKeys = keys.map(k => this.appPrefix + k);
      const items = await AsyncStorage.multiGet(prefixedKeys);

      const result: Record<string, any> = {};
      items.forEach(([key, value]) => {
        const cleanKey = key.replace(this.appPrefix, '');
        if (value) {
          try {
            const parsed = JSON.parse(value);
            result[cleanKey] = parsed?.value ?? parsed;
          } catch {
            result[cleanKey] = value;
          }
        }
      });

      if (this.debug) console.log(`📚 Multi-loaded [${keys.join(', ')}]`);
      return result;
    } catch (error) {
      console.error('❌ Error multi-getting:', error);
      return {};
    }
  }

  /** 🔹 Enable debug logging */
  enableDebug() {
    this.debug = true;
  }

  /** 🔹 Disable debug logging */
  disableDebug() {
    this.debug = false;
  }
}

export default new StorageService();
