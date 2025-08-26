/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: classesCount = 0 } = useQuery({
    queryKey: ['classes-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: eventsCount = 0 } = useQuery({
    queryKey: ['events-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: todayEvents = [] } = useQuery({
    queryKey: ['today-events'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('event_date', today)
        .order('start_time');
      return data || [];
    }
  });

  const { data: todayClasses = [] } = useQuery({
    queryKey: ['today-classes'],
    queryFn: async () => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('day', today)
        .order('start_time');
      return data || [];
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your class schedule planner
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{classesCount}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{eventsCount}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{todayClasses.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{todayEvents.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Today's Classes
            </CardTitle>
            <CardDescription>
              Your classes scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-primary" />
                <p className="text-muted-foreground mt-2">No classes today</p>
                <Button
                  onClick={() => navigate('/schedule')}
                  variant="outline"
                  className="mt-4"
                >
                  View Schedule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.slice(0, 5).map((classItem: any) => (
                  <div key={classItem.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{classItem.course_code}</p>
                      <p className="text-sm text-muted-foreground">{classItem.course_title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{classItem.start_time} - {classItem.end_time}</p>
                      <p className="text-xs text-muted-foreground">{classItem.room}</p>
                    </div>
                  </div>
                ))}
                {todayClasses.length > 5 && (
                  <Button
                    onClick={() => navigate('/schedule')}
                    variant="ghost"
                    className="w-full"
                  >
                    View All Classes
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Events
            </CardTitle>
            <CardDescription>
              Events scheduled for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mt-2">No events today</p>
                <Button
                  onClick={() => navigate('/events')}
                  variant="outline"
                  className="mt-4"
                >
                  View Events
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayEvents.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium">{event.event_title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {event.start_time && event.end_time 
                          ? `${event.start_time} - ${event.end_time}`
                          : 'All day'
                        }
                      </p>
                    </div>
                  </div>
                ))}
                {todayEvents.length > 5 && (
                  <Button
                    onClick={() => navigate('/events')}
                    variant="ghost"
                    className="w-full"
                  >
                    View All Events
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}