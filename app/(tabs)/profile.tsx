import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { router } from 'expo-router';

export default function Profile() {
  const handleSignOut = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sí, cerrar sesión",
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.email}>
          {auth.currentUser?.email}
        </Text>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  email: {
    fontSize: 18,
    marginBottom: 30,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    maxWidth: 200,
  },
  signOutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 