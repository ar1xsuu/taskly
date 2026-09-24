import type {
  ClassSection,
  Student,
  TaskItem,
  AnnouncementItem,
  CalendarEvent,
  ResourceFile,
  NoteItem,
  NotificationItem,
  TemplateItem,
} from '../types'

export const APP_NAME = 'TASKLY'
export const SCHOOL_NAME = 'Talugtug National High School'
export const SCHOOL_YEAR = '2026–2027'
export const TEACHER_NAME = 'Ma\'am Reyes'
export const CURRENT_QUARTER = 'Q2'

export const classes: ClassSection[] = [
  { id: 'c1', name: '12 - STEM A', subject: 'Practical Research 2', studentCount: 40 },
  { id: 'c2', name: '12 - ICT A', subject: 'Empowerment Technologies', studentCount: 38 },
  { id: 'c3', name: '12 - ICT B', subject: 'Empowerment Technologies', studentCount: 40 },
  { id: 'c4', name: '11 - HUMSS A', subject: 'Media and Information Literacy', studentCount: 38 },
]

const firstNames = [
  'Juan', 'Maria', 'Carlo', 'Ana', 'Kevin', 'Bea', 'Miguel', 'Samantha', 'Paolo', 'Nicole',
  'Gab', 'Erika', 'Jerome', 'Kristine', 'Marco', 'Alyssa', 'Ronnel', 'Cassandra', 'Ivan', 'Trisha',
]
const lastNames = [
  'Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Villanueva', 'Bautista', 'Ramos',
  'Torres', 'Flores', 'Castro', 'Aquino', 'Gonzales', 'Rivera', 'Domingo',
]

function makeStudents(classId: string, count: number): Student[] {
  const list: Student[] = []
  for (let i = 0; i < count; i++) {
    const first = firstNames[(i * 3) % firstNames.length]
    const last = lastNames[(i * 7 + classId.length) % lastNames.length]
    list.push({ id: `${classId}-s${i + 1}`, name: `${first} ${last}`, classId })
  }
  return list
}

export const students: Student[] = classes.flatMap((c) => makeStudents(c.id, c.studentCount))

function submissionsFor(classId: string, submittedRatio: number, lateCount: number, missingCount: number, resubmitCount = 0) {
  const roster = students.filter((s) => s.classId === classId)
  return roster.map((s, i) => {
    if (i < resubmitCount) return { studentId: s.id, status: 'Resubmission Required' as const, submittedAt: 'Sep 20, 4:32 PM', note: 'Missing references page' }
    if (i < resubmitCount + lateCount) return { studentId: s.id, status: 'Late' as const, submittedAt: 'Sep 22, 11:58 PM' }
    if (i < resubmitCount + lateCount + missingCount) return { studentId: s.id, status: 'Missing' as const }
    const submitted = i < Math.floor(roster.length * submittedRatio) + resubmitCount + lateCount + missingCount
    return submitted
      ? { studentId: s.id, status: 'Submitted' as const, submittedAt: 'Sep 21, 9:14 PM' }
      : { studentId: s.id, status: 'Pending' as const }
  })
}

