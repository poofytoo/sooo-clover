export interface LeafState {
  words: string[];
  rotation: number;
  position: number;
  showIncorrect?: boolean;
  id: number;
}

export type GameState = "SELECTING_GAME" | "CLUING" | "GUESSING" | "REVEALED";

export interface CloverState {
  entries: string[];
  rotation: number;
  leaves: LeafState[];
  attempts: number;
  congratulationsMessage?: string;
}