import { useState, useEffect } from 'react';

// Types for mock data
interface ChatMessage {
  id: number;
  name: string;
  avatar?: string;
  initials?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  archived?: boolean;
  new?: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
}

interface Match {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
}

interface Profile {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  skills: string[];
  interests: string[];
  experience: Array<{
    company: string;
    role: string;
    duration: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
}

interface DiscoverProfile {
  id: number;
  name: string;
  age: number;
  avatar: string;
  role: string;
  location: string;
  lookingForCofounders: boolean;
  fullTimeStartup: boolean;
  foundedCompany: boolean;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    logo?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    logo?: string;
  }>;
  skills: string[];
  interests: string[];
  currentProject?: {
    title: string;
    description: string;
  };
}

// Mock data for each endpoint
const mockData = {
  home: {
    message: "Welcome to the Co-Founder Matching App!",
    featuredEvents: [
      {
        id: 1,
        title: "Startup Mixer",
        date: "2024-04-15",
        location: "UQ St Lucia Campus"
      },
      {
        id: 2,
        title: "Tech Meetup",
        date: "2024-04-20",
        location: "Brisbane CBD"
      }
    ],
    recommendedMatches: [
      {
        id: 1,
        name: "Alex Smith",
        role: "Product Manager",
        image: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      {
        id: 2,
        name: "Taylor Wong",
        role: "Full Stack Developer",
        image: "https://randomuser.me/api/portraits/women/44.jpg"
      }
    ]
  },
  matches: {
    message: "Find your perfect co-founder match!",
    matches: [
      {
        id: 1,
        name: "Alex Smith",
        role: "Product Manager",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Former product manager at Google, looking to build something in the sustainability space.",
        skills: ["Product", "Design", "Marketing"],
        interests: ["AI", "Sustainability", "SaaS"]
      },
      {
        id: 2,
        name: "Taylor Wong",
        role: "Full Stack Developer",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        bio: "Full-stack developer with MBA, interested in fintech solutions.",
        skills: ["Engineering", "Finance", "Operations"],
        interests: ["Fintech", "AI", "SaaS"]
      }
    ]
  },
  chat: {
    message: "Your conversations",
    chats: [
      {
        id: 1,
        name: "Alex Smith",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        lastMessage: "Hey, I'm interested in your sustainability project!",
        timestamp: "2024-03-30T10:30:00Z",
        unread: true
      },
      {
        id: 2,
        name: "Taylor Wong",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        lastMessage: "Let's discuss the technical architecture",
        timestamp: "2024-03-29T15:45:00Z",
        unread: false
      }
    ]
  },
  events: {
    message: "Upcoming events",
    events: [
      {
        id: 1,
        title: "Startup Mixer",
        date: "2024-04-15",
        location: "UQ St Lucia Campus",
        description: "Network with fellow entrepreneurs and find your co-founder"
      },
      {
        id: 2,
        title: "Tech Meetup",
        date: "2024-04-20",
        location: "Brisbane CBD",
        description: "Latest trends in technology and startup ecosystem"
      }
    ]
  },
  profile: {
    message: "Your profile",
    profile: {
      id: 1,
      name: "John Doe",
      role: "Software Engineer",
      image: "https://randomuser.me/api/portraits/men/75.jpg",
      bio: "Passionate about building scalable applications and solving complex problems.",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      interests: ["AI", "Cloud Computing", "Open Source"],
      experience: [
        {
          company: "Tech Corp",
          role: "Senior Engineer",
          duration: "2020 - Present"
        }
      ],
      education: [
        {
          institution: "University of Queensland",
          degree: "Bachelor of Computer Science",
          year: "2015-2019"
        }
      ]
    }
  },
  // New endpoint for discover profiles (swipeable profiles)
  discoverProfiles: {
    message: "Discover potential co-founders",
    profiles: [
      {
        id: 1,
        name: "Alexander",
        age: 29,
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        role: "Tech Entrepreneur",
        location: "Brisbane",
        lookingForCofounders: true,
        fullTimeStartup: true,
        foundedCompany: true,
        experience: [
          {
            company: "blackfax labs",
            role: "Chief Architect",
            duration: "May 2024 - Present · 11 mos"
          },
          {
            company: "Chronos",
            role: "Co-Founder",
            duration: "Apr 2023 - Present · 2 yrs"
          },
          {
            company: "Sequest Labs",
            role: "Founder, CEO",
            duration: "Sep 2021 - Present · 3 yrs 7 mos"
          }
        ],
        education: [
          {
            institution: "Polkadot Blockchain Academy",
            degree: "Alumni"
          }
        ],
        skills: ["AI/ML", "Design", "Engineering", "Product", "Sales/Marketing"],
        interests: ["AI", "Data", "DevTools", "EnergyTech", "SaaS", "Web3"],
        currentProject: {
          title: "Carbon Capture Platform",
          description: "Building a decentralized platform for tracking and incentivizing carbon capture projects globally."
        }
      },
      {
        id: 2,
        name: "Sarah Johnson",
        age: 31,
        avatar: "https://randomuser.me/api/portraits/women/34.jpg",
        role: "Product Lead",
        location: "Brisbane",
        lookingForCofounders: true,
        fullTimeStartup: false,
        foundedCompany: false,
        experience: [
          {
            company: "Amazon",
            role: "Senior Product Manager",
            duration: "2022 - Present"
          },
          {
            company: "Atlassian",
            role: "Product Manager",
            duration: "2019 - 2022"
          }
        ],
        education: [
          {
            institution: "Stanford University",
            degree: "MBA"
          },
          {
            institution: "University of Sydney",
            degree: "BS Computer Science"
          }
        ],
        skills: ["Product Management", "UX Design", "Growth", "Strategy"],
        interests: ["EdTech", "AI", "Consumer Apps", "SaaS"],
        currentProject: {
          title: "EdTech Platform",
          description: "Building an AI-powered learning platform for personalized education."
        }
      },
      {
        id: 3,
        name: "Michael Chen",
        age: 27,
        avatar: "https://randomuser.me/api/portraits/men/47.jpg",
        role: "Full Stack Developer",
        location: "Brisbane",
        lookingForCofounders: true,
        fullTimeStartup: true,
        foundedCompany: false,
        experience: [
          {
            company: "Google",
            role: "Software Engineer",
            duration: "2021 - Present"
          },
          {
            company: "Meta",
            role: "Frontend Developer",
            duration: "2019 - 2021"
          }
        ],
        education: [
          {
            institution: "MIT",
            degree: "MS Computer Science"
          }
        ],
        skills: ["React", "Node.js", "AWS", "TypeScript", "Python"],
        interests: ["FinTech", "Blockchain", "AI", "Developer Tools"],
        currentProject: {
          title: "DeFi Trading Platform",
          description: "Creating a user-friendly decentralized trading platform with advanced analytics."
        }
      },
      {
        id: 4,
        name: "Taylor Wong",
        age: 28,
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        role: "Growth Marketer",
        location: "Brisbane",
        lookingForCofounders: true,
        fullTimeStartup: false,
        foundedCompany: false,
        experience: [
          {
            company: "Canva",
            role: "Growth Lead",
            duration: "2022 - Present"
          },
          {
            company: "Uber",
            role: "Marketing Manager",
            duration: "2020 - 2022"
          }
        ],
        education: [
          {
            institution: "Harvard Business School",
            degree: "MBA"
          }
        ],
        skills: ["Growth Hacking", "Digital Marketing", "Analytics", "SEO/SEM"],
        interests: ["E-commerce", "Consumer Tech", "SaaS"],
        currentProject: {
          title: "Sustainable Fashion Marketplace",
          description: "Building a marketplace connecting eco-friendly fashion brands with conscious consumers."
        }
      },
      {
        id: 5,
        name: "James Rodriguez",
        age: 33,
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        role: "AI Researcher",
        location: "Brisbane",
        lookingForCofounders: true,
        fullTimeStartup: true,
        foundedCompany: true,
        experience: [
          {
            company: "OpenAI",
            role: "Research Scientist",
            duration: "2021 - Present"
          },
          {
            company: "DeepMind",
            role: "ML Engineer",
            duration: "2018 - 2021"
          }
        ],
        education: [
          {
            institution: "UC Berkeley",
            degree: "PhD in Computer Science"
          }
        ],
        skills: ["Machine Learning", "Deep Learning", "Python", "TensorFlow", "PyTorch"],
        interests: ["AI/ML", "Healthcare Tech", "Climate Tech"],
        currentProject: {
          title: "Medical Diagnosis AI",
          description: "Developing an AI system for early detection of diseases from medical imaging."
        }
      }
    ]
  }
};

export function useMockApi(endpoint: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (mockData[endpoint as keyof typeof mockData]) {
          setData(mockData[endpoint as keyof typeof mockData]);
        } else {
          setError('Endpoint not found');
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
}
