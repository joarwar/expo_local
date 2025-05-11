import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function DailyQuiz() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [result, setResult] = useState('');
  const [explanation, setExplanation] = useState('');

  const questions = [
    {
      question: 'Did you consume caffeine, alcohol, or nicotine in the last 2 hours?',
      options: ['Yes', 'No'],
      points: [2, 0],
    },
    {
      question: 'Did you engage in physical activity in the last 2 hours?',
      options: ['Yes', 'No'],
      points: [1, 0],
    },
    {
      question: 'How many hours of sleep do you get on average per night?',
      options: ['Less than 5 hours', '5-6 hours', '7-8 hours', '9+ hours'],
      points: [3, 2, 1, 0],
    },
    {
      question: 'How would you rate your sleep quality?',
      options: ['Poor', 'Ok', 'Excellent'],
      points: [2, 1, 0],
    },
  ];

  const handleAnswer = (index: number) => {
    setScore(score + questions[questionIndex].points[index]);
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      showResult();
    }
  };

  const showResult = () => {
    let result = 'Balanced';
    let explanation = '';

    if (score >= 3) {
      result = 'Moderate';
      explanation = `If you answered "Yes" to any of the following, it could be contributing to your higher than normal readings:\n\n`;
      if (questions[0].points[0] === 1) explanation += "- Consuming caffeine, alcohol, or nicotine recently.\n";
      if (questions[1].points[0] === 1) explanation += "- Not engaging in physical activity.\n";
      if (questions[2].points[0] === 3) explanation += "- Getting less than 5-6 hours of sleep.\n";
      if (questions[3].points[0] === 3) explanation += "- Rating your sleep as poor.\n";
    }

    if (score >= 5) {
      result = 'Elevated';
      explanation = `Your score suggests elevated readings. If you answered "Yes" to any of the following, it could be why:\n\n`;
      if (questions[0].points[0] === 1) explanation += "- Consuming caffeine, alcohol, or nicotine recently.\n";
      if (questions[1].points[0] === 1) explanation += "- Not engaging in physical activity.\n";
      if (questions[2].points[0] === 3) explanation += "- Getting less than 5-6 hours of sleep.\n";
      if (questions[3].points[0] === 3) explanation += "- Rating your sleep as poor.\n";
    }

    setResult(result);
    setExplanation(explanation);
    setIsQuizFinished(true);
  };

  // Reset quiz state
  const resetQuiz = () => {
    setQuestionIndex(0);
    setScore(0);
    setIsQuizFinished(false);
    setResult('');
    setExplanation('');
  };

  if (isQuizFinished) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Quiz Result</Text>
        <Text style={styles.result}>{`Your baseline result is: ${result}`}</Text>
        <Text style={styles.explanation}>{explanation}</Text>
        <Link href="./" style={styles.goBack} onPress={resetQuiz}>
          Go back
        </Link>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Daily Quiz</Text>
      <Text style={styles.question}>{questions[questionIndex].question}</Text>

      <View style={styles.optionsContainer}>
        {questions[questionIndex].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => handleAnswer(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.progress}>Question {questionIndex + 1} of {questions.length}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap', 
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    width: 120, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 16,
    marginTop: 20,
    color: '#888',
  },
  result: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  goBack: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#89CFF0'
  }
});
