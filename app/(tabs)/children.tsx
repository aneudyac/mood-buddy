import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig';
import { router } from 'expo-router';
import { COLLECTIONS } from '@/src/constants/collections';

type Relationship = 
  | 'Unspecified'
  | 'Biological Child'
  | 'Adopted Child'
  | 'Grandchild'
  | 'Other Family'
  | 'General Care';

export default function AddChild() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState({ pounds: '', ounces: '' });
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [relationship, setRelationship] = useState<Relationship>('Unspecified');

  const relationships: Relationship[] = [
    'Unspecified',
    'Biological Child',
    'Adopted Child',
    'Grandchild',
    'Other Family',
    'General Care'
  ];

  const handleSave = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const childData = {
        firstName,
        birthDate,
        weight,
        gender,
        relationship,
        userId,
        createdAt: new Date(),
      };

      await addDoc(collection(db, COLLECTIONS.CHILDRENS), childData);
      router.back();
    } catch (error) {
      console.error('Error saving child:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome5 name="chevron-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Child Profile</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Tell us about your child</Text>
        <Text style={styles.subtitle}>
          This helps determine the relevant HR and O2 ranges, and produce smarter insights
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name*</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthdate*</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{birthDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setBirthDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          <Text style={styles.label}>CHILD WEIGHT</Text>
          <View style={styles.weightContainer}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Pounds*</Text>
              <TextInput
                style={styles.input}
                value={weight.pounds}
                onChangeText={(text) => setWeight({ ...weight, pounds: text })}
                keyboardType="numeric"
                placeholder="Enter pounds"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Ounces*</Text>
              <TextInput
                style={styles.input}
                value={weight.ounces}
                onChangeText={(text) => setWeight({ ...weight, ounces: text })}
                keyboardType="numeric"
                placeholder="Enter ounces"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderButton,
                    gender === option && styles.genderButtonSelected
                  ]}
                  onPress={() => setGender(option as typeof gender)}
                >
                  <Text style={[
                    styles.genderButtonText,
                    gender === option && styles.genderButtonTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relationship</Text>
            <View style={styles.relationshipContainer}>
              {relationships.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.relationshipButton,
                    relationship === option && styles.relationshipButtonSelected
                  ]}
                  onPress={() => setRelationship(option)}
                >
                  <Text style={[
                    styles.relationshipButtonText,
                    relationship === option && styles.relationshipButtonTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.nextButton}
        onPress={handleSave}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <FontAwesome5 name="chevron-right" size={16} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#8CD4B9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8CD4B9',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 10,
    fontSize: 16,
  },
  weightContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#8CD4B9',
    borderRadius: 5,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#8CD4B9',
  },
  genderButtonText: {
    color: '#8CD4B9',
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  relationshipContainer: {
    gap: 10,
  },
  relationshipButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#8CD4B9',
    borderRadius: 5,
  },
  relationshipButtonSelected: {
    backgroundColor: '#8CD4B9',
  },
  relationshipButtonText: {
    color: '#8CD4B9',
    textAlign: 'center',
  },
  relationshipButtonTextSelected: {
    color: '#fff',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8CD4B9',
    padding: 15,
    margin: 20,
    borderRadius: 5,
    gap: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
