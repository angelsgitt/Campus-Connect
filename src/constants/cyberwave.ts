export const Cyberwave = {
  electricBlue: '#3B82F6',
  cyan: '#22D3EE',
  violet: '#A78BFA',
  midnightInk: '#111827',
  cloudWhite: '#F8FAFC',
  white: '#FFFFFF',
  mutedSlate: '#64748B',
  lightBorder: '#E2E8F0',
  amberAccent: '#F59E0B',
} as const;

export interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
  iconName: {
    ios: string;
    android: string;
    web: string;
  };
  symbolFallback: string;
}

export interface MarketplacePost {
  id: string;
  type: 'marketplace';
  title: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  categoryLabel: string;
  authorName: string;
  authorInitials: string;
  timestamp: string;
  department?: string;
  condition?: string;
}

export interface ResourcePost {
  id: string;
  type: 'resource';
  title: string;
  supportingText: string;
  categoryLabel: string;
  authorName: string;
  authorInitials: string;
  timestamp?: string;
  badgeText?: string;
}

export type FeedPost = MarketplacePost | ResourcePost;

// ----------------------------------------------------
// MARKETPLACE SPECIFIC TYPES & SAMPLE DATA
// ----------------------------------------------------
export type MarketplaceCategory =
  | 'All'
  | 'Books'
  | 'Electronics'
  | 'Clothing'
  | 'Study Essentials'
  | 'Other';

export type ListingType = 'All' | 'For sale' | 'Borrow' | 'Lend';

export interface MarketplaceItem {
  id: string;
  title: string;
  category: Exclude<MarketplaceCategory, 'All'>;
  listingType: 'For sale' | 'Borrow' | 'Lend';
  price: string; // e.g. "₹250" or "Free"
  originalPrice?: string;
  condition?: string;
  sellerName: string;
  sellerInitials: string;
  sellerDepartment: string;
  postedTime: string;
  description: string;
  location: string;
  badgeText?: string;
  visualType: 'book' | 'calculator' | 'labcoat' | 'lamp' | 'dsa' | 'drafting' | 'hoodie' | 'headphones';
  imageUri?: string;
}

