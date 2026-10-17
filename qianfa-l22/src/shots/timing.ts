import {SENTENCES, SHOT_RANGES, TOTAL_FRAMES} from '../common/timeline';

const check = (id: string, from: number, to: number) => {
  if (from < 1 || to < from || to > TOTAL_FRAMES) {
    throw new Error(`Invalid shot range for ${id}: ${from}–${to} / ${TOTAL_FRAMES}`);
  }
  return {from, to};
};

/** Look up a shot by the narration sentence it was tagged with (`## shot SCnn`).
 * TTS rebuilds both SENTENCES and SHOT_RANGES from real audio durations in one pass,
 * so shot, subtitle and audio ranges can never drift apart.
 */
export const sentenceShot = (sentenceNumber: number) => {
  const sentence = SENTENCES[sentenceNumber - 1];
  if (!sentence) {
    throw new Error(`Missing narration sentence S${String(sentenceNumber).padStart(2, '0')}`);
  }
  const range = SHOT_RANGES.find((x) => x.sentence === sentence.id);
  if (!range) throw new Error(`Sentence ${sentence.id} has no ## shot SCnn marker in narration.txt`);
  return check(range.id, range.from, range.to);
};

export const titleShot = () => {
  const first = SHOT_RANGES[0];
  return check('SC01', 1, Math.max(1, (first?.from ?? 151) - 1));
};
