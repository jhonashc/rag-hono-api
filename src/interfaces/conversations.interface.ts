export interface ConversationRow {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date | null;
}
