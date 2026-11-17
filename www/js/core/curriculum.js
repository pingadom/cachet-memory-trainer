// Course structure and progression. Lessons are recommended in order but never locked:
// a learner can jump ahead, and the course simply tells them what they skipped.

import { LESSONS, STAGES } from '../content/lessons.js';

export { LESSONS, STAGES };

export const lessonById = (id) => LESSONS.find((l) => l.id === id) || null;
export const isDone = (state, id) => !!state.lessons[id]?.done;
export const lessonsIn = (stageId) => LESSONS.filter((l) => l.stage === stageId);

/** First lesson, in course order, that has not been completed. Null when the course is finished. */
export const nextLesson = (state) => LESSONS.find((l) => !isDone(state, l.id)) || null;

export const followingLesson = (id) => { const i = LESSONS.findIndex((l) => l.id === id); return i >= 0 ? LESSONS[i + 1] || null : null; };

export function stageProgress(state) {
  return STAGES.map((s) => {
    const ls = lessonsIn(s.id);
    const done = ls.filter((l) => isDone(state, l.id)).length;
    return { ...s, done, total: ls.length, complete: done === ls.length };
  });
}

export function currentStage(state) {
  const next = nextLesson(state);
  return STAGES.find((s) => s.id === (next ? next.stage : STAGES[STAGES.length - 1].id));
}

export function overallProgress(state) {
  const done = LESSONS.filter((l) => isDone(state, l.id)).length;
  return { done, total: LESSONS.length, fraction: done / LESSONS.length };
}

/** Earlier lessons not yet done: shown as advice when someone jumps ahead. */
export function skipped(state, id) {
  const i = LESSONS.findIndex((l) => l.id === id);
  return LESSONS.slice(0, Math.max(0, i)).filter((l) => !isDone(state, l.id) && l.stage !== 'numbers');
}

/**
 * Record an exercise result for a lesson. The lesson is completed when the score reaches its
 * pass mark; a later, worse attempt never un-completes it. Returns true if this attempt passed.
 */
export function recordLesson(state, id, score, now = Date.now()) {
  const lesson = lessonById(id);
  if (!lesson) return false;
  const prev = state.lessons[id] || { done: 0, best: 0, tries: 0 };
  const passed = score >= (lesson.pass ?? 0.8);
  state.lessons[id] = { done: prev.done || (passed ? now : 0), best: Math.max(prev.best, score), tries: prev.tries + 1 };
  return passed;
}
