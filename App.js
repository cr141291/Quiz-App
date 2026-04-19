import React, { useState } from "react";
import { SafeAreaView, Text, Button, ScrollView } from "react-native";
import { ButtonGroup } from "react-native-elements";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();
const questionsData = [
  {
    prompt: "Question 1: Is Harry Potter a wizard?",
    type: "true-false",
    choices: ["Yes", "No"],
    correct: 0,
  },
  {
    prompt:
      "Question 2: Which of these characters are friends with Harry Potter?",
    type: "multiple-answer",
    choices: ["Ron", "Draco", "Hermione", "Voldemort"],
    correct: [0, 2],
  },
  {
    prompt: "Question 3: What Hogwarts house is Harry Potter in?",
    type: "multiple-choice",
    choices: ["Slytherin", "Hufflepuff", "Gryffindor", "Ravenclaw"],
    correct: 2,
  },
];

export const Question = ({
  route,
  navigation,
  answers,
  setAnswers,
}) => {
  const { currentIndex = 0 } = route.params;
  const question = questionsData[currentIndex];

  const [selectedAnswer, setSelectedAnswer] = useState(
    question.type === "multiple-answer" ? [] : null
  );

  const handleSelection = (selectedIndex) => {
    if (question.type === "multiple-answer") {
      setSelectedAnswer((prevSelected) => {
        if (prevSelected.includes(selectedIndex)) {
          return prevSelected.filter((index) => index !== selectedIndex);
        } else {
          return [...prevSelected, selectedIndex];
        }
      });
    } else {
      setSelectedAnswer(selectedIndex);
    }
  };

  const handleNext = () => {
    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        questionIndex: currentIndex,
        selectedAnswer,
      },
    ]);

    if (currentIndex + 1 < questionsData.length) {
      navigation.replace("Question", {
        currentIndex: currentIndex + 1,
      });
    } else {
      navigation.replace("Summary");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>
        {question.prompt}
      </Text>

      <ButtonGroup
        onPress={handleSelection}
        selectedIndex={
          question.type !== "multiple-answer"
            ? selectedAnswer
            : undefined
        }
        selectedIndexes={
          question.type === "multiple-answer"
            ? selectedAnswer
            : undefined
        }
        buttons={question.choices}
        vertical
        testID="choices"
      />

      <Button
        title={
          currentIndex === questionsData.length - 1
            ? "View Summary"
            : "Next Question"
        }
        onPress={handleNext}
        testID="next-question"
      />
    </SafeAreaView>
  );
};

export const Summary = ({ answers }) => {
  const calculateScore = () => {
    return answers.reduce((score, answer) => {
      const question = questionsData[answer.questionIndex];

      const correct = Array.isArray(question.correct)
        ? answer.selectedAnswer.length === question.correct.length &&
          answer.selectedAnswer.every((ans) =>
            question.correct.includes(ans)
          )
        : question.correct === answer.selectedAnswer;

      return score + (correct ? 1 : 0);
    }, 0);
  };

  const renderAnswers = () => {
    return questionsData.map((question, index) => {
      const answer = answers.find(
        (ans) => ans.questionIndex === index
      );

      if (!answer) return null;

      const correct = Array.isArray(question.correct)
        ? answer.selectedAnswer.length === question.correct.length &&
          answer.selectedAnswer.every((ans) =>
            question.correct.includes(ans)
          )
        : question.correct === answer.selectedAnswer;

      return (
        <SafeAreaView
          key={index}
          style={{
            marginBottom: 20,
            padding: 10,
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            {question.prompt}
          </Text>

          <Text
            style={{
              fontWeight: "bold",
              color: correct ? "green" : "red",
              marginBottom: 10,
            }}
          >
            {correct ? "Correct" : "Incorrect"}
          </Text>

          {question.choices.map((choice, i) => {
            const isCorrectChoice = Array.isArray(question.correct)
              ? question.correct.includes(i)
              : question.correct === i;

            const isSelectedChoice = Array.isArray(answer.selectedAnswer)
              ? answer.selectedAnswer.includes(i)
              : answer.selectedAnswer === i;

            return (
              <Text
                key={i}
                style={{
                  fontWeight: isCorrectChoice ? "bold" : "normal",
                  textDecorationLine:
                    isSelectedChoice && !isCorrectChoice
                      ? "line-through"
                      : "none",
                  color:
                    isSelectedChoice && !isCorrectChoice
                      ? "red"
                      : "black",
                  marginBottom: 5,
                }}
              >
                {choice}
              </Text>
            );
          })}
        </SafeAreaView>
      );
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text
        testID="total"
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Total Score: {calculateScore()} / {questionsData.length}
      </Text>

      <ScrollView>{renderAnswers()}</ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  const [answers, setAnswers] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Question">
          {(props) => (
            <Question
              {...props}
              answers={answers}
              setAnswers={setAnswers}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Summary">
          {(props) => (
            <Summary
              {...props}
              answers={answers}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;