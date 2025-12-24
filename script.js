import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔐 КОД ДОСТУПА
const ACCESS_CODE = "V333K"; // Замени на свой код

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCqAiRfMeB6Nclh5Gb8QS1VyqAtNNebH4g",
  authDomain: "private-chat-5b3d9.firebaseapp.com",
  projectId: "private-chat-5b3d9",
  storageBucket: "private-chat-5b3d9.firebasestorage.app",
  messagingSenderId: "440322143572",
  appId: "1:440322143572:web:76af6a554a1f4ad3ba44c1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 Проверка кода доступа
window.checkCode = async function () {
  const input = document.getElementById("codeInput").value.trim();

  if (input !== ACCESS_CODE) {
    document.getElementById("error").textContent = "Неверный код";
    return;
  }

  document.getElementById("login").style.display = "none";
  document.getElementById("chatSection").style.display = "block";

  try {
    await signInAnonymously(auth);  // Аутентификация
    startChat();
  } catch (error) {
    console.error("Ошибка аутентификации:", error); // Логируем ошибку аутентификации
    alert("Ошибка при аутентификации. Попробуйте снова.");
  }
};

// 💬 Запуск чата
function startChat() {
  const messagesRef = collection(db, "rooms", "V333K", "messages"); // Обрати внимание на правильное название коллекции
  const q = query(messagesRef, orderBy("createdAt"));

  // Отображаем сообщения
  onSnapshot(q, (snapshot) => {
    const chat = document.getElementById("chat");
    chat.innerHTML = "";  // Очищаем чат перед добавлением новых сообщений

    snapshot.forEach((doc) => {
      const messageData = doc.data();
      const div = document.createElement("div");
      div.className = "message";
      
      // Проверяем, чей это был пользователь
      if (messageData.uid === auth.currentUser.uid) {
        div.classList.add("message-right");
      } else {
        div.classList.add("message-left");
      }
      
      div.textContent = messageData.text;

      // Время
      const time = new Date(messageData.createdAt.seconds * 1000); // Преобразуем время в формат Date
      const timeString = time.toLocaleTimeString(); // Время в строковом формате

      const timeElement = document.createElement("div");
      timeElement.className = "message-time";
      timeElement.textContent = timeString;
      
      div.appendChild(timeElement);
      chat.appendChild(div);
    });

    // Прокручиваем чат вниз
    setTimeout(() => {  // Добавляем небольшую задержку для корректной прокрутки
      chat.scrollTop = chat.scrollHeight;
    }, 100); // 100ms задержка для стабильности
  });

  // Добавление события для кнопки отправки сообщения
  const sendButton = document.getElementById("sendBtn");
  const messageInput = document.getElementById("messageInput");

  sendButton.addEventListener("click", async () => {
    if (!messageInput.value.trim()) {
      alert("Введите сообщение!");  // Предупреждаем, если сообщение пустое
      return;
    }

    try {
      // Отправка сообщения в Firestore
      await addDoc(messagesRef, {
        text: messageInput.value,
        uid: auth.currentUser.uid,  // Получаем UID текущего пользователя
        createdAt: serverTimestamp() // Время создания сообщения
      });

      console.log("Сообщение отправлено");
      messageInput.value = "";  // Очищаем поле ввода
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);  // Логируем ошибку, если она есть
      alert("Ошибка при отправке сообщения. Попробуйте снова.");
    }
  });
}
