import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';

/**
 * REPLACE this with your backend URL.
 * - If testing on the same LAN: http://192.168.1.23:3000
 * - If using Expo tunnel: use the tunnel URL your Metro shows, or your deployed backend.
 */
const BACKEND_URL = 'http://YOUR_BACKEND_IP_OR_HOST:3000';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  async function handleTakePicture() {
    try {
      // Ask for camera permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Camera permission is required to take a picture.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      // Newer API uses "canceled" and "assets"
      if (result.canceled) {
        // user cancelled
        return;
      }

      const uri = result.assets[0].uri;
      setPreviewUri(uri);
      setDiagnosis(null); // clear previous
      await uploadImageAndGetDiagnosis(uri);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while taking the photo.');
    }
  }

  async function uploadImageAndGetDiagnosis(imageUri: string) {
    setLoading(true);
    setDiagnosis(null);

    try {
      const form = new FormData();

      // required shape for FormData in RN: { uri, name, type }
      const filename = imageUri.split('/').pop() ?? 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      form.append('photo', {
        uri: Platform.OS === 'ios' && imageUri.startsWith('file://') ? imageUri : imageUri,
        name: filename,
        type: mimeType,
      } as any); // `any` to satisfy TS for RN FormData entry

      const resp = await fetch(`${BACKEND_URL}/analyze-sparkplug`, {
        method: 'POST',
        body: form,
        // NOTE: DO NOT set Content-Type header here — let fetch set the multipart boundary
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('Backend error', resp.status, text);
        throw new Error('Server returned an error');
      }

      const json = await resp.json();
      // Assume backend returns { text: "diagnosis..." }
      setDiagnosis(json.text ?? 'No diagnosis returned.');
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Upload failed',
        'Could not upload the photo or get a diagnosis. Make sure your backend is running and reachable.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#100852ff' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Check spark plug</ThemedText>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={handleTakePicture} style={styles.iconButton}>
            <MaterialIcons name="camera-alt" size={40} color="#000" />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={styles.hintText}>Tap the camera to take a photo and analyze the plug.</Text>
          )}
        </View>

        {previewUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: previewUri }} style={styles.previewImage} />
          </View>
        ) : null}

        {diagnosis ? (
          <ThemedView style={styles.diagnosisBox}>
            <ThemedText type="subtitle">Diagnosis</ThemedText>
            <ThemedText>{diagnosis}</ThemedText>
          </ThemedView>
        ) : null}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 10,
  },
  hintText: {
    marginLeft: 8,
  },
  previewWrap: {
    marginTop: 12,
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  diagnosisBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
});