export const SAMPLE_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'user-post-1',
    title: 'Operating System Concepts (10th Edition)',
    category: 'Books',
    listingType: 'For sale',
    price: '₹350',
    originalPrice: '₹950',
    condition: 'Like New',
    sellerName: 'Alex (You)',
    sellerInitials: 'AY',
    sellerDepartment: 'Computer Science · 3rd Year',
    postedTime: 'Yesterday',
    description:
      'Silberschatz OS book with Dinosaur cover. Pristine condition, unmarked pages with virtual memory and scheduling chapters intact.',
    location: 'Central Library Foyer / CS Lab',
    badgeText: '10th Edition · Hardcover',
    visualType: 'book',
  },
  {
    id: 'item-1',
    title: 'Engineering Mathematics',
    category: 'Books',
    listingType: 'For sale',
    price: '₹250',
    originalPrice: '₹750',
    condition: 'Like New',
    sellerName: 'Rahul Sharma',
    sellerInitials: 'RS',
    sellerDepartment: 'Mechanical Engg · 3rd Year',
    postedTime: '2h ago',
    description:
      'Higher Engineering Mathematics by B.S. Grewal (8th Edition). Crisp pages with zero torn leaves, no highlighter markings. Formula handbook included for free.',
    location: 'Central Library Foyer / North Hostel',
    badgeText: '8th Revised Ed',
    visualType: 'book',
  },
  {
    id: 'item-2',
    title: 'Casio fx-991EX ClassWiz',
    category: 'Electronics',
    listingType: 'For sale',
    price: '₹650',
    originalPrice: '₹1,495',
    condition: 'Like New',
    sellerName: 'Sneha Reddy',
    sellerInitials: 'SR',
    sellerDepartment: 'Electrical Engg · Final Year',
    postedTime: '3h ago',
    description:
      'High-resolution natural textbook display with 552 functions. Permitted in university semester exams. Both solar panel and cell battery working perfectly.',
    location: 'SAC / Academic Block 3',
    badgeText: 'Exam Permitted',
    visualType: 'calculator',
  },
  {
    id: 'item-3',
    title: 'White Chemistry Lab Coat',
    category: 'Clothing',
    listingType: 'Lend',
    price: 'Free',
    condition: 'Good',
    sellerName: 'Vikram Joshi',
    sellerInitials: 'VJ',
    sellerDepartment: 'Biotechnology · 2nd Year',
    postedTime: '5h ago',
    description:
      'Pure heavy-duty cotton lab coat in Size M. Freshly laundered, button intact, dual front pockets. Available to lend for Chemistry / Bio lab sessions this term.',
    location: 'Science Complex Labs / Canteen',
    badgeText: '100% Cotton · Size M',
    visualType: 'labcoat',
  },
  {
    id: 'item-4',
    title: 'Rechargeable Desk Lamp',
    category: 'Study Essentials',
    listingType: 'For sale',
    price: '₹350',
    originalPrice: '₹799',
    condition: 'Brand New',
    sellerName: 'Ananya Roy',
    sellerInitials: 'AR',
    sellerDepartment: 'Design Dept · 1st Year',
    postedTime: '6h ago',
    description:
      'Foldable LED study lamp with 3 color temperatures (warm, natural, cool) and step-less touch dimming. USB-C charging with 6 hours backup battery.',
    location: 'Girls Hostel 2 / Student Mart',
    badgeText: '3 Light Modes',
    visualType: 'lamp',
  },
  {
    id: 'item-5',
    title: 'DSA in Java (Robert Sedgewick)',
    category: 'Books',
    listingType: 'Borrow',
    price: 'Free',
    condition: 'Good',
    sellerName: 'Aman Patel',
    sellerInitials: 'AP',
    sellerDepartment: 'Computer Science · 3rd Year',
    postedTime: '1d ago',
    description:
      'Algorithms 4th Edition reference textbook. Great for interview prep, graph algorithms, and mid-term exam review. Lending for 2 weeks.',
    location: 'CS Department Atrium',
    badgeText: 'CS201 Core',
    visualType: 'dsa',
  },
  {
    id: 'item-6',
    title: 'Drafting Board & T-Square',
    category: 'Study Essentials',
    listingType: 'Borrow',
    price: 'Free',
    condition: 'Well Kept',
    sellerName: 'Karan Mehra',
    sellerInitials: 'KM',
    sellerDepartment: 'Civil Engg · 2nd Year',
    postedTime: '1d ago',
    description:
      'A2 Size wooden drawing board with acrylic T-square and mini-drafter clips. Ideal for Engineering Graphics course.',
    location: 'Drawing Hall B / Workshop',
    badgeText: 'A2 Drafting Set',
    visualType: 'drafting',
  },
  {
    id: 'item-7',
    title: 'Campus Navy Hoodie (Size L)',
    category: 'Clothing',
    listingType: 'For sale',
    price: '₹400',
    originalPrice: '₹1,200',
    condition: 'Like New',
    sellerName: 'Devanshi Shah',
    sellerInitials: 'DS',
    sellerDepartment: 'Management Studies · Final Year',
    postedTime: '2d ago',
    description:
      'Warm fleece varsity hoodie with embroidered campus crest. Worn only twice, pristine condition without lint or shrinkage.',
    location: 'Sports Ground Pavilion',
    badgeText: 'Size L · Fleece',
    visualType: 'hoodie',
  },
  {
    id: 'item-8',
    title: 'Over-Ear Study Headphones',
    category: 'Electronics',
    listingType: 'Lend',
    price: 'Free',
    condition: 'Like New',
    sellerName: 'Tanmay Saxena',
    sellerInitials: 'TS',
    sellerDepartment: 'Information Tech · 2nd Year',
    postedTime: '2d ago',
    description:
      'Active noise cancellation headphones with 30h battery. Perfect for focused exam revision in noisy study spaces. Lendable for 1 week.',
    location: 'Reading Hall / Main Library',
    badgeText: 'ANC Enabled',
    visualType: 'headphones',
  },
];

