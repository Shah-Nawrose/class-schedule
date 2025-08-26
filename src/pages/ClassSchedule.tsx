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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

interface ClassData {
  id?: string;
  day: string;
  start_time: string;
  end_time: string;
  course_code: string;
  course_title: string;
  teacher_code: string;
  room: string;
  section: string;
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClassSchedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [timeError, setTimeError] = useState("");
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<ClassData>({
    day: "",
    start_time: "",
    end_time: "",
    course_code: "",
    course_title: "",
    teacher_code: "",
    room: "",
    section: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("day")
        .order("start_time");

      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClassData) => {
      const { error } = await supabase.from("classes").insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["classes-count"] });
      queryClient.invalidateQueries({ queryKey: ["today-classes"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Class added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: ClassData) => {
      const { error } = await supabase
        .from("classes")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["today-classes"] });
      setIsDialogOpen(false);
      setEditingClass(null);
      resetForm();
      toast({
        title: "Success",
        description: "Class updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["classes-count"] });
      queryClient.invalidateQueries({ queryKey: ["today-classes"] });
      toast({
        title: "Success",
        description: "Class deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      day: "",
      start_time: "",
      end_time: "",
      course_code: "",
      course_title: "",
      teacher_code: "",
      room: "",
      section: "",
    });
  };

  const handleTimeChange = (
    field: "start_time" | "end_time",
    value: string
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      if (
        updated.start_time &&
        updated.end_time &&
        updated.start_time >= updated.end_time
      ) {
        setTimeError("Start time must be earlier than end time.");
      } else {
        setTimeError("");
      }

      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (timeError) {
      toast({
        title: "Invalid Time",
        description: timeError,
        variant: "destructive",
      });
      return;
    }

    if (editingClass) {
      updateMutation.mutate({ ...formData, id: editingClass.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (classItem: any) => {
    setEditingClass(classItem);
    setFormData(classItem);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClass(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const toggleDayExpansion = (day: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const dayOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const sortedClasses = [...classes].sort((a, b) => {
    if (a.day !== b.day) {
      return (
        (dayOrder[a.day as keyof typeof dayOrder] || 8) -
        (dayOrder[b.day as keyof typeof dayOrder] || 8)
      );
    }
    return a.start_time.localeCompare(b.start_time);
  });

  // Group classes by day for mobile view
  const classesByDay = sortedClasses.reduce((acc, classItem) => {
    if (!acc[classItem.day]) {
      acc[classItem.day] = [];
    }
    acc[classItem.day].push(classItem);
    return acc;
  }, {} as Record<string, typeof sortedClasses>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-primary bg-clip-text text-transparent">
            Class Schedule
          </h1>
          <p className="text-muted-foreground mt-2 text-sm lg:text-base">
            Manage your weekly class schedule
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAdd}
              className="bg-primary-light text-primary hover:bg-primary hover:text-primary-foreground hover:opacity-90"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Class</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Edit Class" : "Add New Class"}
              </DialogTitle>
              <DialogDescription>
                {editingClass
                  ? "Update the class details below."
                  : "Fill in the details for the new class."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select
                    value={formData.day}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, day: value }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        section: e.target.value,
                      }))
                    }
                    placeholder="A, B, C..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      handleTimeChange("start_time", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      handleTimeChange("end_time", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {timeError && (
                <p className="text-sm text-destructive">{timeError}</p>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_code">Course Code</Label>
                  <Input
                    id="course_code"
                    value={formData.course_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        course_code: e.target.value,
                      }))
                    }
                    placeholder="CS101"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher_code">Teacher Code</Label>
                  <Input
                    id="teacher_code"
                    value={formData.teacher_code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        teacher_code: e.target.value,
                      }))
                    }
                    placeholder="JD"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_title">Course Title</Label>
                <Input
                  id="course_title"
                  value={formData.course_title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      course_title: e.target.value,
                    }))
                  }
                  placeholder="Introduction to Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room: e.target.value }))
                  }
                  placeholder="Room 101"
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
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="bg-primary hover:opacity-90"
                >
                  {editingClass ? "Update Class" : "Add Class"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Your complete class schedule overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No classes scheduled
              </h3>
              <p className="text-muted-foreground mt-2">
                Add your first class to get started with your schedule.
              </p>
              <Button
                onClick={handleAdd}
                className="mt-4 bg-primary-light text-primary hover:text-primary-light hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Class
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              {/* Desktop Table View */}
              <div className="hidden lg:block rounded-xl border border-gray-200 shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead>Day</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Teacher Code</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(classesByDay).map(([day, dayClasses]) =>
                      dayClasses.map((classItem, index) => (
                        <TableRow
                          key={classItem.id}
                          className={`transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100`}
                        >
                          {/* Merge day cell for first class of the day */}
                          {index === 0 && (
                            <TableCell
                              rowSpan={dayClasses.length}
                              className="font-medium align-middle"
                            >
                              {day}
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {classItem.start_time} - {classItem.end_time}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono font-semibold text-blue-600">
                            {classItem.course_code}
                          </TableCell>
                          <TableCell
                            className="max-w-xs truncate"
                            title={classItem.course_title}
                          >
                            {classItem.course_title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-gray-400" />
                              {classItem.teacher_code || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {classItem.room || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{classItem.section || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(classItem)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Class
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      class? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteMutation.mutate(classItem.id)
                                      }
                                      className="bg-red-600 text-white hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {Object.entries(classesByDay).map(([day, dayClasses]) => (
                  <Card key={day} className="overflow-hidden">
                    <CardHeader
                      className="py-3 bg-muted/50 cursor-pointer"
                      onClick={() => toggleDayExpansion(day)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{day}</CardTitle>
                        {expandedDays[day] ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </CardHeader>

                    {expandedDays[day] && (
                      <CardContent className="p-0">
                        {dayClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="p-4 border-b last:border-b-0"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold text-primary">
                                {classItem.course_code}
                                {classItem.section && ` (${classItem.section})`}
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(classItem)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Class
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        class? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteMutation.mutate(classItem.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            <div className="text-sm mb-1 font-medium">
                              {classItem.course_title}
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {classItem.start_time} - {classItem.end_time}
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <User className="h-3 w-3 mr-1" />
                              {classItem.teacher_code || "No teacher assigned"}
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {classItem.room || "No room assigned"}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
