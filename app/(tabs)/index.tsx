import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig';
import { COLLECTIONS, getEmotionRecordsPath } from '../../src/constants/collections';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Emotion {
  id: number;
  emoji: string;
  name: string;
}

const emotions: Emotion[] = [
  { id: 1, emoji: '😊', name: 'Feliz' },
  { id: 2, emoji: '😢', name: 'Triste' },
  { id: 3, emoji: '😡', name: 'Enojado' },
  { id: 4, emoji: '😴', name: 'Cansado' },
  { id: 5, emoji: '😰', name: 'Ansioso' },
  { id: 6, emoji: '😐', name: 'Neutral' },
];

export default function MoodTracker() {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [description, setDescription] = useState('');
  const [myDate, setMyDate] = useState(new Date());

  const handleSaveMood = async () => {
    if (!selectedEmotion) {
      Alert.alert('Error', 'Por favor selecciona una emoción');
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      const emotionData = {
        emotionId: selectedEmotion.id,
        emoji: selectedEmotion.emoji,
        name: selectedEmotion.name,
        description,
        timestamp: new Date(),
        userId
      };

      const userEmotionsRef = collection(db, getEmotionRecordsPath(userId));
      await addDoc(userEmotionsRef, emotionData);

      Alert.alert('Éxito', 'Emoción guardada correctamente');
      setSelectedEmotion(null);
      setDescription('');
    } catch (error) {
      console.error('Error saving emotion:', error);
      Alert.alert('Error', 'No se pudo guardar la emoción');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      
      <View style={styles.emotionsGrid}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[
              styles.emotionButton,
              selectedEmotion?.id === emotion.id && styles.selectedEmotion,
            ]}
            onPress={() => setSelectedEmotion(emotion)}
          >
            <Text style={styles.emoji}>{emotion.emoji}</Text>
            <Text style={styles.emotionName}>{emotion.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Describe cómo te sientes (opcional)"
        value={description}
        onChangeText={setDescription}
        maxLength={200}
        multiline
      />

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveMood}
      >
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>

      <DateTimePicker
        value={myDate}
        mode="date"
        display="default"
        
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  emotionButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
  },
  selectedEmotion: {
    backgroundColor: '#007AFF20',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 5,
  },
  emotionName: {
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
