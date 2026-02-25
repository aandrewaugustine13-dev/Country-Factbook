'use client';

import { useState, useCallback, useEffect } from 'react';
import { QUIZ_METRICS, formatMetricValue, type MetricDef } from '@/src/glossary';
import { GlossaryTip } from '@/components/GlossaryTip';

type Country = Record<string, any>;

interface Question {
  metric: MetricDef;
  a: Country;
  b: Country;
  answer: 'a' | 'b';
}

export function QuizClient({ countries }: { countries: Country[] }) {
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);

  const generateQ = useCallback(() => {
    const m = QUIZ_METRICS[Math.floor(Math.random() * QUIZ_METRICS.length)];
    const valid = countries.filter((c) => c[m.key] != null);
    if (valid.length < 2) return;
    const shuffled = [...valid].sort(() => Math.random() - 0.5);
    const a = shuffled[0];
    const b = shuffled[1];
    const aVal = Number(a[m.key]);
    const bVal = Number(b[m.key]);
    // Skip if values are identical
    if (aVal === bVal) {
      const c = shuffled[2];
      if (!c) return;
      const cVal = Number(c[m.key]);
      setQuestion({ metric: m, a, b: c, answer: aVal >= cVal ? 'a' : 'b' });
    } else {
      setQuestion({ metric: m, a, b, answer: aVal >= bVal ? 'a' : 'b' });
    }
    setResult(null);
  }, [countries]);

  useEffect(() => {
    generateQ();
  }, [generateQ]);

  const pick = (choice: 'a' | 'b') => {
    if (result || !question) return;
    const correct = choice === question.answer;
    setTotal((t) => t + 1);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const n = s + 1;
        if (n > best) setBest(n);
        return n;
      });
      setResult('correct');
    } else {
      setStreak(0);
      setResult('wrong');
    }
    setTimeout(generateQ, 1800);
  };

  if (!question) return <p style={{ textAlign: 'center', padding: '2rem' }}>Loading quiz…</p>;

  const { metric, a, b } = question;

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Higher or Lower?</h1>
      <p className="quiz-subtitle">Which country has the higher stat? Test your world knowledge.</p>

      {/* Score Display */}
      <div className="quiz-scores">
        <div className="quiz-score-box score-blue">
          <span className="quiz-score-num">{score}/{total}</span>
          <span className="quiz-score-label">Score</span>
        </div>
        <div className="quiz-score-box score-gold">
          <span className="quiz-score-num">{streak}🔥</span>
          <span className="quiz-score-label">Streak</span>
        </div>
        <div className="quiz-score-box score-purple">
          <span className="quiz-score-num">{best}</span>
          <span className="quiz-score-label">Best</span>
        </div>
      </div>

      {/* Question */}
      <div className="quiz-question">
        Which has higher <strong>{metric.label}</strong>?
        <GlossaryTip text={metric.tip} />
      </div>

      {/* Country Cards */}
      <div className="quiz-choices">
        {[
          { c: a, key: 'a' as const },
          { c: b, key: 'b' as const },
        ].map(({ c, key }) => {
          const isCorrect = result && question.answer === key;
          const isWrong = result && !isCorrect && ((result === 'correct' && question.answer !== key) || (result === 'wrong' && question.answer !== key));

          return (
            <button
              key={key}
              onClick={() => pick(key)}
              disabled={!!result}
              className={`quiz-card ${isCorrect ? 'quiz-card-correct' : ''} ${isWrong ? 'quiz-card-wrong' : ''}`}
            >
              <span className="quiz-card-flag">{c.flag_emoji}</span>
              <span className="quiz-card-name">{c.name}</span>
              <span className="quiz-card-region">{c.region}</span>
              {result && (
                <span className={`quiz-card-value ${isCorrect ? 'val-correct' : 'val-neutral'}`}>
                  {formatMetricValue(c[metric.key], metric.format)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Result Feedback */}
      {result && (
        <div className={`quiz-result ${result === 'correct' ? 'result-correct' : 'result-wrong'}`}>
          {result === 'correct'
            ? '✓ Correct!'
            : `✗ Wrong — ${question.answer === 'a' ? a.name : b.name} has ${formatMetricValue(
                (question.answer === 'a' ? a : b)[metric.key],
                metric.format
              )}`}
        </div>
      )}
    </div>
  );
}
