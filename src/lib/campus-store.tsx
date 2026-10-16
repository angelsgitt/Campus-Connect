import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import {
  StudentProfile,
  INITIAL_MY_CONNECTIONS,
  INITIAL_PENDING_REQUESTS,
  INITIAL_DISCOVER_STUDENTS,
  ResourceItem,
  SAMPLE_RESOURCES,
} from '@/constants/cyberwave';

export interface MarketplaceOffer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice?: string;
  sellerName: string;
  offerAmount: string;
  amount: string;
  message?: string;
  createdAt: string;
  timestamp: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
}

interface CampusStoreType {
  // My Circle
  myConnections: StudentProfile[];
  pendingRequests: StudentProfile[];
  sentRequestIds: string[];
  connectWithStudent: (student: StudentProfile) => void;
  acceptConnectionRequest: (studentId: string) => void;
  declineConnectionRequest: (studentId: string) => void;
  isStudentConnected: (idOrName: string) => boolean;
  isStudentPending: (idOrName: string) => boolean;
  getStudentByIdOrName: (idOrName: string) => StudentProfile;
  discoverStudents: StudentProfile[];

  // Bookmarks
  savedResourceIds: string[];
  toggleBookmark: (resourceId: string) => boolean;
  isBookmarked: (resourceId: string) => boolean;
  getSavedResources: () => ResourceItem[];

  // Offers
  sentOffers: MarketplaceOffer[];
  submitOffer: (offer: {
    listingId: string;
    listingTitle: string;
    listingPrice?: string;
    sellerName: string;
    offerAmount?: string;
    amount?: string;
    message?: string;
  }) => MarketplaceOffer;

  // Chat
  messagesByChatId: Record<string, ChatMessage[]>;
  sendMessage: (chatId: string, text: string) => void;
  getMessagesForChat: (chatId: string) => ChatMessage[];
}

const CampusStoreContext = createContext<CampusStoreType | undefined>(
  undefined
);

