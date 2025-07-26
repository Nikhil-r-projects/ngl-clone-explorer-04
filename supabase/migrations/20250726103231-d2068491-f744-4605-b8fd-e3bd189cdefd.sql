-- Add senderUsername column to messages table
ALTER TABLE public.messages 
ADD COLUMN sender_username TEXT;