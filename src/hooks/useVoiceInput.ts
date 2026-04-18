import { useCallback, useRef, useState } from "react"
import { parseTranscriptLocally } from "../lib/insights"
import type { Category } from "../types/splitflow"

interface VoiceResult {
  amount: number | null
  description: string
  category: Category
  payerHint: string
  transcript: string
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState<VoiceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Bu tarayıcıda ses tanıma desteklenmiyor")
      return
    }

    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = "tr-TR"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript("")
      setResult(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setIsListening(false)
      // Yerel regex parse — API çağrısı yok
      const parsed = parseTranscriptLocally(text)
      setResult({ ...parsed, transcript: text })
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Ses hatası: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  function reset() {
    setTranscript("")
    setResult(null)
    setError(null)
  }

  return { isSupported, isListening, transcript, result, error, startListening, stopListening, reset }
}
