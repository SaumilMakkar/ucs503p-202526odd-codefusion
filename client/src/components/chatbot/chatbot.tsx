import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatbotMutation } from "@/features/chatbot/chatbotAPI";
import { toast } from "sonner";

/**
 * Chatbot message interface
 */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Production-ready Chatbot component with green logo
 * Features:
 * - Floating button with green circular logo
 * - Slide-up chat window
 * - Conversation history
 * - Real-time typing indicators
 * - Error handling
 * - Responsive design
 */
export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for the Expense Tracker. I can help you with questions about features, how to use the app, technical details, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sendMessage, { isLoading: isChatting }] = useChatbotMutation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Handles sending a message to the chatbot
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isChatting) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message to UI immediately
    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setConversationHistory(updatedMessages);

    try {
      // Call chatbot API
      const response = await sendMessage({
        message: userMessage,
        conversationHistory: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      }).unwrap();

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(response.data.timestamp),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setConversationHistory(finalMessages);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      // Extract error message
      let errorMsg = "I'm sorry, I encountered an error. Please try again in a moment.";
      
      if (error?.data?.message) {
        errorMsg = error.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.error) {
        errorMsg = error.error;
      }
      
      // Handle network errors
      if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
        errorMsg = "Unable to connect to the chatbot service. Please check your internet connection and try again.";
      }
      
      // Add error message
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: errorMsg,
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, errorMessage]);
      toast.error(errorMsg);
    }
  };

  /**
   * Handles Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Clears conversation history
   */
  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI assistant for the Expense Tracker. I can help you with questions about features, how to use the app, technical details, and more. What would you like to know?",
        timestamp: new Date(),
      },
    ]);
    setConversationHistory([]);
  };

  return (
    <>
      {/* Floating Chatbot Button - Green circular logo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-green-500 hover:bg-green-600",
          "text-white shadow-lg hover:shadow-xl",
          "transition-all duration-300 ease-in-out",
          "flex items-center justify-center",
          "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
          isOpen && "scale-90"
        )}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-96 h-[600px]",
            "bg-white dark:bg-gray-900",
            "rounded-lg shadow-2xl",
            "border border-gray-200 dark:border-gray-800",
            "flex flex-col",
            "animate-in slide-in-from-bottom-5 duration-300"
          )}
        >
          {/* Chat Header - White box with green accent */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  AI Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expense Tracker Helper
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="text-xs"
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.role === "user"
                          ? "text-green-100"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isChatting && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-lg">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the app..."
                disabled={isChatting}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isChatting}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="icon"
              >
                {isChatting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
};

