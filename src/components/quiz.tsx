"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Toaster, toast } from "react-hot-toast";

// TODO:
// Create a loading screen after click the last answer,
// show the result screen that contain the how many correct answer and points

// Define the interface for a trivia question
interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

function Quiz() {
  const [triviaQuestions, setTriviaQuestions] = useState<TriviaQuestion[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [allPossibleAnswers, setAllPossibleAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0); // Tracks the current question
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerCorrectness, setAnswerCorrectness] = useState<boolean | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  // Combines correct and incorrect answers into a single array
  const combineAllAnswers = (incorrectAnswers: string[], correctAnswer: string): void => {
    let allAnswers: string[] = [...incorrectAnswers, correctAnswer];
    // Randomize the order of answers in the array
    allAnswers.sort(() => Math.random() - 0.5);
    setAllPossibleAnswers(allAnswers);
  };

  // Make API call to trivia API
  const getTriviaData = async (): Promise<void> => {
    setLoading(true);

    try {
      const resp = await axios.get<{ results: TriviaQuestion[] }>("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple");

      setTriviaQuestions(resp.data.results);
      setCorrectAnswer(resp.data.results[0].correct_answer);
      combineAllAnswers(resp.data.results[0].incorrect_answers, resp.data.results[0].correct_answer);
    } catch (error) {
      console.error("Failed to fetch trivia questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTriviaData();
  }, []);

  // Resets the quiz state to start a new quiz
  const resetQuiz = (): void => {
    setCurrentPoints(0); // Reset points
    setCurrentQuestionIndex(0); // Reset question index
    setQuizFinished(false); // Set quizFinished to false
    setSelectedAnswer(null);
    setAnswerCorrectness(null);
    getTriviaData(); // Fetch new questions
  };

  // Verifies the selected answer and loads the next question
  const verifyAnswer = (selectedAnswer: string): void => {
    if (quizFinished) return; // Prevent answering if the quiz is finished

    setSelectedAnswer(selectedAnswer);
    const isCorrect = selectedAnswer === correctAnswer;
    setAnswerCorrectness(isCorrect);

    if (isCorrect) {
      setCurrentPoints((prevPoints) => prevPoints + 1);
      setCorrectAnswersCount((prevCount) => prevCount + 1); // Track correct answers
    }

    // Move to the next question
    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < triviaQuestions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        setCorrectAnswer(triviaQuestions[nextQuestionIndex].correct_answer);
        combineAllAnswers(triviaQuestions[nextQuestionIndex].incorrect_answers, triviaQuestions[nextQuestionIndex].correct_answer);

        // Reset selection and correctness for the new question
        setSelectedAnswer(null);
        setAnswerCorrectness(null);
      } else {
        setQuizFinished(true);
        //   resetQuiz();
      }
    }, 1000);
  };

  // Converts HTML entities to readable characters
  const removeCharacters = (text: string): string => {
    return text
      .replace(/(&quot\;)/g, '"')
      .replace(/(&rsquo\;)/g, "'")
      .replace(/(&#039\;)/g, "'")
      .replace(/(&amp\;)/g, "&");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <header className="App-header">
        {loading ? (
          "Trivia Question Loading..."
        ) : (
          <div>
            {!quizFinished ? (
              <>
                <div className="flex justify-between mb-3">
                  <div>Current Points: {currentPoints}</div>
                  <div>
                    Question {currentQuestionIndex + 1}/{triviaQuestions.length}
                  </div>
                </div>
                <Card className="w-[500px]">
                  {triviaQuestions.length > 0 && (
                    <>
                      <CardHeader>{removeCharacters(triviaQuestions[currentQuestionIndex].question)}</CardHeader>
                      <CardContent className="flex flex-col gap-3">
                        {allPossibleAnswers.map((answer, index) => (
                          <div key={index}>
                            <Button
                              onClick={() => verifyAnswer(answer)}
                              disabled={selectedAnswer !== null}
                              className={`w-full ${
                                selectedAnswer === answer
                                  ? answerCorrectness
                                    ? "bg-green-500" // Turn green if correct
                                    : "bg-red-800" // Turn red if incorrect
                                  : ""
                              }`}
                            >
                              {removeCharacters(answer)}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </>
                  )}
                </Card>
              </>
            ) : (
              // Show the quiz result summary when the quiz is finished
              <Card className="w-[500px] p-5">
                <h2 className="text-xl font-bold mb-4">Quiz Finished!</h2>
                <div>
                  Correct Answers: {correctAnswersCount}/{triviaQuestions.length}
                </div>
                <div>Final Score: {correctAnswersCount * 10}</div>
                <Button onClick={resetQuiz} className="mt-4 w-full">
                  Start New Quiz
                </Button>
              </Card>
            )}
          </div>
        )}
      </header>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default Quiz;
