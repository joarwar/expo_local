import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

export default function AssetExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>View History by Date</Text>
      <Link href="./" style={styles.goBack}>
      Go back
      </Link>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  goBack: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#89CFF0',
    textAlign: 'center'
  },
});