// Fallback student profiles registry for all sellers & campus contributors
const KNOWN_STUDENT_PROFILES: Record<string, StudentProfile> = {
  'conn-1': INITIAL_MY_CONNECTIONS[0], // Rahul Sharma
  'conn-2': INITIAL_MY_CONNECTIONS[1], // Priya Verma
  'req-1': INITIAL_PENDING_REQUESTS[0], // Siddharth Rao
  'req-2': INITIAL_PENDING_REQUESTS[1], // Ananya Roy
  'student-1': INITIAL_DISCOVER_STUDENTS[0], // Aarav Nair
  'student-2': INITIAL_DISCOVER_STUDENTS[1], // Diya Sen
  'student-3': INITIAL_DISCOVER_STUDENTS[2], // Ishaan Kulkarni
  'student-4': INITIAL_DISCOVER_STUDENTS[3], // Meera Chawla
  'student-5': INITIAL_DISCOVER_STUDENTS[4], // Tanvi Kapoor
  'Rahul Sharma': {
    id: 'conn-1',
    name: 'Rahul Sharma',
    initials: 'RS',
    department: 'Mechanical Engg',
    year: '3rd Year · Sem 6',
    interests: ['Engineering Math', 'Automotive', 'Lab Kits'],
    mutualConnections: 7,
    avatarColor: '#3B82F6',
    campus: 'National Institute of Technology',
    bio: 'Mechanical junior interested in vehicle dynamics & peer lending.',
  },
  'Priya Verma': {
    id: 'conn-2',
    name: 'Priya Verma',
    initials: 'PV',
    department: 'Computer Science',
    year: '3rd Year · Sem 6',
    interests: ['Hackathons', 'AI/ML', 'Competitive Coding'],
    mutualConnections: 9,
    avatarColor: '#7C3AED',
    campus: 'National Institute of Technology',
    bio: 'CS junior. Organizing Spring 2026 Hackathons and peer coding circles.',
  },
  'Sneha Reddy': {
    id: 'student-sneha',
    name: 'Sneha Reddy',
    initials: 'SR',
    department: 'Electrical Engg',
    year: 'Final Year · Sem 8',
    interests: ['Circuit Design', 'Embedded Systems', 'GATE Prep'],
    mutualConnections: 5,
    avatarColor: '#0891B2',
    campus: 'National Institute of Technology',
    bio: 'EE senior clearing out electronics & textbooks before graduation.',
  },
  'Vikram Joshi': {
    id: 'student-vikram',
    name: 'Vikram Joshi',
    initials: 'VJ',
    department: 'Biotechnology',
    year: '2nd Year · Sem 4',
    interests: ['Bioinformatics', 'Genetics', 'Organic Chemistry'],
    mutualConnections: 3,
    avatarColor: '#10B981',
    campus: 'National Institute of Technology',
    bio: 'Biotech sophomore happy to lend lab equipment & lab coats to peers.',
  },
  'Ananya Roy': {
    id: 'req-2',
    name: 'Ananya Roy',
    initials: 'AR',
    department: 'Design Dept',
    year: '1st Year · Sem 2',
    interests: ['Product Design', 'Study Circles', 'Art'],
    mutualConnections: 2,
    avatarColor: '#D97706',
    campus: 'National Institute of Technology',
    bio: 'Design fresher interested in UX, typography & peer study circles.',
  },
  'Karan Mehra': {
    id: 'student-karan',
    name: 'Karan Mehra',
    initials: 'KM',
    department: 'Civil Engg',
    year: '2nd Year · Sem 4',
    interests: ['AutoCAD', 'Structural Engg', 'Surveying'],
    mutualConnections: 4,
    avatarColor: '#E11D48',
    campus: 'National Institute of Technology',
    bio: 'Civil sophomore sharing drafting kits & engineering graphics tools.',
  },
  'Devanshi Shah': {
    id: 'student-devanshi',
    name: 'Devanshi Shah',
    initials: 'DS',
    department: 'Management Studies',
    year: 'Final Year · Sem 8',
    interests: ['Consulting', 'Marketing', 'Campus Merchandise'],
    mutualConnections: 6,
    avatarColor: '#8B5CF6',
    campus: 'National Institute of Technology',
    bio: 'MBA/BBA senior sharing campus gear and study case sheets.',
  },
  'Tanmay Saxena': {
    id: 'student-tanmay',
    name: 'Tanmay Saxena',
    initials: 'TS',
    department: 'Information Tech',
    year: '2nd Year · Sem 4',
    interests: ['Headphones', 'Deep Work', 'Web Dev'],
    mutualConnections: 4,
    avatarColor: '#4F46E5',
    campus: 'National Institute of Technology',
    bio: 'IT sophomore lending ANC study gear for library exam sessions.',
  },
  'Robotics Society': {
    id: 'org-robotics',
    name: 'Robotics Society',
    initials: 'RS',
    department: 'Student Technical Club',
    year: 'Established 2021',
    interests: ['Autonomous Drones', 'Combat Robotics', 'IoT'],
    mutualConnections: 12,
    avatarColor: '#059669',
    campus: 'National Institute of Technology',
    bio: 'Official campus robotics chapter hosting annual tech expos & mentor drives.',
  },
  'FinTech Club & DevSoc': {
    id: 'org-fintech',
    name: 'FinTech Club & DevSoc',
    initials: 'FC',
    department: 'Inter-Department Society',
    year: 'Established 2023',
    interests: ['FinTech', 'Decentralized Systems', 'Hackathons'],
    mutualConnections: 15,
    avatarColor: '#2563EB',
    campus: 'National Institute of Technology',
    bio: 'Collaborative development society assembling hackathon squads.',
  },
};

