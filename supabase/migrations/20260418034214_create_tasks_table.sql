/*
  # Task Manager - Create Tasks Table

  ## Summary
  Creates the core tasks table for the Task Manager application with full RLS security.

  ## New Tables

  ### tasks
  - `id` (uuid, primary key) - Unique task identifier
  - `user_id` (uuid, FK to auth.users) - Owner of the task
  - `title` (text, not null) - Task title
  - `description` (text) - Optional task description
  - `category` (text, not null) - Category: Personal, Health, Workout, Office Work, Finance, Shopping, Education, Other
  - `priority` (text, not null) - Priority level: High, Medium, Low
  - `due_date` (timestamptz, not null) - When the task is due
  - `completed` (boolean, default false) - Completion status
  - `order_position` (integer, default 0) - Position for drag-and-drop ordering
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ## Security
  - RLS enabled on tasks table
  - Users can only SELECT their own tasks
  - Users can only INSERT tasks with their own user_id
  - Users can only UPDATE their own tasks
  - Users can only DELETE their own tasks

  ## Indexes
  - Index on user_id for fast user-specific queries
  - Index on due_date for deadline queries
  - Index on priority for priority filtering
  - Index on completed for status filtering
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL DEFAULT 'Personal',
  priority text NOT NULL DEFAULT 'Medium',
  due_date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  order_position integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON tasks(completed);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
