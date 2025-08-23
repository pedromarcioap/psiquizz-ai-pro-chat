import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';

// Configuração do Firebase (substituir com suas credenciais)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Serviços do Firebase
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;

// Funções de Quizz
export const saveQuiz = async (userId, quizData) => {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      userId,
      ...quizData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Erro ao salvar quiz: ", e);
    throw e;
  }
};

export const getQuizzes = async (userId) => {
  try {
    const q = query(collection(db, "quizzes"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const quizzes = [];
    querySnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...doc.data() });
    });
    return quizzes;
  } catch (e) {
    console.error("Erro ao buscar quizzes: ", e);
    throw e;
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    await deleteDoc(doc(db, "quizzes", quizId));
  } catch (e) {
    console.error("Erro ao deletar quiz: ", e);
    throw e;
  }
};

export const updateQuiz = async (quizId, newData) => {
  try {
    const quizRef = doc(db, "quizzes", quizId);
    await updateDoc(quizRef, newData);
  } catch (e) {
    console.error("Erro ao atualizar quiz: ", e);
    throw e;
  }
};

// Funções de Desempenho (para quizzes de prova)
export const savePerformance = async (userId, performanceData) => {
  try {
    const docRef = await addDoc(collection(db, "performance"), {
      userId,
      ...performanceData,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Erro ao salvar desempenho: ", e);
    throw e;
  }
};

export const getPerformance = async (userId) => {
  try {
    const q = query(collection(db, "performance"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const performanceData = [];
    querySnapshot.forEach((doc) => {
      performanceData.push({ id: doc.id, ...doc.data() });
    });
    return performanceData;
  } catch (e) {
    console.error("Erro ao buscar desempenho: ", e);
    throw e;
  }
};