// Initial realistic message history for peer demo
const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conn-1': [
    {
      id: 'm1',
      sender: 'other',
      text: 'Hey Alex! Glad we connected on Campus Connect.',
      timestamp: 'Yesterday 4:15 PM',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Hey Rahul! Saw you posted the Math II B.S. Grewal book.',
      timestamp: 'Yesterday 4:20 PM',
    },
    {
      id: 'm3',
      sender: 'other',
      text: 'Yes! Still available. Formula handbook is included for free as well.',
      timestamp: 'Yesterday 4:22 PM',
    },
  ],
  'Rahul Sharma': [
    {
      id: 'm1',
      sender: 'other',
      text: 'Hey Alex! Glad we connected on Campus Connect.',
      timestamp: 'Yesterday 4:15 PM',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Hey Rahul! Saw you posted the Math II B.S. Grewal book.',
      timestamp: 'Yesterday 4:20 PM',
    },
    {
      id: 'm3',
      sender: 'other',
      text: 'Yes! Still available. Formula handbook is included for free as well.',
      timestamp: 'Yesterday 4:22 PM',
    },
  ],
  'Sneha Reddy': [
    {
      id: 'sr-1',
      sender: 'other',
      text: 'Hi Alex! Thanks for checking out the fx-991EX ClassWiz.',
      timestamp: '2h ago',
    },
    {
      id: 'sr-2',
      sender: 'user',
      text: 'Is it still in good working condition for semester exams?',
      timestamp: '1h ago',
    },
    {
      id: 'sr-3',
      sender: 'other',
      text: 'Both solar panel & battery are 100% fine. Can meet at Academic Block 3!',
      timestamp: '45m ago',
    },
  ],
  'Priya Verma': [
    {
      id: 'pv-1',
      sender: 'other',
      text: 'Hey Alex! Are you planning to form a team for the FinTech challenge?',
      timestamp: '3h ago',
    },
    {
      id: 'pv-2',
      sender: 'user',
      text: 'Yes, definitely interested! We need a backend dev.',
      timestamp: '2h ago',
    },
  ],
};

// Initial sent offers for demo
const INITIAL_OFFERS: MarketplaceOffer[] = [
  {
    id: 'offer-init-1',
    listingId: 'item-1',
    listingTitle: 'Higher Engineering Mathematics',
    listingPrice: '₹250',
    sellerName: 'Rahul Sharma',
    offerAmount: '₹220',
    amount: '₹220',
    message: 'Can pick it up right after 3 PM class at Central Library!',
    createdAt: '1h ago',
    timestamp: '1h ago',
    status: 'Pending',
  },
];

