import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { COLLECTIONS } from '@/src/constants/collections';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type Relationship = 
  | 'Unspecified'
  | 'Biological Child'
  | 'Adopted Child'
  | 'Grandchild'
  | 'Other Family'
  | 'General Care';

type WeightUnit = 'Pounds' | 'Kilograms';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  weightUnit: WeightUnit;
  weight: { kilograms: string;pounds: string; ounces: string };
  gender: 'Male' | 'Female' | 'Other';
  relationship: Relationship;
  photoURL?: string;
}


export default function Account() {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weight, setWeight] = useState({ pounds: '', ounces: '' });
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [relationship, setRelationship] = useState<Relationship>('Unspecified');
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('Pounds');
  const [kilograms, setKilograms] = useState('');
  const [photoURL, setPhotoURL] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const relationships: Relationship[] = [
    'Unspecified',
    'Biological Child',
    'Adopted Child',
    'Grandchild',
    'Other Family',
    'General Care'
  ];

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const q = query(collection(db, COLLECTIONS.CHILDRENS), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const childrenData: Child[] = [];
      querySnapshot.forEach((doc) => {
        childrenData.push({
          id: doc.id,
          firstName: doc.data().firstName,
          lastName: doc.data().lastName,
          birthDate: doc.data().birthDate.toDate(),
          weight: doc.data().weight,
          gender: doc.data().gender,
          relationship: doc.data().relationship,
          weightUnit: doc.data().weightUnit,
          photoURL: doc.data().photoURL,
        });
      });
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setFirstName(child.firstName);
    setLastName(child.lastName);
    setBirthDate(child.birthDate);
    setWeightUnit(child.weightUnit || 'Pounds');
    if (child.weightUnit === 'Kilograms') {
      setKilograms(child.weight.kilograms || '');
    } else {
      setWeight(child.weight);
    }
    setGender(child.gender);
    setRelationship(child.relationship);
    setPhotoURL(child.photoURL || '');
    setShowAddChildModal(true);
  };

  const handleSaveChild = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const childData = {
        firstName,
        lastName,
        birthDate,
        weightUnit,
        weight: weightUnit === 'Kilograms' 
          ? { kilograms } 
          : weight,
        gender,
        relationship,
        userId,
        photoURL,
        updatedAt: new Date(),
      };

      if (editingChild) {
        // Actualizar niño existente
        await updateDoc(doc(db, COLLECTIONS.CHILDRENS, editingChild.id), childData);
      } else {
        // Crear nuevo niño
        await addDoc(collection(db, COLLECTIONS.CHILDRENS), {
          ...childData,
          createdAt: new Date(),
        });
      }

      setShowAddChildModal(false);
      clearChildForm();
      loadChildren();
    } catch (error) {
      console.error('Error saving child:', error);
    }
  };

  const clearChildForm = () => {
    setFirstName('');
    setLastName('');
    setBirthDate(new Date());
    setWeight({ pounds: '', ounces: '' });
    setGender('Male');
    setRelationship('Unspecified');
    setEditingChild(null);
    setWeightUnit('Pounds');
    setKilograms('');
    setPhotoURL('');
  };

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const renderMenuItem = (title: string, onPress: () => void) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuItemText}>{title}</Text>
      <FontAwesome5 name="chevron-right" size={16} color="#999" />
    </TouchableOpacity>
  );

  const pickImage = async () => {
    Alert.alert(
      "Add Photo",
      "Choose a photo source",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Take Photo",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry, we need camera permissions to make this work!');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled) {
              await uploadImage(result.assets[0].uri);
            }
          }
        },
        {
          text: "Choose from Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Sorry, we need camera roll permissions to make this work!');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled) {
              await uploadImage(result.assets[0].uri);
            }
          }
        }
      ]
    );
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const fileName = `child_photos/${auth.currentUser?.uid}/${new Date().getTime()}`;
      const imageRef = ref(storage, fileName);
      
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      setPhotoURL(downloadURL);
      setUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Account</Text>

        {renderSectionHeader('My Account')}
        {renderMenuItem('My Profile', () => {})}
        {renderMenuItem('How-to Videos', () => {})}
        {renderMenuItem('Help and Support', () => {})}

        {renderSectionHeader('Child Profiles')}
        {children.map(child => (
          <TouchableOpacity 
            key={child.id} 
            style={styles.childItem}
            onPress={() => handleEditChild(child)}
          >
            <View style={styles.childInfo}>
              <View style={styles.avatarContainer}>
                {child.photoURL ? (
                  <Image 
                    source={{ uri: child.photoURL }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <FontAwesome5 name="child" size={20} color="#fff" />
                )}
              </View>
              <View>
                <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                <Text style={styles.childDetails}>
                  {child.birthDate.toLocaleDateString()} • {child.gender}
                </Text>
              </View>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddChildModal(true)}
        >
          <FontAwesome5 name="plus" size={16} color="#8CD4B9" />
          <Text style={styles.addButtonText}>Add child</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showAddChildModal}
        animationType="slide"
        onRequestClose={() => {
          setShowAddChildModal(false);
          clearChildForm();
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowAddChildModal(false);
                clearChildForm();
              }}
            >
              <FontAwesome5 name="chevron-left" size={20} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {editingChild ? 'Edit Child Profile' : 'New Child Profile'}
            </Text>
            <View style={{ width: 20 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tell us about your child</Text>
            <Text style={styles.modalSubtitle}>
              This helps determine the relevant HR and O2 ranges, and produce smarter insights
            </Text>

            <View style={styles.form}>
              <View style={styles.photoSection}>
                <TouchableOpacity 
                  style={styles.photoButton} 
                  onPress={pickImage}
                >
                  {photoURL ? (
                    <Image 
                      source={{ uri: photoURL }} 
                      style={styles.photoPreview} 
                    />
                  ) : (
                    <>
                      <FontAwesome5 name="camera" size={24} color="#8CD4B9" />
                      <Text style={styles.photoButtonText}>Add Photo</Text>
                    </>
                  )}
                </TouchableOpacity>
                {uploading && <ActivityIndicator size="small" color="#8CD4B9" />}
              </View>

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
                  <RNDateTimePicker
                    value={birthDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      // setShowDatePicker(false);
                      if (selectedDate) {
                        setBirthDate(selectedDate);
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Weight Unit</Text>
                <View style={styles.weightUnitContainer}>
                  {['Pounds', 'Kilograms'].map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.weightUnitButton,
                        weightUnit === unit && styles.weightUnitButtonSelected
                      ]}
                      onPress={() => setWeightUnit(unit as WeightUnit)}
                    >
                      <Text style={[
                        styles.weightUnitButtonText,
                        weightUnit === unit && styles.weightUnitButtonTextSelected
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {weightUnit === 'Kilograms' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Kilograms*</Text>
                  <TextInput
                    style={styles.input}
                    value={kilograms}
                    onChangeText={setKilograms}
                    keyboardType="numeric"
                    placeholder="Enter kilograms"
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.label}>Weight in Pounds</Text>
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
                </>
              )}

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
            onPress={handleSaveChild}
          >
            <Text style={styles.nextButtonText}>
              {editingChild ? 'Save Changes' : 'Next'}
            </Text>
            <FontAwesome5 name="chevron-right" size={16} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f8f8f8',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8CD4B9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  childName: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  addButtonText: {
    color: '#8CD4B9',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#8CD4B9',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#8CD4B9',
    marginBottom: 10,
  },
  modalSubtitle: {
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
  childDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  weightUnitContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  weightUnitButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#8CD4B9',
    borderRadius: 5,
    alignItems: 'center',
  },
  weightUnitButtonSelected: {
    backgroundColor: '#8CD4B9',
  },
  weightUnitButtonText: {
    color: '#8CD4B9',
  },
  weightUnitButtonTextSelected: {
    color: '#fff',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoButtonText: {
    color: '#8CD4B9',
    marginTop: 8,
    fontSize: 14,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
}); 