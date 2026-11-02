export type Project = {
  slug: string
  title: string
  shortTitle?: string
  description: string
  category: 'Web application' | 'Backend & APIs'
  role: string
  image: string
  imageAlt: string
  color: string
  technologies: string[]
  demoUrl?: string
  demoStatus?: 'online' | 'offline'
  repositoryUrl?: string
  featured: boolean
  order: number
  caseStudy: {
    status: 'coming-soon' | 'published'
    sections?: { heading: string; body: string }[]
  }
}

// Add a project here and its image in public/images. Both galleries update automatically.
export const projects: Project[] = [
  {
    slug: 'nabify',
    title: 'Nabify',
    description:
      'A no-code platform that turns web scraping and workflow automation into a simpler, more approachable process.',
    category: 'Web application',
    role: 'Full-stack development',
    image: '/images/nabify.png',
    imageAlt: 'The original Nabify web scraping and automation homepage',
    color: '#e8e9ff',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma'],
    demoUrl: 'https://nabify.site/',
    demoStatus: 'offline',
    featured: true,
    order: 1,
    caseStudy: { status: 'coming-soon' },
  },
  {
    slug: 'smart-plastic-bottle-bin',
    title: 'Smart Plastic Bottle Bin',
    shortTitle: 'Smart Bottle Bin',
    description:
      'The web application behind an IoT reverse vending machine, with real-time bin monitoring and management.',
    category: 'Web application',
    role: 'Full-stack development · Capstone',
    image: '/images/smartbin.jpg',
    imageAlt: 'Smart Plastic Bottle Bin project interface',
    color: '#d8e6de',
    technologies: ['Next.js', 'Supabase', 'Tailwind CSS', 'IoT'],
    demoUrl: 'https://www.smartbottlebin.online/',
    demoStatus: 'offline',
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/Smart-Bin-RVM',
    featured: true,
    order: 2,
    caseStudy: { status: 'coming-soon' },
  },
  {
    slug: 'educonnect',
    title: 'EduConnect',
    description:
      'A hackathon project bringing educators together to share ideas, collaborate, and learn from one another.',
    category: 'Web application',
    role: 'Full-stack development · Hackathon',
    image: '/images/educonnect.jpg',
    imageAlt: 'EduConnect educational collaboration platform',
    color: '#e4e6e9',
    technologies: ['Next.js', 'NestJS', 'MongoDB', 'Socket.io'],
    demoUrl: 'https://educonnect-ten.vercel.app/',
    featured: false,
    order: 3,
    caseStudy: { status: 'coming-soon' },
  },
  {
    slug: 'go-bank-api',
    title: 'Go Bank API',
    description:
      'An exploration of backend development in Go: a banking API with PostgreSQL, SQLc, and a containerized development environment.',
    category: 'Backend & APIs',
    role: 'Backend development',
    image: '/images/gobank.jpg',
    imageAlt: 'Go Bank API project preview from the original portfolio',
    color: '#d8e9ef',
    technologies: ['Go', 'Gin', 'PostgreSQL', 'Docker'],
    repositoryUrl:
      'https://github.com/Just-a-NoobieDev/bankapi-gin-sqlc-postgres',
    featured: false,
    order: 4,
    caseStudy: { status: 'coming-soon' },
  },
  {
    slug: 'go-htmx-todo',
    title: 'Go + HTMX Todo',
    description:
      'A server-rendered todo application exploring Go, Echo, Templ, and HTMX through create, read, update, and delete workflows.',
    category: 'Web application',
    role: 'Full-stack development',
    image: '/images/go-htmx-todo.jpg',
    imageAlt: 'Go + HTMX Todo preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['Go', 'Echo', 'HTMX', 'Templ'],
    featured: false,
    order: 5,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/todolist-go-htmx-templ',
  },
  {
    slug: 'loan-management-system',
    title: 'Loan Management System',
    description:
      'A Django course project for recording clients’ loans and payments.',
    category: 'Web application',
    role: 'Full-stack development · Group project',
    image: '/images/loan-management.jpg',
    imageAlt: 'Loan Management System preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['Python', 'Django', 'Tailwind CSS', 'SQLite'],
    featured: false,
    order: 6,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/loan-management-system',
    demoUrl: 'https://carl14.pythonanywhere.com/',
  },
  {
    slug: 'original-portfolio',
    title: 'Personal Portfolio Website',
    description:
      'The earlier version of my portfolio, built to showcase projects while exploring React and styled-components.',
    category: 'Web application',
    role: 'Frontend development',
    image: '/images/original-portfolio.jpg',
    imageAlt: 'Personal Portfolio Website preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['React', 'styled-components', 'Vercel'],
    featured: false,
    order: 7,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/portfolio-website',
    demoUrl: 'https://carljamesroxas.vercel.app/',
  },
  {
    slug: 'cryptowhales',
    title: 'CryptoWhales',
    description:
      'A React application exploring cryptocurrency prices and news through public APIs, including Coinranking and CoinGecko.',
    category: 'Web application',
    role: 'Frontend development',
    image: '/images/cryptowhales.jpg',
    imageAlt: 'CryptoWhales preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['React', 'styled-components', 'REST APIs'],
    featured: false,
    order: 8,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/cryptowhales',
    demoUrl: 'https://cryptowhales.vercel.app/',
  },
  {
    slug: 'mern-authentication',
    title: 'MERN Stack Authentication System',
    description:
      'An early full-stack authentication project built with the MERN stack and styled-components.',
    category: 'Web application',
    role: 'Full-stack development',
    image: '/images/mern-authentication.jpg',
    imageAlt:
      'MERN Stack Authentication System preview from the original portfolio',
    color: '#e3e6ec',
    technologies: [
      'MongoDB',
      'Express',
      'React',
      'Node.js',
      'styled-components',
    ],
    featured: false,
    order: 9,
    caseStudy: {
      status: 'coming-soon',
    },
  },
  {
    slug: 'employee-record-management',
    title: 'Employee Record Management System',
    description:
      'An educational PHP and MySQL application for practicing employee-record CRUD operations and database queries.',
    category: 'Web application',
    role: 'Full-stack development · Group project',
    image: '/images/employee-records.jpg',
    imageAlt:
      'Employee Record Management System preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['PHP', 'MySQL', 'HTML', 'CSS'],
    featured: false,
    order: 10,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl:
      'https://github.com/Just-a-NoobieDev/ADSProjects-Employee--Record-Management-System',
    demoUrl: 'http://erms.rf.gd/',
  },
  {
    slug: 'netflix-clone',
    title: 'Netflix Clone',
    description:
      'An early React project recreating a streaming-service interface while learning to integrate APIs.',
    category: 'Web application',
    role: 'Frontend development',
    image: '/images/netflix-clone.jpg',
    imageAlt: 'Netflix Clone preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['React', 'REST APIs'],
    featured: false,
    order: 11,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/Netflix-landing-page',
    demoUrl: 'https://netflixclone-landing.vercel.app/',
  },
  {
    slug: 'covid-case-tracker',
    title: 'COVID-19 Case Tracker',
    description:
      'A vanilla JavaScript project exploring API data fetching and browser geolocation through a COVID-19 case tracker.',
    category: 'Web application',
    role: 'Frontend development',
    image: '/images/covid-tracker.jpg',
    imageAlt: 'COVID-19 Case Tracker preview from the original portfolio',
    color: '#e3e6ec',
    technologies: ['JavaScript', 'HTML', 'CSS', 'REST APIs'],
    featured: false,
    order: 12,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/Covid-19-Today',
    demoUrl: 'http://covid-19-today.infinityfreeapp.com/',
  },
  {
    slug: 'nestjs-graphql-todo',
    title: 'NestJS GraphQL Todo API',
    description:
      'A todo API built to learn GraphQL with NestJS, TypeScript, MongoDB, and Mongoose.',
    category: 'Backend & APIs',
    role: 'Backend development',
    image: '/images/api-placeholder.jpg',
    imageAlt:
      'Original API project placeholder; no interface screenshot supplied',
    color: '#e3e6ec',
    technologies: ['NestJS', 'GraphQL', 'TypeScript', 'MongoDB', 'Mongoose'],
    featured: false,
    order: 13,
    caseStudy: {
      status: 'coming-soon',
    },
    repositoryUrl: 'https://github.com/Just-a-NoobieDev/todo-nest-graphql',
  },
]
projects.sort((a, b) => a.order - b.order)
export const featuredProjects = projects.filter((project) => project.featured)