export function CampusStoreProvider({ children }: { children: ReactNode }) {
  // My Circle state
  const [myConnections, setMyConnections] = useState<StudentProfile[]>(
    INITIAL_MY_CONNECTIONS
  );
  const [pendingRequests, setPendingRequests] = useState<StudentProfile[]>(
    INITIAL_PENDING_REQUESTS
  );
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [discoverStudents] = useState<StudentProfile[]>(
    INITIAL_DISCOVER_STUDENTS
  );

  // Bookmarks state (initial bookmark on OS cheat sheet)
  const [savedResourceIds, setSavedResourceIds] = useState<string[]>([
    'res-os',
    'res-1',
  ]);

  // Offers state
  const [sentOffers, setSentOffers] =
    useState<MarketplaceOffer[]>(INITIAL_OFFERS);

  // Chat messages state
  const [messagesByChatId, setMessagesByChatId] =
    useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);

  // 1. My Circle Handlers
  const connectWithStudent = useCallback((student: StudentProfile) => {
    setSentRequestIds((prev) => {
      if (prev.includes(student.id)) return prev;
      return [...prev, student.id];
    });
  }, []);

  const acceptConnectionRequest = useCallback((studentId: string) => {
    setPendingRequests((prev) => {
      const match = prev.find((s) => s.id === studentId);
      if (match) {
        setMyConnections((conn) => {
          if (conn.some((c) => c.id === match.id)) return conn;
          return [match, ...conn];
        });
      }
      return prev.filter((s) => s.id !== studentId);
    });
  }, []);

  const declineConnectionRequest = useCallback((studentId: string) => {
    setPendingRequests((prev) => prev.filter((s) => s.id !== studentId));
  }, []);

  const isStudentConnected = useCallback(
    (idOrName: string) => {
      return myConnections.some(
        (c) => c.id === idOrName || c.name.toLowerCase() === idOrName.toLowerCase()
      );
    },
    [myConnections]
  );

  const isStudentPending = useCallback(
    (idOrName: string) => {
      return sentRequestIds.some((id) => id === idOrName);
    },
    [sentRequestIds]
  );

  const getStudentByIdOrName = useCallback(
    (idOrName: string): StudentProfile => {
      // 1. Direct registry lookup
      if (KNOWN_STUDENT_PROFILES[idOrName]) {
        return KNOWN_STUDENT_PROFILES[idOrName];
      }

      // 2. Lookup by id or name in current connections / requests / discover
      const pool = [
        ...myConnections,
        ...pendingRequests,
        ...discoverStudents,
        ...Object.values(KNOWN_STUDENT_PROFILES),
      ];

      const match = pool.find(
        (s) =>
          s.id === idOrName ||
          s.name.toLowerCase() === idOrName.toLowerCase()
      );

      if (match) return match;

      // 3. Fallback auto-generated profile for unknown name
      const nameParts = idOrName.split(' ');
      const initials =
        nameParts
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'ST';

      return {
        id: `student-dyn-${idOrName.replace(/\s+/g, '-').toLowerCase()}`,
        name: idOrName,
        initials,
        department: 'Engineering & Technology',
        year: '3rd Year · Sem 6',
        interests: ['Campus Connect', 'Peer Sharing', 'Academics'],
        mutualConnections: 2,
        avatarColor: '#3B82F6',
        campus: 'National Institute of Technology',
        bio: `${idOrName} is an active student on Campus Connect.`,
      };
    },
    [myConnections, pendingRequests, discoverStudents]
  );

  // 2. Bookmarks Handlers
  const toggleBookmark = useCallback((resourceId: string): boolean => {
    let nextState = false;
    setSavedResourceIds((prev) => {
      if (prev.includes(resourceId)) {
        nextState = false;
        return prev.filter((id) => id !== resourceId);
      } else {
        nextState = true;
        return [...prev, resourceId];
      }
    });
    return nextState;
  }, []);

  const isBookmarked = useCallback(
    (resourceId: string) => {
      return savedResourceIds.includes(resourceId);
    },
    [savedResourceIds]
  );

  const getSavedResources = useCallback((): ResourceItem[] => {
    return SAMPLE_RESOURCES.filter((res) => savedResourceIds.includes(res.id));
  }, [savedResourceIds]);

  // 3. Offers Handlers
  const submitOffer = useCallback(
    (offer: {
      listingId: string;
      listingTitle: string;
      listingPrice?: string;
      sellerName: string;
      offerAmount?: string;
      amount?: string;
      message?: string;
    }) => {
      const finalAmount = offer.amount || offer.offerAmount || '₹0';
      const now = 'Just now';
      const newOffer: MarketplaceOffer = {
        id: `offer-${Date.now()}`,
        listingId: offer.listingId,
        listingTitle: offer.listingTitle,
        listingPrice: offer.listingPrice,
        sellerName: offer.sellerName,
        offerAmount: finalAmount,
        amount: finalAmount,
        message: offer.message,
        createdAt: now,
        timestamp: now,
        status: 'Pending',
      };
      setSentOffers((prev) => [newOffer, ...prev]);
      return newOffer;
    },
    []
  );

  // 4. Chat Handlers
  const getMessagesForChat = useCallback(
    (chatId: string): ChatMessage[] => {
      return messagesByChatId[chatId] || [];
    },
    [messagesByChatId]
  );

  const sendMessage = useCallback((chatId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: 'Just now',
    };

    setMessagesByChatId((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Realistic automated peer response after 1.2s for interactive Ideathon demo
    setTimeout(() => {
      const peerReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'other',
        text: 'Sounds great! I will be near the SAC / Library this afternoon.',
        timestamp: 'Just now',
      };
      setMessagesByChatId((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), peerReply],
      }));
    }, 1200);
  }, []);

  return (
    <CampusStoreContext.Provider
      value={{
        myConnections,
        pendingRequests,
        sentRequestIds,
        connectWithStudent,
        acceptConnectionRequest,
        declineConnectionRequest,
        isStudentConnected,
        isStudentPending,
        getStudentByIdOrName,
        discoverStudents,
        savedResourceIds,
        toggleBookmark,
        isBookmarked,
        getSavedResources,
        sentOffers,
        submitOffer,
        messagesByChatId,
        sendMessage,
        getMessagesForChat,
      }}>
      {children}
    </CampusStoreContext.Provider>
  );
}

export function useCampusStore(): CampusStoreType {
  const context = useContext(CampusStoreContext);
  if (!context) {
    throw new Error('useCampusStore must be used within a CampusStoreProvider');
  }
  return context;
}
