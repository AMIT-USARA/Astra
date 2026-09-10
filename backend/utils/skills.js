// Skill dictionary for rule-based extraction.
// Each entry: canonical name -> extra aliases. Matching is case-insensitive
// unless the name is listed in CASE_SENSITIVE (words like "Go" or "R" that
// collide with plain English).

export const SKILLS = {
  'Programming Languages': {
    Python: [], Java: [], JavaScript: ['js', 'ecmascript'], TypeScript: ['ts'],
    'C++': ['cpp'], 'C#': ['csharp'], C: [], Go: ['golang'], Rust: [], Kotlin: [],
    Swift: [], PHP: [], Ruby: [], Scala: [], R: [], Dart: [], MATLAB: [],
    SQL: [], Bash: ['shell scripting'], Perl: [],
  },
  'Web & Frameworks': {
    React: ['react.js', 'reactjs'], 'Next.js': ['nextjs'], Angular: ['angularjs'],
    Vue: ['vue.js', 'vuejs'], 'Node.js': ['nodejs', 'node'], Express: ['express.js', 'expressjs'],
    Django: [], Flask: [], FastAPI: [], 'Spring Boot': ['spring framework'], '.NET': ['asp.net', 'dotnet'],
    Laravel: [], HTML: ['html5'], CSS: ['css3'], 'Tailwind CSS': ['tailwind'],
    Bootstrap: [], Redux: [], 'REST API': ['rest', 'restful', 'rest apis'], GraphQL: [],
    Flutter: [], 'React Native': [], jQuery: [], Vite: [],
  },
  Databases: {
    MySQL: [], PostgreSQL: ['postgres'], MongoDB: ['mongo'], SQLite: [], Redis: [],
    Oracle: [], 'SQL Server': ['mssql'], Firebase: ['firestore'], Cassandra: [],
    DynamoDB: [], Elasticsearch: [], Mongoose: [], Prisma: [],
  },
  'Cloud & DevOps': {
    AWS: ['amazon web services'], Azure: [], GCP: ['google cloud'], Docker: [],
    Kubernetes: ['k8s'], Jenkins: [], 'CI/CD': ['ci cd', 'github actions'],
    Terraform: [], Linux: ['unix'], Nginx: [], Vercel: [], Heroku: [],
  },
  'Tools': {
    Git: [], GitHub: [], GitLab: [], Postman: [], Jira: [], Figma: [],
    'VS Code': ['visual studio code'], Webpack: [], npm: [], Maven: [],
    Excel: ['ms excel'], 'Power BI': ['powerbi'], Tableau: [],
  },
  'AI / ML & Data': {
    'Machine Learning': ['ml'], 'Deep Learning': ['dl'], NLP: ['natural language processing'],
    'Computer Vision': ['opencv'], TensorFlow: [], PyTorch: [], Keras: [],
    'scikit-learn': ['sklearn', 'scikit learn'], Pandas: [], NumPy: [], Matplotlib: [],
    Seaborn: [], 'Data Analysis': ['data analytics'], 'Data Visualization': [],
    LLM: ['llms', 'large language models', 'generative ai', 'genai'], 'Hugging Face': ['transformers'],
    LangChain: [], 'Statistics': [], 'Jupyter': ['jupyter notebook'],
  },
  'CS Fundamentals': {
    'Data Structures': ['dsa', 'data structures and algorithms'], Algorithms: [],
    OOP: ['object oriented programming', 'object-oriented programming', 'oops'],
    DBMS: ['database management'], 'Operating Systems': ['os'], 'Computer Networks': [],
    'System Design': [], Microservices: [], 'Unit Testing': ['jest', 'junit', 'pytest'],
    Agile: ['scrum'],
  },
};

export const SOFT_SKILLS = {
  Communication: ['communication skills', 'communicate'],
  Teamwork: ['team player', 'collaboration', 'collaborated', 'collaborative', 'team work'],
  Leadership: ['led', 'leader', 'leading', 'mentored'],
  'Problem Solving': ['problem-solving', 'problem solver', 'analytical'],
  'Time Management': ['deadlines', 'prioritization'],
  Adaptability: ['adaptable', 'flexible', 'quick learner', 'fast learner'],
  'Critical Thinking': [],
  Creativity: ['creative', 'innovative'],
  'Attention to Detail': ['detail-oriented', 'detail oriented'],
  Presentation: ['public speaking', 'presented'],
};

const CASE_SENSITIVE = new Set(['Go', 'R', 'C', 'ml', 'dl', 'os', 'ts', 'node', 'rest']);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// "Boundary" that also treats + # . as part of a token, so "C" does not match inside "C++".
function buildMatcher(term) {
  const flags = CASE_SENSITIVE.has(term) ? 'g' : 'gi';
  // Case-sensitive short aliases are matched in either all-lower or the given form only when
  // they are uppercase acronyms; lower-case aliases like "ml" must appear as "ML".
  const pattern = CASE_SENSITIVE.has(term) && term === term.toLowerCase() ? term.toUpperCase() : term;
  return new RegExp(`(?<![A-Za-z0-9+#.])${escape(pattern)}(?![A-Za-z0-9+#]|\\.[A-Za-z0-9])`, flags);
}

function compile(dict) {
  return Object.entries(dict).map(([name, aliases]) => ({
    name,
    matchers: [name, ...aliases].map(buildMatcher),
  }));
}

const TECH = Object.entries(SKILLS).map(([category, dict]) => ({ category, skills: compile(dict) }));
const SOFT = compile(SOFT_SKILLS);

const hits = (text, skill) => skill.matchers.reduce((n, re) => n + (text.match(re)?.length || 0), 0);

// Returns { byCategory: {cat: [names]}, technical: [names], soft: [names], counts: {name: n} }
export function extractSkills(text) {
  const byCategory = {};
  const counts = {};
  for (const { category, skills } of TECH) {
    for (const s of skills) {
      const n = hits(text, s);
      if (n) {
        (byCategory[category] ||= []).push(s.name);
        counts[s.name] = n;
      }
    }
  }
  const soft = SOFT.filter((s) => hits(text, s) > 0).map((s) => s.name);
  return { byCategory, technical: Object.values(byCategory).flat(), soft, counts };
}

export const ALL_CATEGORIES = Object.keys(SKILLS);
