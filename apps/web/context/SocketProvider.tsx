"use client";
import React, { useState, useCallback, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import shortid from 'shortid';

interface SocketProviderProps {
  children?: React.ReactNode;
}

interface Message {
  text: string;
  sender: string;
  sendTime: Date;
}

interface ISocketContext {
  sendMessage: (msg: Message) => any;
  messages: Message[];
  userId: string;
}

// context for socket
const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error("socket state is undfined");
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Message[]>([]);

  const userId = localStorage.getItem('userId') || shortid.generate(); // Retrieve or generate user ID

  useEffect(() => {
    localStorage.setItem('userId', userId); // Save the user ID to local storage
  }, [userId]);

  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Send message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  const onMessageRec = useCallback((msg: string) => {
    const { message } = JSON.parse(msg) as { message: Message };
    console.log("Parsed From Server Msg Rec", message);

    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("message", onMessageRec);
    setSocket(_socket);

    return () => {
      _socket.off("message", onMessageRec);
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);
  return (
    <SocketContext.Provider value={{ sendMessage, messages, userId }}>
      {children}
    </SocketContext.Provider>
  );
};
