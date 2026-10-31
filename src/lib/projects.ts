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
]
projects.sort((a, b) => a.order - b.order)
export const featuredProjects = projects.filter((project) => project.featured)
