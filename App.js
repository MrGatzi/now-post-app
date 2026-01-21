import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { uploadImage, updateHtml, verifyToken } from './src/github';

const TOKEN_KEY = 'github_pat';

export default function App() {
  const [token, setToken] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });

  useEffect(() => {
    loadToken();
  }, []);

  async function loadToken() {
    try {
      const savedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (savedToken) setToken(savedToken);
    } catch (e) {
      console.error('Failed to load token:', e);
    } finally {
      setLoading(false);
    }
  }

  async function saveToken() {
    if (!tokenInput.trim()) {
      Alert.alert('Error', 'Please enter a token');
      return;
    }

    setLoading(true);
    const isValid = await verifyToken(tokenInput.trim());

    if (!isValid) {
      setLoading(false);
      Alert.alert('Error', 'Invalid token or no access to repository');
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
    setTokenInput('');
    setLoading(false);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setImage(null);
    setText('');
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  }

  async function post() {
    if (!image) {
      Alert.alert('Error', 'Please select or take a photo');
      return;
    }
    if (!text.trim()) {
      Alert.alert('Error', 'Please add some text');
      return;
    }

    setPosting(true);
    try {
      const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
      const filename = `${timestamp}.jpg`;

      await uploadImage(token, image.base64, filename);
      await updateHtml(token, filename, text.trim(), today);

      Alert.alert('Success', 'Posted to your Now page!');
      setImage(null);
      setText('');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!token) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.tokenForm}>
          <Text style={styles.title}>NowPost</Text>
          <Text style={styles.subtitle}>Enter your GitHub Personal Access Token</Text>
          <TextInput
            style={styles.input}
            placeholder="ghp_xxxxxxxxxxxx"
            value={tokenInput}
            onChangeText={setTokenInput}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={saveToken}>
            <Text style={styles.buttonText}>Save Token</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>NowPost</Text>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>{today}</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage} onLongPress={takePhoto}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="camera" size={48} color="#9ca3af" />
              <Text style={styles.placeholderText}>Tap to pick photo</Text>
              <Text style={styles.placeholderHint}>Long press for camera</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.smallButton} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.smallButtonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={pickImage}>
            <Ionicons name="images" size={20} color="#fff" />
            <Text style={styles.smallButtonText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="What's happening?"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.button, posting && styles.buttonDisabled]}
          onPress={post}
          disabled={posting}
        >
          {posting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Post to Now Page</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  date: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
    marginBottom: 16,
  },
  tokenForm: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  preview: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  placeholderText: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 16,
  },
  placeholderHint: {
    marginTop: 4,
    color: '#9ca3af',
    fontSize: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  smallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
