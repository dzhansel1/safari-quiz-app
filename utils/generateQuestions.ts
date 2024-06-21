import { IQuestion } from "./createQuiz";
import { firestore } from "@/app/config/initFirebase";
import { addDoc, collection } from "firebase/firestore";
import questions from '../questions.json'
export const generateQuestions = async () => {
    const gamesRef = collection(firestore, 'questions');
    await Promise.all(
        questions.map(async (question) => {
            await addDoc(gamesRef, question);
        })
    );
};