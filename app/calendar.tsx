import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { getDatabase, ref, get } from "firebase/database";
import { database } from '../config/firebaseConfig';
import { Calendar } from 'react-native-calendars';

type MarkedDates = {
  [date: string]: {
    selected: boolean;
    marked: boolean;
    selectedColor: string;
  };
};

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(database, 'users/user_1');
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('Fetched Data:', data);
  
          const entries = Object.keys(data).map((key) => {
            const timestamp = data[key].timestamp;
            return {
              timestamp,
              heartrate: data[key].heartrate,
              variability: data[key].variability,
            };
          });
  
          entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
          setHistory(entries);
  
          const marked: MarkedDates = {};
          entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const dateString = date.toISOString().split('T')[0]; 
            marked[dateString] = { selected: true, marked: true, selectedColor: '#A0D9D3' }; 
          });
          setMarkedDates(marked);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, []);
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>View History by Date</Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day: { dateString: string }) => {
          const selectedDate = day.dateString;
          const selectedEntries = history.filter(entry => entry.timestamp.startsWith(selectedDate));
          console.log('Selected Date:', selectedDate);
          console.log('Entries for this date:', selectedEntries);
        }}
        monthFormat={'MMMM yyyy'}  
        theme={{
          selectedDayBackgroundColor: '#A0D9D3', 
          todayTextColor: '#2D6A4F', 
          arrowColor: '#2D6A4F', 
        }}
      />

      <View style={styles.scrollContainer}>
        {history.length > 0 ? (
          history.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyTextDate}>{formatDate(entry.timestamp)}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Heart Rate:</Text>
                <Text style={styles.infoValue}>{entry.heartrate} bpm</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>HRV:</Text>
                <Text style={styles.infoValue}>{entry.variability} ms</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>

      <Link href="./" style={styles.goBack}>
        Go back
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F4F4F9',
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2D6A4F', 
  },
  scrollContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  historyItem: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A0D9D3', 
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  historyTextDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D6A4F', 
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  goBack: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A0D9D3', 
    textAlign: 'center',
  },
});
