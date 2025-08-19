"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Minimize2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
}

export function HelpChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "help">("chat")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your facility booking assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()
    if (lowerInput.includes("price") || lowerInput.includes("cost")) {
      return "Our facility prices vary by location and amenities. Most facilities range from GH₵50-500 per day. Would you like me to show you available facilities in a specific area?"
    }
    if (lowerInput.includes("book") || lowerInput.includes("reserve")) {
      return "I can help you book a facility! Please tell me your preferred location, dates, and any specific requirements you have."
    }
    if (lowerInput.includes("available") || lowerInput.includes("free")) {
      return "I can check availability for you. Which area are you interested in and what dates do you need?"
    }
    if (lowerInput.includes("help") || lowerInput.includes("support")) {
      return "I'm here to help! You can ask me about facility bookings, pricing, availability, amenities, or any other questions about our platform."
    }
    return "I understand you're looking for facility information. I can help with bookings, pricing, availability, and amenities. What specific information do you need?"
  }

  const helpTopics = [
    {
      title: "How to book a facility",
      content: "Browse available facilities, select your dates, and complete the booking process.",
    },
    {
      title: "Payment methods",
      content: "We accept cash, mobile money (MTN, Vodafone, AirtelTigo, Telecel), and card payments.",
    },
    {
      title: "Cancellation policy",
      content: "Free cancellation up to 24 hours before your booking. Contact support for assistance.",
    },
    {
      title: "Facility amenities",
      content: "Each facility listing shows available amenities like WiFi, parking, kitchen, and more.",
    },
    {
      title: "Contact support",
      content: "Reach out to our support team via this chat or email support@facilityhub.com",
    },
  ]

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-[#1e3a5f] hover:bg-[#2d4a6b] text-white shadow-lg"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 100 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              height: isMinimized ? 60 : 450,
            }}
            exit={{ scale: 0, opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl border z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#1e3a5f] text-white">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">{activeTab === "chat" ? "Facility Assistant" : "Help Center"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-black/20 p-1"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-black/20 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tab Navigation */}
            {!isMinimized && (
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex-1 p-3 text-sm font-medium ${
                    activeTab === "chat"
                      ? "text-[#1e3a5f] border-b-2 border-[#1e3a5f]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <MessageCircle className="h-4 w-4 inline mr-2" />
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab("help")}
                  className={`flex-1 p-3 text-sm font-medium ${
                    activeTab === "help"
                      ? "text-[#1e3a5f] border-b-2 border-[#1e3a5f]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <HelpCircle className="h-4 w-4 inline mr-2" />
                  Help
                </button>
              </div>
            )}

            {/* Content */}
            {!isMinimized && (
              <>
                {activeTab === "chat" ? (
                  <>
                    {/* Messages */}
                    <ScrollArea className="h-64 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
                            <div
                              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                message.isBot ? "bg-gray-100 text-gray-900" : "bg-[#1e3a5f] text-white"
                              }`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Ask about facilities..."
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="sm" className="bg-[#1e3a5f] hover:bg-[#2d4a6b]">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Help Content */
                  <ScrollArea className="h-80 p-4">
                    <div className="space-y-4">
                      {helpTopics.map((topic, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">{topic.title}</h3>
                          <p className="text-sm text-gray-600">{topic.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