export const tasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Check Research Chapter 2 submissions',
    description: 'Please check the completeness and format of the submitted research outputs.',
    classId: 'c1',
    subject: 'Practical Research 2',
    deadline: '2026-09-22',
    priority: 'Urgent',
    status: 'Ongoing',
    attachments: ['Research_Guidelines.pdf', 'Rubric.pdf'],
    submissions: submissionsFor('c1', 0.5, 4, 3, 2),
    totalStudents: 40,
    quarter: 'Q2',
    createdAt: '2026-09-15',
    recurrence: 'None',
  },
  {
    id: 't2',
    title: 'Post ICT activity instructions',
    description: 'Publish the step-by-step instructions for the spreadsheet formulas activity.',
    classId: 'c3',
    subject: 'Empowerment Technologies',
    deadline: '2026-09-24',
    priority: 'High',
    status: 'Ongoing',
    attachments: ['ICT_Activity_Sheet.docx'],
    totalStudents: 40,
    quarter: 'Q2',
    createdAt: '2026-09-18',
    recurrence: 'None',
  },
  {
    id: 't3',
    title: 'Prepare lesson materials',
    description: 'Put together slides and handouts for next week\'s media literacy lesson.',
    classId: 'c4',
    subject: 'Media and Information Literacy',
    deadline: '2026-09-25',
    priority: 'Low',
    status: 'Ongoing',
    attachments: ['Lesson_Plan_Week3.pptx'],
    totalStudents: 38,
    quarter: 'Q2',
    createdAt: '2026-09-19',
    recurrence: 'None',
  },
  {
    id: 't4',
    title: 'Check ICT performance task output',
    description: 'Review submitted output against the performance task checklist.',
    classId: 'c2',
    subject: 'Empowerment Technologies',
    deadline: '2026-09-24',
    priority: 'Urgent',
    status: 'Ongoing',
    attachments: ['Rubric.pdf'],
    submissions: submissionsFor('c2', 0.4, 2, 5),
    totalStudents: 38,
    quarter: 'Q2',
    createdAt: '2026-09-17',
    recurrence: 'None',
  },
  {
    id: 't5',
    title: 'Submit quarterly instructional plan',
    description: 'Finalize and submit the Q2 instructional plan to the department head.',
    classId: 'c1',
    subject: 'Practical Research 2',
    deadline: '2026-09-30',
    priority: 'Normal',
    status: 'Upcoming',
    attachments: [],
    totalStudents: 40,
    quarter: 'Q2',
    createdAt: '2026-09-10',
    recurrence: 'None',
  },
  {
    id: 't6',
    title: 'Record attendance for Week 5',
    description: 'Encode Week 5 attendance for all sections.',
    classId: 'c4',
    subject: 'Media and Information Literacy',
    deadline: '2026-09-18',
    priority: 'Low',
    status: 'Completed',
    attachments: [],
    totalStudents: 38,
    quarter: 'Q2',
    createdAt: '2026-09-11',
    recurrence: 'None',
  },
  {
    id: 't7',
    title: 'Return checked research outlines',
    description: 'Hand back annotated outlines with feedback before the next consultation.',
    classId: 'c1',
    subject: 'Practical Research 2',
    deadline: '2026-09-19',
    priority: 'Normal',
    status: 'Overdue',
    attachments: [],
    totalStudents: 40,
    quarter: 'Q2',
    createdAt: '2026-09-05',
    recurrence: 'None',
  },
  {
    id: 't8',
    title: 'Weekly reflection check-in',
    description: 'Quick check-in on how the week\'s lessons went across sections.',
    classId: 'c1',
    subject: 'Practical Research 2',
    deadline: '2026-09-25',
    priority: 'Low',
    status: 'Upcoming',
    attachments: [],
    totalStudents: 40,
    quarter: 'Q2',
    createdAt: '2026-09-12',
    recurrence: 'Weekly',
  },
]

export const announcements: AnnouncementItem[] = [
  {
    id: 'a1',
    title: 'Reminder: Research Outline',
    content: 'Please submit your revised research outline tomorrow. Late outlines will not be accepted for consultation.',
    classId: 'c1',
    postedAt: '2 hours ago',
    pinned: true,
    quarter: 'Q2',
  },
  {
    id: 'a2',
    title: 'Bring your laptops on Thursday',
    content: 'We will have a hands-on spreadsheet activity, so make sure your laptop is charged.',
    classId: 'c3',
    postedAt: 'Yesterday',
    quarter: 'Q2',
  },
  {
    id: 'a3',
    title: 'Quarterly plan submission moved',
    content: 'The deadline for the quarterly instructional plan has been moved to September 30.',
    classId: 'all',
    postedAt: '3 days ago',
    quarter: 'Q2',
  },
]

export const events: CalendarEvent[] = [
  { id: 'e2', title: 'Faculty Meeting', date: '2026-09-26', type: 'Meeting', quarter: 'Q2' },
  { id: 'e3', title: 'Quarterly Plan Submission', date: '2026-09-30', type: 'Deadline', quarter: 'Q2' },
  { id: 'e5', title: 'Flag Ceremony Hosting', date: '2026-09-29', type: 'School Event', quarter: 'Q2' },
  { id: 'e6', title: 'Dentist Appointment', date: '2026-09-25', type: 'Personal Task', quarter: 'Q2' },
]

