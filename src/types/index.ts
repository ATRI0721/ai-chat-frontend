export interface User {
  id: string;
  email: string;
}

export interface Message {
  id: string;
  content: string;
  is_user: boolean;
}

export interface ConversationReceived {
  id: string;
  title: string;
  update_time: number;
}

export interface Conversation extends ConversationReceived {
  isloading: boolean;
}

export interface ClassifiedConversations {
  group_name: string;
  date_before: number;
  conversations: Conversation[];
}

export interface Error {
  message: string;
}

export enum VerificationType {
  Register = 'register',
  Login = 'login',
  Reset = 'reset',
}


export interface VerificationRequest {
  email: string;
  type: VerificationType;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCodeRequest {
  email: string;
  verification_code: string;
}

export interface LoginPasswordRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  verification_code: string;
  new_password: string;
}

export interface RegisterRequest {
  email: string;
  verification_code: string;
  password: string;
}

export interface UpdateConversationRequest {
  title: string;
}
