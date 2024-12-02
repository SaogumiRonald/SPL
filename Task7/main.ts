enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled",
}
  
enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special",
}
  
enum Semester {
    First = "First",
    Second = "Second",
}
  
enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2,
}
  
enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering",
}   
  
interface IStudent {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}
  
interface ICourse {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}
  
interface IGrade {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}
  
class UniversityManagementSystem {
    private students: IStudent[] = [];
    private courses: ICourse[] = [];
    private grades: IGrade[] = [];
    private studentCourseMap: Map<number, number[]> = new Map(); // Відображення студентів на курси
 
enrollStudent(student: Omit<IStudent, "id">): IStudent {
    const id = this.students.length + 1;
    const newStudent: IStudent = { id, ...student };
    this.students.push(newStudent);
    return newStudent;
}
  
registerForCourse(studentId: number, courseId: number): void {
    const course = this.courses.find((c) => c.id === courseId);
    const student = this.students.find((s) => s.id === studentId);

    if (!course || !student) throw new Error("Student or course not found");

    if (course.faculty !== student.faculty) {
      throw new Error("Student can only register for courses in their faculty");
    }
  
    const registeredStudents = this.studentCourseMap.get(courseId) || [];
    if (registeredStudents.length >= course.maxStudents) {
      throw new Error("Course is full");
    }
    registeredStudents.push(studentId);
    this.studentCourseMap.set(courseId, registeredStudents);
}
  
setGrade(studentId: number, courseId: number, grade: Grade): void {
    const registeredCourses = this.studentCourseMap.get(courseId) || [];
    if (!registeredCourses.includes(studentId)) {
        throw new Error("Student is not registered for this course");
    }
    const semester = this.courses.find((c) => c.id === courseId)?.semester;
    if (!semester) throw new Error("Invalid course ID")
    this.grades.push({
        studentId,
        courseId,
        grade,
        date: new Date(),
        semester,
    });
}
  
updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) throw new Error("Student not found");
  
    if (newStatus === StudentStatus.Graduated || newStatus === StudentStatus.Expelled) {
        student.status = newStatus;
    } else if (student.status === StudentStatus.Graduated || student.status === StudentStatus.Expelled) {
        throw new Error("Cannot change status of graduated or expelled student");
    } else {
        student.status = newStatus;
    }
}
  
getStudentsByFaculty(faculty: Faculty): IStudent[] {
    return this.students.filter((s) => s.faculty === faculty);
}
  
getStudentGrades(studentId: number): IGrade[] {
    return this.grades.filter((g) => g.studentId === studentId);
}
  
getAvailableCourses(faculty: Faculty, semester: Semester): ICourse[] {
    return this.courses.filter((c) => c.faculty === faculty && c.semester === semester);
}
  
calculateAverageGrade(studentId: number): number {
    const grades = this.getStudentGrades(studentId);
        if (grades.length === 0) return 0;
  
        const total = grades.reduce((sum, g) => sum + g.grade, 0);
        return total / grades.length;
    }
  
    getTopStudentsByFaculty(faculty: Faculty): IStudent[] {
        const students = this.getStudentsByFaculty(faculty);
        const topStudents = students.filter((s) => {
        const avgGrade = this.calculateAverageGrade(s.id);
        return avgGrade >= 4.5;
    });
  
        return topStudents;
    }
}



// Demonstration
const ums = new UniversityManagementSystem();

const student1 = ums.enrollStudent({
  fullName: "John Doe",
  faculty: Faculty.Computer_Science,
  year: 1,
  status: StudentStatus.Active,
  enrollmentDate: new Date("2024-09-01"),
  groupNumber: "PD-41",
});

const student2 = ums.enrollStudent({
  fullName: "Jane Smith",
  faculty: Faculty.Computer_Science,
  year: 2,
  status: StudentStatus.Active,
  enrollmentDate: new Date("2023-09-01"),
  groupNumber: "PD-31",
});

ums["courses"] = [
  {
    id: 1,
    name: "Introduction to Programming",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 30,
  },
  {
    id: 2,
    name: "Data Structures",
    type: CourseType.Mandatory,
    credits: 4,
    semester: Semester.Second,
    faculty: Faculty.Computer_Science,
    maxStudents: 30,
  },
];

ums.registerForCourse(student1.id, 1);
ums.registerForCourse(student2.id, 1);
ums.registerForCourse(student2.id, 2);

ums.setGrade(student1.id, 1, Grade.Excellent);
ums.setGrade(student2.id, 1, Grade.Good);
ums.setGrade(student2.id, 2, Grade.Excellent);

console.log("Students in Computer Science faculty:");
console.log(ums.getStudentsByFaculty(Faculty.Computer_Science));

console.log(`Grades for ${student2.fullName}:`);
console.log(ums.getStudentGrades(student2.id));

console.log(`Average grade for ${student2.fullName}:`);
console.log(ums.calculateAverageGrade(student2.id));

ums.updateStudentStatus(student1.id, StudentStatus.Graduated);
console.log(`Updated status for ${student1.fullName}:`);
console.log(student1);

console.log("Available courses for Computer Science, First Semester:");
console.log(ums.getAvailableCourses(Faculty.Computer_Science, Semester.First));

console.log("Top students in Computer Science faculty:");
console.log(ums.getTopStudentsByFaculty(Faculty.Computer_Science));
