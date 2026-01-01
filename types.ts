
export interface CipherState {
  shift: number;
  input: string;
  output: string;
}

export enum Mode {
  ENCRYPT = 'ENCRYPT',
  DECRYPT = 'DECRYPT'
}
