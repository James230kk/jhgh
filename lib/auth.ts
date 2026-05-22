import { supabase } from './supabase';

export type AuthError = {
  message: string;
};

export const signUp = async (
  email: string,
  password: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
