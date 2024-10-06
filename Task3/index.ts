type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
type TimeSlot = "8:30-10:00" | "10:15-11:45" | "12:15-13:45" | "14:00-15:30" | "15:45-17:15";
type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

type Professor = {
    id: number;
    name: string;
    department: string;
};

type Classroom = {
    number: string;
    capacity: number;
    hasProjector: boolean;
};

type Course = {
    id: number;
    name: string;
    type: CourseType;
};

type Lesson = {
    courseId: number;
    professorId: number;
    classroomNumber: string;
    dayOfWeek: DayOfWeek;
    timeSlot: TimeSlot;
};

let professors: Professor[] = [];
let classrooms: Classroom[] = [];
let courses: Course[] = [];
let schedule: Lesson[] = [];

function addProfessor(professor: Professor): void {
    professors.push(professor);
}

function addLesson(lesson: Lesson): boolean {
    const conflict = validateLesson(lesson);
    if (conflict === null) {
        schedule.push(lesson);
        return true;
    } else {
        console.log("Schedule conflict:", conflict);
        return false;
    }
}

// Returns a list of available audience numbers for a given time slot and day of the week.
// The function first finds the auditoriums occupied at the specified time (by filtering the schedule).
// Then returns audiences that are not busy.
function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): string[] {
    const occupiedClassrooms = schedule
        .filter(lesson => lesson.timeSlot === timeSlot && lesson.dayOfWeek === dayOfWeek)
        .map(lesson => lesson.classroomNumber);
    
    return classrooms
        .filter(classroom => !occupiedClassrooms.includes(classroom.number))
        .map(classroom => classroom.number);
}

function getProfessorSchedule(professorId: number): Lesson[] {
    return schedule.filter(lesson => lesson.professorId === professorId);
}

type ScheduleConflict = {
    type: "ProfessorConflict" | "ClassroomConflict";
    lessonDetails: Lesson;
};

function validateLesson(lesson: Lesson): ScheduleConflict | null {
    const professorConflict = schedule.find(l =>
        l.professorId === lesson.professorId &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.timeSlot === lesson.timeSlot
    );

    if (professorConflict) {
        return { type: "ProfessorConflict", lessonDetails: professorConflict };
    }

    const classroomConflict = schedule.find(l =>
        l.classroomNumber === lesson.classroomNumber &&
        l.dayOfWeek === lesson.dayOfWeek &&
        l.timeSlot === lesson.timeSlot
    );

    if (classroomConflict) {
        return { type: "ClassroomConflict", lessonDetails: classroomConflict };
    }

    return null;
}

function getClassroomUtilization(classroomNumber: string): number {
    const totalSlots = 5 * 5;
    const occupiedSlots = schedule.filter(lesson => lesson.classroomNumber === classroomNumber).length;
    return (occupiedSlots / totalSlots) * 100;
}

// Determines the most popular class type in the schedule.
// The function counts the number of each type of class in the schedule.
// For each class, it searches for its course, then increments the counter of the corresponding class type.
// After that, the class type that has the largest number is returned.
function getMostPopularCourseType(): CourseType {
    const courseTypeCount: { [key in CourseType]?: number } = {};

    schedule.forEach(lesson => {
        const course = courses.find(c => c.id === lesson.courseId);
        if (course) {
            courseTypeCount[course.type] = (courseTypeCount[course.type] || 0) + 1;
        }
    });

    return Object.keys(courseTypeCount).reduce((a, b) =>
        courseTypeCount[a as CourseType]! > courseTypeCount[b as CourseType]! ? a : b
    ) as CourseType;
}

// Reassigns the class audience if possible.
// The function searches for a lesson by its ID, then checks if it can be moved to a new classroom.
// The validateLesson function is called to check for conflicts. If there are no conflicts, the audience changes.
function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
    const lesson = schedule.find(lesson => lesson.courseId === lessonId);
    if (lesson) {
        const conflict = validateLesson({ ...lesson, classroomNumber: newClassroomNumber });
        if (!conflict) {
            lesson.classroomNumber = newClassroomNumber;
            return true;
        }
    }
    return false;
}

function cancelLesson(lessonId: number): void {
    schedule = schedule.filter(lesson => lesson.courseId !== lessonId);
}
