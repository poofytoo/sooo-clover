export interface LeafState {
  words: string[];
  rotation: number;
  position: number;
  id: number;
}

export interface CloverState {
  entries: string[];
  rotation: number;
  leaves: LeafState[];
}