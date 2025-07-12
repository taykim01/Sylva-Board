export type Tables<T extends string> =
  T extends "note"
    ? {
        id: string;
        creator_id: string;
        title: string;
        content: string;
        x: number;
        y: number;
        color: string; // HEX color code, e.g. '#ffffff'
        created_at: string;
      }
    : T extends "user"
    ? {
        id: string;
        email: string;
        push_subscription: unknown | null;
        // ...other user fields
      }
    : T extends "edge"
    ? {
        id: string;
        source_note_id: string;
        target_note_id: string;
        source_handle: string;
        target_handle: string;
        // ...other edge fields
      }
    : T extends "settings"
    ? {
        id: string;
        user_id: string;
        view: string;
        // ...other settings fields
      }
    : unknown;