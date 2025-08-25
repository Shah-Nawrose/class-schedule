-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  course_code TEXT NOT NULL,
  course_title TEXT NOT NULL,
  teacher_code TEXT,
  room TEXT,
  section TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a personal planner)
CREATE POLICY "Allow all operations on classes" 
ON public.classes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a personal planner)
CREATE POLICY "Allow all operations on events" 
ON public.events 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_classes_day ON public.classes(day);
CREATE INDEX idx_classes_start_time ON public.classes(start_time);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_start_time ON public.events(start_time);