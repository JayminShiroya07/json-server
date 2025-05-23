"use client";

import React, { useEffect, useState, useRef } from "react";

interface ChatMessage {
  sender: string;
  receiver: string;
  message: string;
  timestamp: string;
}

export default function Home() {
  const [users, setUsers] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const selectedUserIdRef = useRef<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const allMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!isConnecting) return;

    const ws = new WebSocket("ws://192.168.1.63:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("Connected");
      ws.send(JSON.stringify({ type: "register", name: userName }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "userList") {
          setUsers(data.users);
        } else if (data.type === "registered") {
          setCurrentUserId(data.userId);
        } else if (data.type === "chatMessage") {
          const chatMsg: ChatMessage = {
            sender: data.sender,
            receiver: data.receiver,
            message: data.message,
            timestamp: data.timestamp,
          };

          allMessagesRef.current.push(chatMsg);

          const selUser = selectedUserIdRef.current;
          const curUser = currentUserIdRef.current;

          if (
            selUser &&
            curUser &&
            ((chatMsg.sender === selUser && chatMsg.receiver === curUser) ||
              (chatMsg.sender === curUser && chatMsg.receiver === selUser))
          ) {
            setChatMessages((prev) => [...prev, chatMsg]);
          } else if (chatMsg.receiver === curUser) {
            setUnreadMessages((prev) => ({
              ...prev,
              [chatMsg.sender]: (prev[chatMsg.sender] || 0) + 1,
            }));
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus("Disconnected");
      setUsers([]);
      setSelectedUserId(null);
      setChatMessages([]);
    };

    ws.onerror = () => {
      setConnectionStatus("Error");
    };

    return () => {
      ws.close();
    };
  }, [isConnecting, userName]);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      const firstUser = users.find((user) => user !== currentUserId) || null;
      if (firstUser) {
        handleUserSelect(firstUser);
      }
    }
  }, [users, selectedUserId, currentUserId]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);

    const curUser = currentUserIdRef.current;
    const relevantMessages = allMessagesRef.current.filter(
      (msg) =>
        (msg.sender === userId && msg.receiver === curUser) ||
        (msg.sender === curUser && msg.receiver === userId)
    );
    setChatMessages(relevantMessages);

    setUnreadMessages((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const handleSendMessage = () => {
    if (
      !inputMessage.trim() ||
      !selectedUserId ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN ||
      !currentUserId
    ) {
      return;
    }

    const messagePayload: ChatMessage = {
      type: "chatMessage",
      sender: currentUserId,
      receiver: selectedUserId,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    wsRef.current.send(JSON.stringify(messagePayload));
    setChatMessages((prev) => [...prev, messagePayload]);
    allMessagesRef.current.push(messagePayload);
    setInputMessage("");
  };

  const handleConnect = () => {
    if (userName.trim()) {
      setIsConnecting(true);
    }
  };

  if (!currentUserId) {
    return (
      <main className="p-4 flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Enter your name to connect</h1>
        <input
          type="text"
          className="border rounded p-2 mb-4 w-64"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleConnect();
            }
          }}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleConnect}
          disabled={!userName.trim()}
        >
          Connect
        </button>
      </main>
    );
  }

  return (
    <main className="p-4 flex flex-col md:flex-row gap-4">
      <section className="md:w-1/3">
        <h1 className="text-2xl font-bold mb-4">Connected Users</h1>
        <p>Status: {connectionStatus}</p>
        {users.length === 0 ? (
          <p>No users connected.</p>
        ) : (
          <>
            <p className="mb-2 font-semibold">You: {currentUserId}</p>
            <ul className="list-disc list-inside">
              {users
                .filter((userId) => userId !== currentUserId)
                .map((userId) => (
                  <li
                    key={userId}
                    className={`cursor-pointer p-2 rounded flex justify-between items-center ${
                      userId === selectedUserId ? "bg-blue-200 font-semibold" : "hover:bg-gray-200"
                    }`}
                    onClick={() => handleUserSelect(userId)}
                  >
                    <span>{userId}</span>
                    {unreadMessages[userId] && (
                      <span className="ml-2 text-xs bg-red-500 text-white rounded-full px-2">
                        {unreadMessages[userId]}
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          </>
        )}
      </section>

      <section className="md:w-2/3 flex flex-col border rounded p-4">
        {selectedUserId ? (
          <>
            <h2 className="text-xl font-semibold mb-2">Chat with {selectedUserId}</h2>
            <div className="flex-1 overflow-y-auto border p-2 mb-2 h-64">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded ${
                      msg.sender === currentUserId ? "bg-blue-300 self-end" : "bg-gray-300 self-start"
                    } max-w-xs`}
                  >
                    <p>{msg.message}</p>
                    <small className="text-xs text-gray-600">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded p-2"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a user to start chatting.</p>
        )}
      </section>
    </main>
  );
}