export const resources: ResourceFile[] = [
  { id: 'r1', name: 'Research_Guidelines.pdf', folder: 'Practical Research', uploadedAt: 'Sep 15', size: '312 KB', tags: ['Research', 'Quarter 2'], quarter: 'Q2' },
  { id: 'r2', name: 'Rubric.pdf', folder: 'Practical Research', uploadedAt: 'Sep 15', size: '108 KB', tags: ['Research', 'Rubric'], quarter: 'Q2' },
  { id: 'r3', name: 'ICT_Activity_Sheet.docx', folder: 'Empowerment Technologies', uploadedAt: 'Sep 18', size: '96 KB', tags: ['ICT', 'Activity'], quarter: 'Q2' },
  { id: 'r4', name: 'Lesson_Plan_Week3.pptx', folder: 'Media and Information Literacy', uploadedAt: 'Sep 19', size: '4.1 MB', tags: ['Lesson Plan', 'Grade 11'], quarter: 'Q2' },
  { id: 'r5', name: 'Spreadsheet_Formulas_Guide.pdf', folder: 'ICT', uploadedAt: 'Sep 12', size: '220 KB', tags: ['ICT', 'Grade 12'], quarter: 'Q2' },
  { id: 'r6', name: 'Class_Program_2026-2027.xlsx', folder: 'General Resources', uploadedAt: 'Aug 20', size: '44 KB', tags: ['General'], quarter: 'Q1' },
]

export const notes: NoteItem[] = [
  { id: 'n1', title: 'Research format reminder', content: 'Discuss research format again with 12-STEM A — several groups mixed up citation styles.', category: 'Practical Research 2', createdAt: 'Sep 20' },
  { id: 'n2', title: 'Next week\'s ICT activity', content: 'Prepare activity materials for next week\'s ICT lesson. Reserve the computer lab.', category: 'Empowerment Technologies', createdAt: 'Sep 19' },
  { id: 'n3', title: 'Faculty meeting agenda', content: 'Bring updated class program and Q2 accomplishment report.', category: 'General', createdAt: 'Sep 18' },
]

export const notifications: NotificationItem[] = [
  { id: 'no1', message: '8 submissions are waiting to be checked.', read: false, createdAt: '10m ago', kind: 'submission', linkedTaskId: 't1' },
  { id: 'no2', message: 'ICT performance task check-in is due in 2 days.', read: false, createdAt: '1h ago', kind: 'deadline', linkedTaskId: 't4' },
  { id: 'no3', message: 'You have a faculty meeting tomorrow.', read: false, createdAt: '3h ago', kind: 'meeting' },
  { id: 'no4', message: '12-STEM A has 3 missing submissions.', read: true, createdAt: 'Yesterday', kind: 'alert', linkedTaskId: 't1' },
  { id: 'no5', message: 'Quarterly plan submission moved to Sep 30.', read: true, createdAt: '2 days ago', kind: 'deadline' },
]

export const templates: TemplateItem[] = [
  { id: 'tpl1', kind: 'task', name: 'Check submissions', title: 'Check [Activity Name] submissions', body: 'Please check the completeness and format of the submitted outputs.', priority: 'High' },
  { id: 'tpl2', kind: 'task', name: 'Post activity instructions', title: 'Post [Activity Name] instructions', body: 'Publish the step-by-step instructions for the activity.', priority: 'Normal' },
  { id: 'tpl3', kind: 'announcement', name: 'Deadline reminder', title: 'Reminder: [Task Name]', body: 'Please submit your [task name] by [date]. Late submissions may not be accepted.' },
  { id: 'tpl4', kind: 'announcement', name: 'Materials to bring', title: 'Bring [materials] on [day]', body: 'We will have a hands-on activity, so make sure to bring [materials].' },
  { id: 'tpl5', kind: 'task', name: 'Submission guidelines', title: '[Activity Name] submission guidelines', body: 'Format: PDF. File name: Surname_Activity. Submit through the class folder before the deadline.', priority: 'Normal' },
  { id: 'tpl6', kind: 'announcement', name: 'Meeting agenda', title: '[Meeting Name] — Agenda', body: '1. Opening\n2. Updates\n3. Action items\n4. Next steps' },
]

export const priorityOrder: Record<string, number> = { Urgent: 0, High: 1, Normal: 2, Low: 3 }
