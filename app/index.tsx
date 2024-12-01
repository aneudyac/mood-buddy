import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import { router } from 'expo-router';

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Éxito", "Inicio de sesión exitoso", [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("Éxito", "Cuenta creada exitosamente", [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      }
    } catch (error: any) {
      let errorMessage = "Error en la autenticación";
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El correo electrónico no es válido";
          break;
        case 'auth/user-not-found':
          errorMessage = "Usuario no encontrado";
          break;
        case 'auth/wrong-password':
          errorMessage = "Contraseña incorrecta";
          break;
        case 'auth/email-already-in-use':
          errorMessage = "Este correo ya está registrado";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña debe tener al menos 6 caracteres";
          break;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isLogin ? "Iniciar Sesión" : "Registrarse"}</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleAuth}
        >
          <Text style={styles.buttonText}>
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchButtonText}>
            {isLogin 
              ? "¿No tienes cuenta? Regístrate" 
              : "¿Ya tienes cuenta? Inicia sesión"}
          </Text>
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
  formContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchButtonText: {
    color: '#007AFF',
    textAlign: 'center',
  },
});