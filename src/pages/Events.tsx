/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Plus, Edit, Trash2, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EventData {
  id?: string;
  event_title: string;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  description?: string | null;
}

export default function Events() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState<EventData>({
    event_title: "",
    event_date: "",
    start_time: null,
    end_time: null,
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false })
        .order("start_time");

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EventData) => {
      const payload = {
        ...data,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        description: data.description || null,
      };
      const { error } = await supabase.from("events").insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events-count"] });
      queryClient.invalidateQueries({ queryKey: ["today-events"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Event added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: EventData) => {
      const payload = {
        ...data,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        description: data.description || null,
      };
      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["today-events"] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events-count"] });
      queryClient.invalidateQueries({ queryKey: ["today-events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      event_title: "",
      event_date: "",
      start_time: null,
      end_time: null,
      description: "",
    });
    setSelectedDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      updateMutation.mutate({ ...formData, id: editingEvent.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      ...event,
      start_time: event.start_time || null,
      end_time: event.end_time || null,
      description: event.description || null,
    });
    setSelectedDate(new Date(event.event_date));
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEvent(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        event_date: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
            Events
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your events and important dates
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAdd}
              className="bg-primary-light text-primary hover:text-primary-light hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Edit Event" : "Add New Event"}
              </DialogTitle>
              <DialogDescription>
                {editingEvent
                  ? "Update the event details below."
                  : "Fill in the details for the new event."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event_title">Event Title</Label>
                <Input
                  id="event_title"
                  value={formData.event_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      event_title: e.target.value,
                    }))
                  }
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Event Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="start_time">Start Time (Optional)</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        start_time: e.target.value || null,
                      }))
                    }
                  />
                  {formData.start_time && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, start_time: null }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="end_time">End Time (Optional)</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_time: e.target.value || null,
                      }))
                    }
                  />
                  {formData.end_time && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, end_time: null }))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value || null,
                    }))
                  }
                  placeholder="Event description..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    !formData.event_date
                  }
                  className="bg-primary hover:opacity-90"
                >
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Events
          </CardTitle>
          <CardDescription>
            Your scheduled events and important dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No events scheduled
              </h3>
              <p className="text-muted-foreground mt-2">
                Add your first event to get started.
              </p>
              <Button
                onClick={handleAdd}
                className="mt-4 bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Event
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-table-header hover:bg-table-header">
                    <TableHead className="text-primary-dark font-bold">
                      Date
                    </TableHead>
                    <TableHead className="text-primary-dark font-bold">
                      Event Title
                    </TableHead>
                    <TableHead className="text-primary-dark font-bold">
                      Time Slot
                    </TableHead>
                    <TableHead className="text-primary-dark font-bold">
                      Description
                    </TableHead>
                    <TableHead className="text-primary-dark font-bold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event, index) => (
                    <TableRow
                      key={event.id}
                      className={`${
                        index % 2 === 0 ? "bg-table-row-even" : ""
                      } hover:bg-table-row-hover transition-colors`}
                    >
                      <TableCell className="font-medium">
                        {format(parseISO(event.event_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {event.event_title}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {event.start_time && event.end_time ? (
                            `${event.start_time} - ${event.end_time}`
                          ) : event.start_time ? (
                            `${event.start_time}`
                          ) : event.end_time ? (
                            `${event.end_time}`
                          ) : (
                            <span className="text-muted-foreground italic">
                              No Time Slot
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span
                            className={`truncate ${
                              !event.description
                                ? "text-muted-foreground italic"
                                : ""
                            }`}
                            title={event.description || ""}
                          >
                            {event.description || "No Description"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(event)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Event
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this event?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteMutation.mutate(event.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
