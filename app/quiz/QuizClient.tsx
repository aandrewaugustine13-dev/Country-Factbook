'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { QUIZ_METRICS, formatMetricValue, type MetricDef } from '@/src/glossary';
import { COMPARISON_PRESETS } from '@/src/presets';
import { GlossaryTip } from '@/components/GlossaryTip';

type Country = Record<string, any>;

const REGIONS = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

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
  const [region, setRegion] = useState('All');
  const [presetName, setPresetName] = useState<string | null>(null);

  // Filter countries based on region or preset
  const pool = useMemo(() => {
    if (presetName) {
      const preset = COMPARISON_PRESETS.find(p => p.name === presetName);
      if (preset) {
        return countries.filter(c => preset.codes.includes(c.code));
      }
    }
    if (region !== 'All') {
      return countries.filter(c => c.region === region);
    }
    return countries;
  }, [countries, region, presetName]);

  const generateQ = useCallback(() => {
    if (pool.length < 2) return;
    const m = QUIZ_METRICS[Math.floor(Math.random() * QUIZ_METRICS.length)];
    const valid = pool.filter((c) => c[m.key] != null);
    if (valid.length < 2) {
      // Try another metric
      const fallback = QUIZ_METRICS.find(qm => pool.filter(c => c[qm.key] != null).length >= 2);
      if (!fallback) return;
      const fValid = pool.filter(c => c[fallback.key] != null);
      const shuffled = [...fValid].sort(() => Math.random() - 0.5);
      const a = shuffled[0], b = shuffled[1];
      const aVal = Number(a[fallback.key]), bVal = Number(b[fallback.key]);
      setQuestion({ metric: fallback, a, b, answer: aVal >= bVal ? 'a' : 'b' });
      setResult(null);
      return;
    }
    const shuffled = [...valid].sort(() => Math.random() - 0.5);
    let a = shuffled[0], b = shuffled[1];
    const aVal = Number(a[m.key]), bVal = Number(b[m.key]);
    if (aVal === bVal && shuffled[2]) {
      b = shuffled[2];
    }
    const finalAVal = Number(a[m.key]), finalBVal = Number(b[m.key]);
    setQuestion({ metric: m, a, b, answer: finalAVal >= finalBVal ? 'a' : 'b' });
    setResult(null);
  }, [pool]);

  useEffect(() => {
    generateQ();
  }, [generateQ]);

  const resetGame = useCallback(() => {
    setScore(0);
    setTotal(0);
    setStreak(0);
    setResult(null);
    generateQ();
  }, [generateQ]);

  const selectRegion = (r: string) => {
    setRegion(r);
    setPresetName(null);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setResult(null);
  };

  const selectPreset = (name: string) => {
    setPresetName(prev => prev === name ? null : name);
    setRegion('All');
    setScore(0);
    setTotal(0);
    setStreak(0);
    setResult(null);
  };

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

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Higher or Lower?</h1>
      <p className="quiz-subtitle">Which country has the higher stat? Test your world knowledge.</p>

      {/* Region Filter */}
      <div className="quiz-filters">
        <div className="quiz-filter-group">
          <span className="quiz-filter-label">Region:</span>
          <div className="quiz-filter-buttons">
            {REGIONS.map(r => (
              <button
                key={r}
                className={`quiz-filter-btn ${region === r && !presetName ? 'active' : ''}`}
                onClick={() => selectRegion(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-filter-group">
          <span className="quiz-filter-label">Or pick a group:</span>
          <div className="quiz-filter-buttons">
            {COMPARISON_PRESETS.map(p => (
              <button
                key={p.name}
                className={`quiz-filter-btn ${presetName === p.name ? 'active' : ''}`}
                onClick={() => selectPreset(p.name)}
                title={p.desc}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pool count */}
      <p className="quiz-pool-count">
        Playing with <strong>{pool.length}</strong> countries
        {presetName && <> ({presetName})</>}
        {region !== 'All' && !presetName && <> ({region})</>}
      </p>

      {pool.length < 2 ? (
        <div className="compare-empty">
          <p>Not enough countries in this selection for a quiz. Try a broader filter.</p>
        </div>
      ) : (
        <>
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

          {question && (
            <>
              {/* Question */}
              <div className="quiz-question">
                Which has higher <strong>{question.metric.label}</strong>?
                <GlossaryTip text={question.metric.tip} />
              </div>

              {/* Country Cards */}
              <div className="quiz-choices">
                {[
                  { c: question.a, key: 'a' as const },
                  { c: question.b, key: 'b' as const },
                ].map(({ c, key }) => {
                  const isCorrect = result && question.answer === key;
                  const isWrong = result && !isCorrect && result !== null;

                  return (
                    <button
                      key={key}
                      onClick={() => pick(key)}
                      disabled={!!result}
                      className={`quiz-card ${isCorrect ? 'quiz-card-correct' : ''} ${isWrong && question.answer !== key ? 'quiz-card-wrong' : ''}`}
                    >
                      <span className="quiz-card-flag">{c.flag_emoji}</span>
                      <span className="quiz-card-name">{c.name}</span>
                      <span className="quiz-card-region">{c.region}</span>
                      {result && (
                        <span className={`quiz-card-value ${isCorrect ? 'val-correct' : 'val-neutral'}`}>
                          {formatMetricValue(c[question.metric.key], question.metric.format)}
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
                    : `✗ Wrong — ${question.answer === 'a' ? question.a.name : question.b.name} has ${formatMetricValue(
                        (question.answer === 'a' ? question.a : question.b)[question.metric.key],
                        question.metric.format
                      )}`}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
