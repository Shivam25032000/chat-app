export interface ChatMessage {
    id?: number;
    chatId?: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp?: string;
}
