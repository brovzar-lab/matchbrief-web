// Common types shared across apps

export type ID = string;

export type Timestamp = {
  seconds: number;
  nanoseconds: number;
};

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };
