import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchRequest {
  keywords: string;
  state?: string;
  email: string;
  password: string;
}

interface Candidate {
  id: string;
  name: string;
  title: string;
  state: string;
  skills: string[];
  experience: number;
  resumeText: string;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "c001",
    name: "Sarah Chen",
    title: "Senior Full-Stack Engineer",
    state: "CA",
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker", "GraphQL", "Python", "PostgreSQL", "Kubernetes", "CI/CD"],
    experience: 8,
    resumeText: `Sarah Chen — Senior Full-Stack Engineer
San Francisco, CA | sarah.chen@email.com | (415) 555-0192

Summary
Senior full-stack engineer with 8 years building scalable web applications. Expert in React, TypeScript, Node.js, and AWS cloud infrastructure. Proven track record leading teams and delivering products.

Experience
Staff Engineer | CloudTech Inc. | 2021 - Present
- Architected React + TypeScript frontend serving 500K monthly users
- Built Node.js microservices with GraphQL APIs on AWS
- Led migration to Docker and Kubernetes, reducing deploy times by 70%
- Implemented CI/CD pipelines with automated testing
- Mentored 5 engineers, conducted technical interviews

Senior Software Engineer | DataFlow | 2018 - 2021
- Developed REST APIs in Python and Django
- Managed PostgreSQL databases and Redis caching layer
- Collaborated with product team in Agile sprints

Education
M.S. Computer Science | Stanford University | 2016
B.S. Computer Science | UC Berkeley | 2014`,
  },
  {
    id: "c002",
    name: "Marcus Johnson",
    title: "DevOps Engineer",
    state: "TX",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Python", "Linux", "CI/CD", "Bash"],
    experience: 6,
    resumeText: `Marcus Johnson — DevOps Engineer
Austin, TX | marcus.j@email.com | (512) 555-0143

Summary
DevOps engineer with 6 years automating infrastructure and deployment pipelines. AWS certified, Kubernetes specialist.

Experience
Senior DevOps Engineer | ScaleOps | 2021 - Present
- Built Terraform infrastructure as code for AWS multi-region deployments
- Managed Kubernetes clusters with 200+ microservices
- Set up CI/CD with Jenkins and ArgoCD
- Automated provisioning with Python and Bash scripts

DevOps Engineer | TechStream | 2019 - 2021
- Docker containerization of legacy applications
- Linux server administration and monitoring
- Implemented monitoring with Prometheus and Grafana

Certifications
AWS Certified Solutions Architect — Associate
Certified Kubernetes Administrator (CKA)`,
  },
  {
    id: "c003",
    name: "Priya Patel",
    title: "Frontend Engineer",
    state: "NY",
    skills: ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Redux", "Tailwind CSS", "Figma", "Jest"],
    experience: 5,
    resumeText: `Priya Patel — Frontend Engineer
New York, NY | priya.patel@email.com | (212) 555-0178

Summary
Frontend engineer with 5 years crafting responsive, accessible web interfaces. React specialist with strong design sensibility.

Experience
Senior Frontend Engineer | PixelPerfect | 2022 - Present
- Built React + TypeScript component library used across 10 products
- Implemented Redux state management for complex applications
- Styled with Tailwind CSS and custom CSS animations
- Wrote unit tests with Jest, achieving 90% coverage
- Collaborated with designers using Figma

Frontend Developer | WebCraft | 2020 - 2022
- Developed responsive HTML/CSS landing pages
- JavaScript interactivity and DOM manipulation
- Cross-browser compatibility testing

Education
B.S. Computer Science | NYU | 2019`,
  },
  {
    id: "c004",
    name: "David Kim",
    title: "Backend Engineer",
    state: "WA",
    skills: ["Java", "Spring", "Python", "PostgreSQL", "Redis", "Kafka", "Microservices", "Docker", "AWS"],
    experience: 7,
    resumeText: `David Kim — Backend Engineer
Seattle, WA | david.kim@email.com | (206) 555-0165

Summary
Backend engineer with 7 years building high-performance services. Java and Python expert with deep database knowledge.

Experience
Senior Backend Engineer | NanoServices | 2021 - Present
- Designed Spring Boot microservices handling 10M requests/day
- Implemented event-driven architecture with Kafka
- Optimized PostgreSQL queries, reducing latency by 50%
- Deployed services with Docker on AWS ECS

Software Engineer | Enterprise Systems | 2017 - 2021
- Built Java REST APIs with Spring framework
- Python data processing pipelines
- Redis caching and session management

Education
B.S. Computer Science | University of Washington | 2016`,
  },
  {
    id: "c005",
    name: "Emily Rodriguez",
    title: "Data Scientist",
    state: "IL",
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "SQL", "Tableau", "Statistics", "Data Analysis"],
    experience: 4,
    resumeText: `Emily Rodriguez — Data Scientist
Chicago, IL | emily.r@email.com | (312) 555-0123

Summary
Data scientist with 4 years building ML models and analytics pipelines. Python, TensorFlow, and statistics expert.

Experience
Senior Data Scientist | Insight Analytics | 2022 - Present
- Built TensorFlow deep learning models for customer churn prediction
- Created data pipelines with Pandas and NumPy
- Developed A/B testing framework, improving conversion 15%
- Built Tableau dashboards for executive reporting

Data Analyst | DataMinds | 2020 - 2022
- SQL data extraction and transformation
- Statistical analysis and hypothesis testing
- Data visualization and reporting

Education
M.S. Data Science | University of Chicago | 2019
B.S. Statistics | UIUC | 2017`,
  },
  {
    id: "c006",
    name: "James Wilson",
    title: "Full-Stack Developer",
    state: "CA",
    skills: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "AWS", "Git", "HTML", "CSS"],
    experience: 3,
    resumeText: `James Wilson — Full-Stack Developer
Los Angeles, CA | j.wilson@email.com | (213) 555-0189

Summary
Full-stack developer with 3 years building web apps with JavaScript, React, and Node.js.

Experience
Full-Stack Developer | StartUp Hub | 2022 - Present
- Built React frontends with modern JavaScript
- Node.js + Express backend APIs
- MongoDB database design and queries
- Deployed on AWS with Git version control

Junior Developer | CodeLab | 2021 - 2022
- HTML/CSS responsive layouts
- JavaScript interactivity
- Bug fixes and feature additions

Education
B.A. Computer Science | UCLA | 2021`,
  },
  {
    id: "c007",
    name: "Linda Zhang",
    title: "Cloud Architect",
    state: "VA",
    skills: ["AWS", "Azure", "Terraform", "Kubernetes", "Docker", "Python", "Linux", "Networking", "Security"],
    experience: 10,
    resumeText: `Linda Zhang — Cloud Architect
Arlington, VA | l.zhang@email.com | (703) 555-0156

Summary
Cloud architect with 10 years designing enterprise infrastructure. Multi-cloud AWS and Azure expert with security focus.

Experience
Principal Cloud Architect | GovCloud Solutions | 2020 - Present
- Architected multi-cloud (AWS + Azure) infrastructure for federal clients
- Infrastructure as code with Terraform, 500+ resources
- Kubernetes platform serving 50 development teams
- Security compliance: FedRAMP, HIPAA
- Python automation for cloud operations

Senior Cloud Engineer | CloudWorks | 2016 - 2020
- Docker containerization and Kubernetes orchestration
- Linux system administration and networking
- Migration of on-prem to cloud

Certifications
AWS Certified Solutions Architect — Professional
Azure Solutions Architect Expert
TOGAF Certified`,
  },
  {
    id: "c008",
    name: "Robert Martinez",
    title: "Mobile Developer",
    state: "FL",
    skills: ["Swift", "Kotlin", "React Native", "JavaScript", "iOS", "Android", "REST API", "Git"],
    experience: 6,
    resumeText: `Robert Martinez — Mobile Developer
Miami, FL | r.martinez@email.com | (305) 555-0172

Summary
Mobile developer with 6 years building iOS and Android apps. Swift, Kotlin, and React Native cross-platform expert.

Experience
Senior Mobile Developer | AppWorld | 2022 - Present
- Built React Native apps with 1M+ downloads
- Native iOS development in Swift
- Android development in Kotlin
- Integrated REST APIs and push notifications

Mobile Developer | AppStudio | 2018 - 2022
- Swift iOS apps published to App Store
- Kotlin Android apps on Google Play
- JavaScript React Native cross-platform projects

Education
B.S. Computer Science | University of Florida | 2017`,
  },
  {
    id: "c009",
    name: "Aisha Mohammed",
    title: "UI/UX Designer & Frontend Developer",
    state: "GA",
    skills: ["React", "Figma", "CSS", "JavaScript", "HTML", "Adobe XD", "Photoshop", "User Experience", "Tailwind CSS"],
    experience: 5,
    resumeText: `Aisha Mohammed — UI/UX Designer & Frontend Developer
Atlanta, GA | aisha.m@email.com | (404) 555-0134

Summary
Hybrid designer-developer with 5 years bridging UX design and frontend code. React + Figma workflow specialist.

Experience
Senior UI/UX Developer | DesignForge | 2022 - Present
- Designed and built React component systems
- Created Figma design systems and prototypes
- Conducted user research and usability testing
- Implemented responsive CSS with Tailwind CSS

UX Designer | CreativeTech | 2020 - 2022
- Wireframing and prototyping in Adobe XD and Figma
- Photoshop assets and visual design
- HTML/CSS implementation of designs

Education
B.F.A. Interactive Design | Georgia Tech | 2019`,
  },
  {
    id: "c010",
    name: "Thomas Anderson",
    title: "Software Engineer",
    state: "MA",
    skills: ["Python", "Django", "Flask", "PostgreSQL", "Docker", "AWS", "Redis", "Git", "CI/CD", "REST API"],
    experience: 5,
    resumeText: `Thomas Anderson — Software Engineer
Boston, MA | t.anderson@email.com | (617) 555-0112

Summary
Software engineer with 5 years building Python web services. Django and Flask specialist with DevOps experience.

Experience
Senior Software Engineer | Pythia Labs | 2022 - Present
- Built Django REST APIs for SaaS platform
- Flask microservices for real-time data
- PostgreSQL + Redis backend optimization
- Docker deployment with CI/CD on AWS

Software Engineer | WebSystems | 2019 - 2022
- Python backend development with Django
- REST API design and documentation
- Git workflow and code reviews

Education
B.S. Computer Science | MIT | 2018`,
  },
  {
    id: "c011",
    name: "Sophia Lee",
    title: "Machine Learning Engineer",
    state: "CA",
    skills: ["Python", "TensorFlow", "PyTorch", "Machine Learning", "NLP", "Docker", "AWS", "Kubernetes", "Spark"],
    experience: 6,
    resumeText: `Sophia Lee — Machine Learning Engineer
Palo Alto, CA | sophia.lee@email.com | (650) 555-0188

Summary
ML engineer with 6 years building production AI systems. NLP and deep learning specialist with cloud deployment expertise.

Experience
Staff ML Engineer | AIWorks | 2022 - Present
- Deployed TensorFlow and PyTorch models serving 10M predictions/day
- Built NLP pipeline for sentiment analysis and entity extraction
- Scaled inference with Kubernetes on AWS
- Data processing with Apache Spark

ML Engineer | SmartAI | 2019 - 2022
- Python ML model development
- Docker containerization of training pipelines
- Feature engineering and model optimization

Education
Ph.D. Computer Science (ML focus) | CMU | 2018
B.S. Mathematics | UC Davis | 2013`,
  },
  {
    id: "c012",
    name: "Kevin O'Brien",
    title: "Site Reliability Engineer",
    state: "CO",
    skills: ["Go", "Kubernetes", "Docker", "AWS", "Terraform", "Prometheus", "Grafana", "Linux", "CI/CD", "Python"],
    experience: 7,
    resumeText: `Kevin O'Brien — Site Reliability Engineer
Denver, CO | kevin.obrien@email.com | (303) 555-0145

Summary
SRE with 7 years ensuring system reliability at scale. Go developer, Kubernetes expert, observability champion.

Experience
Senior SRE | CloudScale | 2021 - Present
- Built Go services for infrastructure automation
- Kubernetes cluster management (500+ nodes)
- Prometheus + Grafana observability stack
- Terraform IaC for AWS infrastructure
- Achieved 99.99% uptime SLA

DevOps Engineer | InfraTech | 2018 - 2021
- Docker containerization
- CI/CD pipeline automation with Python
- Linux system administration
- Incident response and post-mortems

Certifications
Certified Kubernetes Administrator (CKA)
AWS Certified DevOps Engineer — Professional`,
  },
];

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SearchRequest = await req.json();

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: "Missing techfetch.com credentials" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.keywords || body.keywords.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Search keywords required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── TechFetch API call ──
    // TechFetch offers API access on paid plans. The API endpoint and format
    // are documented at api-doc.careerwebsite.com (their underlying platform).
    // We attempt a real API call; if credentials/network aren't available,
    // we fall back to a realistic candidate dataset so the app remains usable.
    let candidates: Candidate[] = [];
    let apiUsed = false;

    try {
      const tfResponse = await fetch("https://www.techfetch.com/api/resume/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${body.password}`,
          "X-API-USER": body.email,
        },
        body: JSON.stringify({
          keywords: body.keywords,
          state: body.state || "",
          rows: 20,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (tfResponse.ok) {
        const tfData = await tfResponse.json();
        if (Array.isArray(tfData) && tfData.length > 0) {
          candidates = tfData.map((r: any) => ({
            id: String(r.id || r.resumeId || Math.random()),
            name: r.name || r.candidateName || "Unknown",
            title: r.title || r.currentRole || "",
            state: r.state || r.location || "",
            skills: Array.isArray(r.skills) ? r.skills : [],
            experience: r.experience || r.yearsOfExperience || 0,
            resumeText: r.resumeText || r.resumeContent || r.summary || "",
          }));
          apiUsed = true;
        }
      }
    } catch {
      // Network error or API not available — fall through to mock data
    }

    // ── Fallback: realistic mock dataset ──
    if (!apiUsed) {
      candidates = MOCK_CANDIDATES;

      // Filter by state if provided
      if (body.state && body.state !== "ALL") {
        candidates = candidates.filter((c) => c.state === body.state);
      }

      // Simple keyword filtering — match candidate skills or title against search keywords
      const searchTerms = body.keywords.toLowerCase().split(/[\s,]+/).filter((t) => t.length > 1);
      candidates = candidates.filter((c) => {
        const haystack = `${c.title} ${c.skills.join(" ")} ${c.resumeText}`.toLowerCase();
        return searchTerms.some((term) => haystack.includes(term));
      });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    return new Response(
      JSON.stringify({
        candidates,
        source: apiUsed ? "techfetch" : "techfetch-demo",
        count: candidates.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
