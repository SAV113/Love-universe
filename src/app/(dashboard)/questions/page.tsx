'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RELATIONSHIP_QUESTIONS } from '@/lib/constants';
import { getRandomItem } from '@/lib/utils';
import { HelpCircle, Shuffle, Heart, MessageCircle } from 'lucide-react';

export default function QuestionsPage() {
  const [currentQuestion, setCurrentQuestion] = useState<string>(getRandomItem(RELATIONSHIP_QUESTIONS));
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const nextQuestion = () => {
    setIsFlipping(true);
    setTimeout(() => {
      let next: string;
      do { next = getRandomItem(RELATIONSHIP_QUESTIONS); } while (next === currentQuestion && RELATIONSHIP_QUESTIONS.length > 1);
      setHistory((prev) => [currentQuestion, ...prev].slice(0, 10));
      setCurrentQuestion(next);
      setIsFlipping(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold gradient-text flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6" /> Question Time
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">Meaningful questions to deepen your connection.</p>
      </div>

      {/* Current question card */}
      <div className="flex justify-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] p-10 border border-[var(--lavender)]/20 text-center min-h-[220px] flex flex-col items-center justify-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--rose-pink)] opacity-[0.05] blur-[80px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-[var(--lavender)] opacity-[0.05] blur-[60px] rounded-full" />
              <MessageCircle className="w-8 h-8 text-[var(--lavender)] mb-4" />
              <p className="text-xl sm:text-2xl font-medium leading-relaxed relative z-10">{currentQuestion}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      <div className="flex justify-center">
        <Button variant="romantic" size="lg" onClick={nextQuestion} disabled={isFlipping} className="group">
          <Shuffle className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          Next Question
        </Button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="max-w-md mx-auto">
          <h3 className="text-sm text-[var(--muted-foreground)] mb-3">Previous questions</h3>
          <div className="space-y-2">
            {history.map((q, i) => (
              <motion.div key={`${q}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="glass rounded-lg border border-[var(--border)] p-3 text-sm text-[var(--muted-foreground)]">
                {q}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="max-w-md mx-auto glass rounded-xl p-5 border border-[var(--border)] text-center">
        <Heart className="w-5 h-5 text-[var(--rose-pink)] mx-auto mb-2" fill="currentColor" />
        <p className="text-sm text-[var(--muted-foreground)]">
          Take turns answering. Listen with your heart. There are no wrong answers — just honest ones.
        </p>
      </div>
    </div>
  );
}