// ----------------------------------------------------
// OPPORTUNITY TYPES & SAMPLE DATA
// ----------------------------------------------------
export interface OpportunityItem {
  id: string;
  title: string;
  type: string;
  description: string;
  dateOrDeadline?: string;
  registrationUrl?: string;
  organizerName?: string;
  organizerInitials?: string;
  badgeText?: string;
  prizePool?: string;
  location?: string;
}

export const SAMPLE_OPPORTUNITIES: OpportunityItem[] = [
  {
    id: 'post-2',
    title: 'Campus Hackathons to explore this semester',
    type: 'Hackathon',
    description:
      'A curated guide to upcoming student hackathons, coding sprints, and innovation challenges across campuses this semester. Includes ₹5,00,000+ prize pools, dedicated mentor tracks, API bounties, and free swag for all registered teams.',
    dateOrDeadline: 'Spring 2026 Semester',
    registrationUrl: 'https://hackathons.campus.edu',
    organizerName: 'Priya Verma',
    organizerInitials: 'PV',
    badgeText: 'Curated Guide · 12 Events',
    prizePool: '₹5,00,000+ in total prizes & bounties',
    location: 'Campus Tech Hub & Hybrid',
  },
  {
    id: 'opp-2',
    title: 'Robotics Club Annual Tech Expo & Demo Day',
    type: 'Event',
    description:
      'Live exhibition of autonomous drones, combat rovers, and IoT automated systems built by students. Open floor Q&A, mentor networking, and live obstacle challenges.',
    dateOrDeadline: 'April 18, 2026 · 2:00 PM',
    registrationUrl: 'https://robotics.campus.edu',
    organizerName: 'Robotics Society',
    organizerInitials: 'RS',
    badgeText: 'Annual Showcase · Free Entry',
    location: 'SAC Central Atrium',
  },
  {
    id: 'opp-3',
    title: 'FinTech Sprint: AI Team Formation Drive',
    type: 'Team Up',
    description:
      'Looking for ML engineers, backend devs, and UI designers to form 4-member teams for the inter-college FinTech challenge. Bounties, mentor support, and cloud credits included.',
    dateOrDeadline: 'Registrations Close Friday',
    registrationUrl: 'https://fintechsprint.campus.edu',
    organizerName: 'FinTech Club & DevSoc',
    organizerInitials: 'FC',
    badgeText: 'Team Formation · ₹1,50,000 Bounties',
    prizePool: '₹1,50,000 Prize Pool',
    location: 'Innovation Lab 2 / Discord',
  },
];

// ----------------------------------------------------
// COMMUNITY REQUESTS TYPES & SAMPLE DATA
// ----------------------------------------------------
export interface CommunityRequestItem {
  id: string;
  title: string;
  category: string;
  whenNeeded: string;
  budget?: string;
  description: string;
  requesterName: string;
  requesterInitials: string;
  requesterDept: string;
  postedTime: string;
  linkedPostId?: string;
}

export const SAMPLE_COMMUNITY_REQUESTS: CommunityRequestItem[] = [
  {
    id: 'req-1',
    title: 'Scientific Calculator for Friday Exam',
    category: 'Electronics',
    whenNeeded: 'Tomorrow by 9:00 AM',
    budget: 'Up to ₹150 / Borrow',
    description:
      'Need a Casio fx-991EX ClassWiz or similar natural display calculator for the Semester Math exam. Will return immediately afterwards.',
    requesterName: 'Aarav Nair',
    requesterInitials: 'AN',
    requesterDept: 'Computer Science · 3rd Year',
    postedTime: '1h ago',
    linkedPostId: 'item-2',
  },
  {
    id: 'req-2',
    title: 'Drafting Board & Mini Drafter Set',
    category: 'Study Essentials',
    whenNeeded: 'Before Monday Workshop',
    budget: 'Free Borrow',
    description:
      'Looking to borrow an A2 drawing board with mini drafter clips for Engineering Graphics course submissions.',
    requesterName: 'Karan Mehra',
    requesterInitials: 'KM',
    requesterDept: 'Civil Engg · 2nd Year',
    postedTime: '3h ago',
    linkedPostId: 'item-6',
  },
  {
    id: 'req-3',
    title: 'DSA in Java (Sedgewick) 4th Edition',
    category: 'Books',
    whenNeeded: 'For 2 Weeks Study Circle',
    budget: 'Free Borrow',
    description:
      'Algorithms 4th Edition reference textbook needed for upcoming midterm algorithms revision and graph theory assignments.',
    requesterName: 'Aman Patel',
    requesterInitials: 'AP',
    requesterDept: 'Computer Science · 3rd Year',
    postedTime: '5h ago',
    linkedPostId: 'item-5',
  },
];

