import React, { useState } from 'react';
import { SafeAreaView, Text, Button, StyleSheet, View} from 'react-native';
import { Card, ProgressBar } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { getDatabase, ref, set } from "firebase/database";

const database = getDatabase();

const Stack = createStackNavigator();


export default function HomeScreen() {
  const [currentHR, setCurrentHR] = useState(80);
  const [currentHRV, setCurrentHRV] = useState(30);
  const [history, setHistory] = useState([]);



  const stressLevel = currentHRV < 40 ? 'High Stress' : currentHRV < 60 ? 'Medium Stress' : 'Low Stress';
  const stressColor = stressLevel === 'High Stress' ? '#ff2c9c' : stressLevel === 'Medium Stress' ? '#FFB74D' : '#66BB6A';

  function writeUserData(userId, HR, HRV, timestamp) {
    const db = getDatabase();
    set(ref(db, 'users/' + userId), {
      hearrate: HR,
      variability: HRV,
      date : timestamp
    });
  }
  HR = currentHR;
  

  const hrProgress = (currentHR - 60) / 40; 
  const hrvProgress = (currentHRV - 30) / 70; 
  
  
  return (    
  <SafeAreaView style={styles.container}>
    <View style={styles.logoContainer}>
      <Image 
      source={require('@/assets/images/afry.png')}
      style={styles.logo}
      contentFit="cover" />
    </View>
    <Text style={styles.title}>Greta Grip</Text>
    
    {/* Heart Rate Display */}
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Heart Rate</Text>
      <View style={styles.cardContentContainer}>
        <Text style={styles.cardContent}>{currentHR} bpm</Text>
        <ProgressBar progress={hrProgress} color="#6200EE" style={styles.progressBar} />
      </View>
    </Card>

    {/* Heart Rate Variability Display */}
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>Heart Rate Variability</Text>
      <View style={styles.cardContentContainer}>
        <Text style={styles.cardContent}>{currentHRV} ms</Text>
        <ProgressBar progress={hrvProgress} color="#4CAF50" style={styles.progressBar} />
      </View>
    </Card>

    {/* Stress Level Display */}
    <Card style={[styles.card, { borderColor: stressColor }]}>
      <Text style={styles.cardTitle}>Stress Level</Text>
      <View style={styles.cardContentContainer}>
        <Text style={[styles.cardContent, { color: stressColor }]}>{stressLevel}</Text>
        <ProgressBar progress={hrvProgress} color={stressColor} style={styles.progressBar} />
      </View>
    </Card>

    <View style={styles.buttonContainer}>
      <Button title="Add Data" onPress={addNewData} color="#d69ae7" />
      <Link href="./calendar" style={styles.button}>
        History
      </Link>
      <Link href="./dailyquiz" style={styles.button}>
        Daily quiz
      </Link>
    </View>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    padding: 20,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardContentContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  cardContent: {
    fontSize: 24,
    color: '#555',
  },
  progressBar: {
    width: '100%',
    marginTop: 10,
    height: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#d69ae7',
  },
});
