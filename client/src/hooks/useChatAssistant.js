import { useState, useCallback, useRef } from "react";
import api from "../api/axios";

export default function useChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Ref to prevent race conditions during rapid message sending
  const isProcessing = useRef(false);

  const sendMessage = useCallback(
    async (text) => {
      if (isProcessing.current) return;

      isProcessing.current = true;
      const userMsg = { role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const res = await api.post("/ai/chat", {
          messages: [...messages, userMsg],
          includeContext: true,
          conversationId: currentConversationId,
        });

        const { reply, conversationId: convId } = res.data;

        if (convId && !currentConversationId) setCurrentConversationId(convId);

        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

        // Global event dispatch for UI notifications
        window.dispatchEvent(
          new CustomEvent("assistant-reply", { detail: { text: reply } }),
        );
        return reply;
      } catch (err) {
        const msg = err?.response?.data?.error || "Chat connection lost";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
        isProcessing.current = false;
      }
    },
    [messages, currentConversationId],
  );

  const loadHistory = useCallback(async (conversationId) => {
    try {
      const res = await api.get(`/ai/conversations/${conversationId}/messages`);
      setMessages(
        res.data?.messages.map((m) => ({ role: m.role, content: m.content })) ||
          [],
      );
      setCurrentConversationId(conversationId);
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    reset,
    loadHistory,
    currentConversationId,
  };
}