// ----------------------------------------------------
// MY CIRCLE TYPES & SAMPLE DATA
// ----------------------------------------------------
export interface StudentProfile {
  id: string;
  name: string;
  initials: string;
  department: string;
  year: string;
  interests: string[];
  mutualConnections?: number;
  sharedNote?: string;
  avatarColor?: string;
  campus?: string;
  bio?: string;
}

export const INITIAL_DISCOVER_STUDENTS: StudentProfile[] = [
  {
    id: 'student-1',
    name: 'Aarav Nair',
    initials: 'AN',
    department: 'Computer Science',
    year: '3rd Year',
    interests: ['React Native', 'Hackathons', 'Open Source'],
    mutualConnections: 4,
    avatarColor: '#3B82F6',
  },
  {
    id: 'student-2',
    name: 'Diya Sen',
    initials: 'DS',
    department: 'Electronics & Comm',
    year: '2nd Year',
    interests: ['Robotics', 'IoT', 'Embedded Systems'],
    mutualConnections: 2,
    avatarColor: '#0891B2',
  },
  {
    id: 'student-3',
    name: 'Ishaan Kulkarni',
    initials: 'IK',
    department: 'Mechanical Engg',
    year: '3rd Year',
    interests: ['CAD Modeling', '3D Printing', 'Formula Student'],
    mutualConnections: 3,
    avatarColor: '#7C3AED',
  },
  {
    id: 'student-4',
    name: 'Meera Chawla',
    initials: 'MC',
    department: 'Design & Interaction',
    year: '2nd Year',
    interests: ['UI/UX Design', 'Figma', 'Illustration'],
    mutualConnections: 5,
    avatarColor: '#D97706',
  },
  {
    id: 'student-5',
    name: 'Tanvi Kapoor',
    initials: 'TK',
    department: 'Biotechnology',
    year: '4th Year',
    interests: ['Bioinformatics', 'Research', 'Lab Sciences'],
    mutualConnections: 1,
    avatarColor: '#10B981',
  },
];

export const INITIAL_MY_CONNECTIONS: StudentProfile[] = [
  {
    id: 'conn-1',
    name: 'Rahul Sharma',
    initials: 'RS',
    department: 'Mechanical Engg',
    year: '3rd Year',
    interests: ['Engineering Math', 'Automotive', 'Lab Kits'],
    mutualConnections: 7,
    avatarColor: '#3B82F6',
  },
  {
    id: 'conn-2',
    name: 'Priya Verma',
    initials: 'PV',
    department: 'Computer Science',
    year: '3rd Year',
    interests: ['Hackathons', 'AI/ML', 'Competitive Coding'],
    mutualConnections: 9,
    avatarColor: '#7C3AED',
  },
];

export const INITIAL_PENDING_REQUESTS: StudentProfile[] = [
  {
    id: 'req-1',
    name: 'Siddharth Rao',
    initials: 'SR',
    department: 'Information Tech',
    year: '2nd Year',
    interests: ['Web Dev', 'Cybersecurity', 'Cloud'],
    sharedNote: 'Both interested in Hackathons & Dev',
    avatarColor: '#0891B2',
  },
  {
    id: 'req-2',
    name: 'Ananya Roy',
    initials: 'AR',
    department: 'Design Dept',
    year: '1st Year',
    interests: ['Product Design', 'Study Circles', 'Art'],
    sharedNote: 'Shared connections in Design Club',
    avatarColor: '#D97706',
  },
];

// ----------------------------------------------------
// USER PROFILE SPECIFIC TYPES & CURRENT USER DATA
// ----------------------------------------------------
export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  department: string;
  year: string;
  campus: string;
  bio: string;
  avatarColor: string;
  gradYear?: string;
  studentId?: string;
}

