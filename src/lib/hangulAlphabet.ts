// hangulAlphabet.ts
// The basic Hangul alphabet — 14 consonants and 10 vowels — used by the
// /flashcards page. This is fixed foundational content (unlike the vocab
// glossary, which is auto-collected from post frontmatter), so it's just
// hardcoded here rather than pulled from anywhere else.

export interface HangulLetter {
  char: string; // the letter itself, e.g. "ㄱ"
  name: string; // the letter's own Korean name, e.g. "기역"
  romanization: string; // how it's pronounced
  type: "consonant" | "vowel";
  // A simple, common word that features this letter — shown on the back
  // of the flashcard as a memory hook, the same idea as "A is for Apple."
  exampleWord: string;
  exampleRomanization: string;
  exampleMeaning: string;
}

export const HANGUL_CONSONANTS: HangulLetter[] = [
  { char: "ㄱ", name: "기역", romanization: "g / k", type: "consonant", exampleWord: "가방", exampleRomanization: "gabang", exampleMeaning: "bag" },
  { char: "ㄴ", name: "니은", romanization: "n", type: "consonant", exampleWord: "나비", exampleRomanization: "nabi", exampleMeaning: "butterfly" },
  { char: "ㄷ", name: "디귿", romanization: "d / t", type: "consonant", exampleWord: "다리", exampleRomanization: "dari", exampleMeaning: "bridge / leg" },
  { char: "ㄹ", name: "리을", romanization: "r / l", type: "consonant", exampleWord: "라면", exampleRomanization: "ramyeon", exampleMeaning: "ramen noodles" },
  { char: "ㅁ", name: "미음", romanization: "m", type: "consonant", exampleWord: "모자", exampleRomanization: "moja", exampleMeaning: "hat" },
  { char: "ㅂ", name: "비읍", romanization: "b / p", type: "consonant", exampleWord: "바다", exampleRomanization: "bada", exampleMeaning: "sea" },
  { char: "ㅅ", name: "시옷", romanization: "s", type: "consonant", exampleWord: "사과", exampleRomanization: "sagwa", exampleMeaning: "apple" },
  { char: "ㅇ", name: "이응", romanization: "silent, or \"ng\" at the end of a syllable", type: "consonant", exampleWord: "우유", exampleRomanization: "uyu", exampleMeaning: "milk" },
  { char: "ㅈ", name: "지읒", romanization: "j", type: "consonant", exampleWord: "저녁", exampleRomanization: "jeonyeok", exampleMeaning: "evening / dinner" },
  { char: "ㅊ", name: "치읓", romanization: "ch", type: "consonant", exampleWord: "치마", exampleRomanization: "chima", exampleMeaning: "skirt" },
  { char: "ㅋ", name: "키읔", romanization: "k", type: "consonant", exampleWord: "커피", exampleRomanization: "keopi", exampleMeaning: "coffee" },
  { char: "ㅌ", name: "티읕", romanization: "t", type: "consonant", exampleWord: "토끼", exampleRomanization: "tokki", exampleMeaning: "rabbit" },
  { char: "ㅍ", name: "피읖", romanization: "p", type: "consonant", exampleWord: "포도", exampleRomanization: "podo", exampleMeaning: "grape" },
  { char: "ㅎ", name: "히읗", romanization: "h", type: "consonant", exampleWord: "하늘", exampleRomanization: "haneul", exampleMeaning: "sky" },
];

export const HANGUL_VOWELS: HangulLetter[] = [
  { char: "ㅏ", name: "아", romanization: "a", type: "vowel", exampleWord: "아빠", exampleRomanization: "appa", exampleMeaning: "dad" },
  { char: "ㅑ", name: "야", romanization: "ya", type: "vowel", exampleWord: "야구", exampleRomanization: "yagu", exampleMeaning: "baseball" },
  { char: "ㅓ", name: "어", romanization: "eo", type: "vowel", exampleWord: "엄마", exampleRomanization: "eomma", exampleMeaning: "mom" },
  { char: "ㅕ", name: "여", romanization: "yeo", type: "vowel", exampleWord: "여자", exampleRomanization: "yeoja", exampleMeaning: "woman" },
  { char: "ㅗ", name: "오", romanization: "o", type: "vowel", exampleWord: "오빠", exampleRomanization: "oppa", exampleMeaning: "older brother (used by a female speaker)" },
  { char: "ㅛ", name: "요", romanization: "yo", type: "vowel", exampleWord: "요리", exampleRomanization: "yori", exampleMeaning: "cooking" },
  { char: "ㅜ", name: "우", romanization: "u", type: "vowel", exampleWord: "우산", exampleRomanization: "usan", exampleMeaning: "umbrella" },
  { char: "ㅠ", name: "유", romanization: "yu", type: "vowel", exampleWord: "유리", exampleRomanization: "yuri", exampleMeaning: "glass" },
  { char: "ㅡ", name: "으", romanization: "eu", type: "vowel", exampleWord: "음식", exampleRomanization: "eumsik", exampleMeaning: "food" },
  { char: "ㅣ", name: "이", romanization: "i", type: "vowel", exampleWord: "이름", exampleRomanization: "ireum", exampleMeaning: "name" },
];

export const HANGUL_ALPHABET: HangulLetter[] = [...HANGUL_CONSONANTS, ...HANGUL_VOWELS];
