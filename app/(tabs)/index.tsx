import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, Button, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { ref, set, push } from "firebase/database";
import { database } from '@/app/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient'; 

export default function HomeScreen() {
  const [currentHR, setCurrentHR] = useState(80);
  const [currentHRV, setCurrentHRV] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomizedHR = Math.floor(Math.random() * (100 - 60 + 1)) + 60;
      const randomizedHRV = Math.floor(Math.random() * (100 - 30 + 1)) + 30;

      setCurrentHR(randomizedHR);
      setCurrentHRV(randomizedHRV);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function writeUserData(userId: string, HR: number, HRV: number, timestamp: string) {
    const userRef = ref(database, 'users/' + userId);
    const newEntryRef = push(userRef); 
    set(newEntryRef, {
      heartrate: HR,
      variability: HRV,
      timestamp: timestamp,
    });
  }

  const addNewData = () => {
    const timestamp = new Date().toISOString();
    writeUserData("user_1", currentHR, currentHRV, timestamp);
  };

  const hrProgress = (currentHR - 60) / 40;
  const hrvProgress = (currentHRV - 30) / 70;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#A0D9D3', '#B5E0E7']}
        style={styles.gradientBackground}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/afry.png')}
            style={styles.logo}
            contentFit="cover"
          />
        </View>
        <Text style={styles.title}>Greta Grip</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Heart Rate</Text>
          <View style={styles.cardContentContainer}>
            <Text style={styles.cardContent}>{currentHR} bpm</Text>
            <ProgressBar progress={hrProgress} color="#A0D9D3" style={styles.progressBar} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Heart Rate Variability</Text>
          <View style={styles.cardContentContainer}>
            <Text style={styles.cardContent}>{currentHRV} ms</Text>
            <ProgressBar progress={hrvProgress} color="#A0D9D3" style={styles.progressBar} />
          </View>
        </Card>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addDataButton} onPress={addNewData}>
            <Text style={styles.buttonText}>Add Data</Text>
          </TouchableOpacity>
          <Link href="./calendar" style={styles.linkButton}>
            <Text style={styles.linkButtonText}>History</Text>
          </Link>
          <Link href="./dailyquiz" style={styles.linkButton}>
            <Text style={styles.linkButtonText}>Daily quiz</Text>
          </Link>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 0,
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
    color: '#000',
    marginBottom: 20,
  },
  card: {
    marginBottom: 16,
    padding: 20,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderColor: '#A0D9D3',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D6A4F',
  },
  cardContentContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  cardContent: {
    fontSize: 24,
    color: '#333',
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
  addDataButton: {
    width: '80%',
    backgroundColor: '#2D6A4F',
    borderRadius: 10,
    marginBottom: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    width: '80%',
    padding: 14,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#2D6A4F',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  linkButtonText: {
    color: '#2D6A4F',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