export const CURRENT_USER_PROFILE: UserProfile = {
  id: 'user-current-alex',
  name: 'Alex Sharma',
  initials: 'AY',
  email: 'alex.sharma@campus.edu',
  department: 'Computer Science & Engineering',
  year: '3rd Year · Sem 6',
  campus: 'National Institute of Technology',
  bio: 'CS junior interested in system design, mobile apps & peer study circles.',
  avatarColor: '#3B82F6',
  gradYear: 'Class of 2027',
  studentId: 'CS23B1042',
};

// ----------------------------------------------------
// CAMPUS RESOURCES SPECIFIC TYPES & SAMPLE DATA
// ----------------------------------------------------
export type ResourceType =
  | 'Notes'
  | 'PYQ'
  | 'Lab File'
  | 'Study Guide'
  | 'Link';

export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  type: ResourceType;
  contributorName: string;
  contributorInitials: string;
  contributorDept: string;
  uploadTime: string;
  description: string;
  formatOrLinkText: string;
  fileSize?: string;
  filePages?: string;
  resourceUrl?: string;
  isDemoOnly: boolean;
  semester?: string;
  tags?: string[];
}

export const SAMPLE_RESOURCES: ResourceItem[] = [
  {
    id: 'user-res-1',
    title: 'Operating Systems Scheduling & Memory Cheatsheet',
    subject: 'Computer Science',
    type: 'Study Guide',
    contributorName: 'Alex (You)',
    contributorInitials: 'AY',
    contributorDept: 'Computer Science · 3rd Year',
    uploadTime: '3 days ago',
    description:
      'Comprehensive revision sheet covering Round Robin, SRTF, Bankers algorithm for deadlock, paging, and TLB calculations with solved examples.',
    formatOrLinkText: 'Quick Revision Sheet · 12 Pages',
    fileSize: '2.4 MB',
    filePages: '12 Pages',
    isDemoOnly: true,
    semester: 'Semester 5',
    tags: ['OS', 'Deadlocks', 'Scheduling', 'Cheatsheet'],
  },
  {
    id: 'res-1',
    title: 'Python OOP, Data Structures & Cheatsheet',
    subject: 'Python Programming',
    type: 'Notes',
    contributorName: 'Ananya Roy',
    contributorInitials: 'AR',
    contributorDept: 'Dept of CS & IT · 2nd Year',
    uploadTime: 'Yesterday',
    description:
      'Handcrafted summary of Python 3.12 syntax, list/dict comprehensions, decorators, generators, OOP principles with code snippets, and common interview questions.',
    formatOrLinkText: 'Handwritten Notes · 24 Pages',
    fileSize: '4.2 MB',
    filePages: '24 Pages',
    isDemoOnly: true,
    semester: 'Semester 3',
    tags: ['Python', 'OOP', 'Data Structures', 'Cheatsheet'],
  },
  {
    id: 'res-2',
    title: 'Pointers & Dynamic Memory Lab Manual Solutions',
    subject: 'C Programming',
    type: 'Lab File',
    contributorName: 'Rohan Varma',
    contributorInitials: 'RV',
    contributorDept: 'Electronics & Computer Engg · 1st Year',
    uploadTime: '2 days ago',
    description:
      'Verified solutions for Week 1 through 8 C-programming lab experiments: pointer arithmetic, struct arrays, dynamic malloc/calloc/free, and linked list basics.',
    formatOrLinkText: 'Lab Manual & Verified C Code',
    fileSize: '2.8 MB',
    filePages: '16 Experiments',
    isDemoOnly: true,
    semester: 'Semester 1',
    tags: ['C Lang', 'Pointers', 'Memory Allocation', 'Lab'],
  },
  {
    id: 'res-3',
    title: 'Linear Algebra & Multivariable Calculus Midterm PYQs (2022-2025)',
    subject: 'Engineering Mathematics',
    type: 'PYQ',
    contributorName: 'Rahul Sharma',
    contributorInitials: 'RS',
    contributorDept: 'Dept of Math & Computing · 3rd Year',
    uploadTime: '3 days ago',
    description:
      'Last 4 years solved midterm question papers with step-by-step proofs for Cayley-Hamilton theorem, eigenvalues, double integrals, and Stokes theorem.',
    formatOrLinkText: 'Solved Question Papers · 38 Pages',
    fileSize: '6.5 MB',
    filePages: '38 Pages',
    isDemoOnly: true,
    semester: 'Semester 2',
    tags: ['Maths II', 'Calculus', 'Linear Algebra', 'Solved PYQ'],
  },
  {
    id: 'res-4',
    title: 'Responsive Web Design & Modern CSS Flexbox/Grid Guide',
    subject: 'HTML & CSS',
    type: 'Study Guide',
    contributorName: 'Priya Verma',
    contributorInitials: 'PV',
    contributorDept: 'Computer Science · 3rd Year',
    uploadTime: '5 days ago',
    description:
      'Visual breakdown of modern CSS layouts: Flexbox alignment cheatsheet, CSS Grid 12-column setups, media queries, and responsive card components.',
    formatOrLinkText: 'Interactive Visual Guide',
    fileSize: '3.1 MB',
    filePages: 'Comprehensive Guide',
    isDemoOnly: true,
    semester: 'Semester 4',
    tags: ['HTML5', 'CSS3', 'Flexbox', 'Responsive'],
  },
  {
    id: 'res-5',
    title: '100+ LeetCode Python Solutions & Pattern Repository',
    subject: 'Python Programming',
    type: 'Link',
    contributorName: 'Devansh Mehra',
    contributorInitials: 'DM',
    contributorDept: 'Information Tech · 4th Year',
    uploadTime: '6 days ago',
    description:
      'Curated collection of 100+ solved algorithmic challenges in Python grouped by patterns (Two Pointers, Sliding Window, DFS/BFS, Dynamic Programming).',
    formatOrLinkText: 'External GitHub Repository',
    resourceUrl: 'https://github.com',
    isDemoOnly: false,
    semester: 'All Semesters',
    tags: ['Python', 'DSA', 'Algorithms', 'GitHub'],
  },
  {
    id: 'res-6',
    title: 'C Language End-Sem University Question Bank with Model Answers',
    subject: 'C Programming',
    type: 'PYQ',
    contributorName: 'Diya Sen',
    contributorInitials: 'DS',
    contributorDept: 'Electronics & Comm · 2nd Year',
    uploadTime: '1 week ago',
    description:
      'Consolidated university question bank for Problem Solving with C, complete with dry runs and memory layout diagrams.',
    formatOrLinkText: 'University Question Bank · 32 Pages',
    fileSize: '5.4 MB',
    filePages: '32 Pages',
    isDemoOnly: true,
    semester: 'Semester 1',
    tags: ['C Lang', 'PYQs', 'End-Sem', 'Model Answers'],
  },
  {
    id: 'res-7',
    title: 'Differential Equations & Laplace Transforms Quick Formula Handout',
    subject: 'Engineering Mathematics',
    type: 'Notes',
    contributorName: 'Meera Chawla',
    contributorInitials: 'MC',
    contributorDept: 'Mechanical Engg · 2nd Year',
    uploadTime: '1 week ago',
    description:
      'High-yield formula sheet covering 1st and 2nd order ODEs, Laplace transform tables, inverse transforms, and Fourier series shortcuts.',
    formatOrLinkText: 'Quick Formula Handout · 8 Pages',
    fileSize: '1.9 MB',
    filePages: '8 Pages',
    isDemoOnly: true,
    semester: 'Semester 2',
    tags: ['Maths', 'Laplace', 'Formula Sheet'],
  },
  {
    id: 'res-8',
    title: 'MDN Web Docs Student Curriculum & Frontend Practice Portal',
    subject: 'HTML & CSS',
    type: 'Link',
    contributorName: 'Siddharth Rao',
    contributorInitials: 'SR',
    contributorDept: 'Information Tech · 2nd Year',
    uploadTime: '2 weeks ago',
    description:
      'A structured study roadmap through semantic HTML5 tags, CSS Box Model, accessibility standards, and beginner exercises on MDN Web Docs.',
    formatOrLinkText: 'Curated Resource Portal',
    resourceUrl: 'https://developer.mozilla.org',
    isDemoOnly: false,
    semester: 'Semester 3',
    tags: ['HTML5', 'CSS3', 'MDN', 'Web Roadmap'],
  },
];



