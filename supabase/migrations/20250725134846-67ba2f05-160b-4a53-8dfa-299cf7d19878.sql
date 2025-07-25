-- Update RLS policies to allow public access to user profiles for messaging
-- This allows anonymous users to send messages to usernames

-- Drop the existing restrictive policy on users table
DROP POLICY "Users can view their own data" ON public.users;

-- Create new policy that allows public read access to basic user info
CREATE POLICY "Anyone can view public user data" 
ON public.users 
FOR SELECT 
USING (true);

-- Keep the existing policies for insert and update (users can only modify their own data)
-- INSERT: "Users can insert their own data" 
-- UPDATE: "Users can update their own data"