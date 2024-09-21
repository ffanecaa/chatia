import React, { useState } from 'react';
import './ChatBot.css';


function ChatBot() {
  const [message, setMessage] = useState([]);
  const [userInput, setUserInput] = useState("");
 
  const handleInput = (e) => {
    setUserInput(e.target.value);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const userMessage = { role: "user", content: userInput };
    const newMessage = [...message, userMessage];
    setMessage(newMessage);
    setUserInput("");
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // Clave API desde .env
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "responde como un chatbot inteligente" },
            ...newMessage,
          ],
        }),
      });
  
      if (!response.ok) {
        // Manejo de errores en caso de una respuesta no exitosa
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error.message}`);
      }
  
      const data = await response.json();
  
      // Si la API devuelve un mensaje sin usar 'choices'
      if (data.message) {
        const respoMessage = data.message; // Ajusta esto según la estructura real de la respuesta
        setMessage([...newMessage, respoMessage]);
      } else {
        console.error("Error: La respuesta no contiene el mensaje esperado.");
      }
    } catch (error) {
      // Manejo de errores detallado
      if (error.message.includes("You exceeded your current quota")) {
        const errorMessage = { role: "system", content: "Límite excedido, gestionálo" };
        setMessage([...newMessage, errorMessage]);
      } else {
        console.error("Error en la solicitud o respuesta:", error);
      }
    }
  };
  
  return (
    <div className="containerChat">
      <div className="headerChat">
        <h1>Nuestro Chat</h1>
        <div className="picture">
          <img src="./martaLogo.webp" alt="logo" />
        </div>
      </div>
      <div className="conversation">
        {message.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "userMessage" : "systemMessage"}>
            {msg.content}
          </div>
        ))}
      </div>
      <form action="" onSubmit={handleSubmit} id='form'>
        <textarea
          name="textarea"
          id="textarea"
          cols="40"
          rows="5"
          placeholder="Escribe aquí"
          onChange={handleInput}
          value={userInput}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default ChatBot;
