"""
roadmap_generator.py  (v3 — all roles)
----------------------------------------
Generates personalized learning roadmaps for ALL 12 career roles.
Primary  : Google Gemini API (when available)
Fallback : Rule-based roadmaps for all 12 roles — fully dynamic
           based on each person's actual skill gaps

Supported roles:
  Full Stack Developer, Frontend Developer, Backend Developer,
  Machine Learning Engineer, Data Scientist, Data Analyst,
  DevOps Engineer, Cloud Engineer, AI/GenAI Engineer,
  NLP Engineer, Android Developer, Software Engineer

Standalone test:
    python roadmap_generator.py
"""

import json
import re
import google.generativeai as genai

# ─── Config ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = "AIzaSyAfpSyHO6jfo53_YAirFkBVGjEJDElYOys"
genai.configure(api_key=GEMINI_API_KEY)


# ─── Role Phase Templates ─────────────────────────────────────────────────────
# Each role has 4 phase TEMPLATES.
# {missing} is replaced dynamically with the person's actual missing skills.
# If no skills are missing for a phase, generic advancement tasks are shown.

ROLE_TEMPLATES = {

    "Full Stack Developer": [
        {
            "title": "Core Web Fundamentals & Missing Languages",
            "focus": "Fill gaps in HTML, CSS, JavaScript and TypeScript",
            "resource_tasks": [
                ("typescript",  "Complete TypeScript Handbook at typescriptlang.org/docs (free, official)"),
                ("sql",         "Complete SQLZoo.net SQL tutorial (free) — practice JOIN, GROUP BY, indexes"),
                ("javascript",  "Complete 'JavaScript30' by Wes Bos (free) — 30 JS projects in 30 days"),
                ("html",        "Complete freeCodeCamp Responsive Web Design certification (free)"),
                ("css",         "Complete 'CSS for JavaScript Developers' by Josh Comeau (advanced CSS)"),
                ("react",       "Complete official React docs tutorial at react.dev (free)"),
                ("redux",       "Complete Redux Toolkit docs + build a shopping cart project"),
            ],
        },
        {
            "title": "Backend & Database Mastery",
            "focus": "Build scalable APIs and master database design",
            "resource_tasks": [
                ("node.js",     "Complete 'The Complete Node.js Developer Course' on Udemy by Andrew Mead"),
                ("express",     "Build 3 REST APIs using Express.js — auth, CRUD, file upload"),
                ("fastapi",     "Complete FastAPI official tutorial at fastapi.tiangolo.com (free)"),
                ("django",      "Complete Django Girls Tutorial (free) + build a blog application"),
                ("mongodb",     "Complete MongoDB University M001 free course at learn.mongodb.com"),
                ("postgresql",  "Complete 'PostgreSQL Tutorial' at postgresqltutorial.com (free)"),
                ("graphql",     "Complete 'How to GraphQL' at howtographql.com (free, full tutorial)"),
                ("redis",       "Complete Redis University RU101 (free) — intro to Redis data structures"),
            ],
        },
        {
            "title": "Cloud, Docker & DevOps Basics",
            "focus": "Deploy applications using containers and cloud platforms",
            "resource_tasks": [
                ("docker",      "Complete 'Docker for Beginners' at docker.com/101-tutorial (free)"),
                ("aws",         "Complete AWS Cloud Practitioner Essentials on AWS Skill Builder (free)"),
                ("gcp",         "Complete Google Cloud Fundamentals course on Coursera (free audit)"),
                ("kubernetes",  "Complete 'Kubernetes for Beginners' on KodeKloud (free tier)"),
                ("ci/cd",       "Set up GitHub Actions CI/CD pipeline for your existing project"),
                ("nginx",       "Deploy a Node.js app behind Nginx reverse proxy on a Linux server"),
                ("vercel",      "Deploy React frontend on Vercel + backend on Railway (both free)"),
            ],
        },
        {
            "title": "System Design, Portfolio & Job Readiness",
            "focus": "Build impressive projects and prepare for technical interviews",
            "resource_tasks": [
                ("default_1",   "Study system design at systemdesign.io — load balancing, caching, databases"),
                ("default_2",   "Build a full-stack SaaS app with auth, dashboard, and real-time features"),
                ("default_3",   "Solve 50 LeetCode problems (Easy + Medium) focusing on arrays and strings"),
                ("default_4",   "Deploy complete project and write a detailed README with architecture diagram"),
            ],
        },
    ],

    "Frontend Developer": [
        {
            "title": "Advanced JavaScript & TypeScript",
            "focus": "Master modern JavaScript and add TypeScript to your stack",
            "resource_tasks": [
                ("typescript",  "Complete TypeScript Handbook at typescriptlang.org — strict mode, generics"),
                ("javascript",  "Complete 'You Don't Know JS' (free book on GitHub) — closures, async, prototypes"),
                ("react",       "Complete react.dev official docs — hooks, context, performance optimization"),
                ("vue",         "Complete Vue.js official tutorial at vuejs.org/tutorial (free)"),
                ("angular",     "Complete 'Tour of Heroes' Angular tutorial at angular.dev (free, official)"),
                ("redux",       "Complete Redux Toolkit Quick Start guide + build a task manager app"),
            ],
        },
        {
            "title": "UI Frameworks & Build Tools",
            "focus": "Learn modern CSS frameworks and frontend build tools",
            "resource_tasks": [
                ("tailwind",    "Complete Tailwind CSS docs + build 5 UI components from scratch"),
                ("next.js",     "Complete Next.js official tutorial at nextjs.org/learn (free)"),
                ("webpack",     "Complete 'SurviveJS — Webpack' free online book"),
                ("vite",        "Complete Vite official guide at vitejs.dev/guide (free)"),
                ("sass",        "Complete Sass basics at sass-lang.com/guide (free, 1 day)"),
                ("bootstrap",   "Build a responsive portfolio site using Bootstrap 5"),
            ],
        },
        {
            "title": "Performance, Testing & Accessibility",
            "focus": "Build production-grade accessible and fast frontends",
            "resource_tasks": [
                ("default_1",   "Study Web Vitals (LCP, FID, CLS) at web.dev/vitals — optimize a real project"),
                ("default_2",   "Complete 'Testing JavaScript' by Kent C. Dodds at testingjavascript.com"),
                ("default_3",   "Complete 'Web Accessibility' course on web.dev/learn/accessibility (free)"),
                ("default_4",   "Implement lazy loading, code splitting, and memoization in a React app"),
            ],
        },
        {
            "title": "Portfolio Projects & Interview Prep",
            "focus": "Build 3 impressive projects and crack frontend interviews",
            "resource_tasks": [
                ("default_1",   "Build a real-time dashboard using React + WebSocket + Chart.js"),
                ("default_2",   "Clone a complex UI (Airbnb, Notion) to demonstrate CSS mastery"),
                ("default_3",   "Practice 30 frontend interview questions from frontendinterviewhandbook.com"),
                ("default_4",   "Deploy all projects on Vercel with custom domain and add to portfolio"),
            ],
        },
    ],

    "Backend Developer": [
        {
            "title": "Core Backend Language & Framework",
            "focus": "Strengthen server-side programming and REST API design",
            "resource_tasks": [
                ("python",      "Complete 'Python for Everybody' on Coursera (free audit) — advanced Python"),
                ("node.js",     "Complete 'Node.js — The Complete Guide' on Udemy by Maximilian Schwarzmüller"),
                ("fastapi",     "Complete FastAPI official tutorial — async endpoints, Pydantic, dependency injection"),
                ("django",      "Complete Django REST Framework tutorial at django-rest-framework.org (free)"),
                ("flask",       "Build a production-ready REST API with Flask-RESTful + JWT authentication"),
                ("express",     "Build an Express.js API with rate limiting, caching, and error handling middleware"),
                ("sql",         "Complete SQLZoo.net — practice complex queries, indexes, transactions"),
            ],
        },
        {
            "title": "Databases & Caching",
            "focus": "Master both SQL and NoSQL databases with caching strategies",
            "resource_tasks": [
                ("postgresql",  "Complete 'PostgreSQL Tutorial' at postgresqltutorial.com + practice EXPLAIN ANALYZE"),
                ("mongodb",     "Complete MongoDB University M001 + M121 Aggregation Pipeline (both free)"),
                ("redis",       "Complete Redis University RU101 — caching, sessions, pub/sub patterns"),
                ("elasticsearch","Complete Elasticsearch 'Getting Started' guide at elastic.co/guide (free)"),
                ("mysql",       "Complete 'MySQL for Beginners' on MySQL.com official docs (free)"),
            ],
        },
        {
            "title": "APIs, Security & Docker",
            "focus": "Build secure scalable APIs and containerize applications",
            "resource_tasks": [
                ("graphql",     "Complete 'How to GraphQL' at howtographql.com — queries, mutations, subscriptions"),
                ("docker",      "Dockerize an existing API with multi-stage builds and docker-compose"),
                ("aws",         "Deploy a backend API on AWS Lambda (serverless) or EC2 (free tier)"),
                ("default_1",   "Implement JWT authentication, OAuth2, rate limiting in an existing project"),
                ("default_2",   "Set up API monitoring with logging, health checks, and alerting"),
            ],
        },
        {
            "title": "System Design & Interview Prep",
            "focus": "Design scalable systems and crack backend interviews",
            "resource_tasks": [
                ("default_1",   "Study 'Designing Data-Intensive Applications' by Martin Kleppmann (key chapters)"),
                ("default_2",   "Practice system design — design Twitter, URL shortener, chat system"),
                ("default_3",   "Solve 50 LeetCode problems focusing on dynamic programming and graphs"),
                ("default_4",   "Build a production API project with full documentation, tests, and CI/CD"),
            ],
        },
    ],

    "Machine Learning Engineer": [
        {
            "title": "ML Foundations & Missing Libraries",
            "focus": "Fill gaps in core ML libraries and mathematical foundations",
            "resource_tasks": [
                ("scikit-learn","Complete 'Hands-On ML with Scikit-Learn & TensorFlow' by Aurélien Géron (Ch 1-8)"),
                ("pandas",      "Complete '10 Minutes to pandas' + Kaggle pandas course (free)"),
                ("numpy",       "Complete 'NumPy for Beginners' at numpy.org/doc/stable/user/quickstart.html"),
                ("matplotlib",  "Complete Matplotlib official tutorials at matplotlib.org/stable/tutorials"),
                ("tensorflow",  "Complete TensorFlow 2.0 official tutorials at tensorflow.org/tutorials (free)"),
                ("pytorch",     "Complete 'Deep Learning with PyTorch' on fast.ai (free course)"),
            ],
        },
        {
            "title": "Deep Learning & Neural Networks",
            "focus": "Master neural network architectures and training techniques",
            "resource_tasks": [
                ("deep learning","Complete 'Deep Learning Specialization' by Andrew Ng on Coursera (audit free)"),
                ("computer vision","Complete 'CS231n: CNNs for Visual Recognition' at cs231n.stanford.edu (free)"),
                ("nlp",         "Complete 'CS224n: NLP with Deep Learning' at cs224n.stanford.edu (free)"),
                ("pytorch",     "Build a CNN image classifier + LSTM text classifier from scratch in PyTorch"),
                ("default_1",   "Implement batch normalization, dropout, learning rate scheduling from scratch"),
            ],
        },
        {
            "title": "MLOps & Model Deployment",
            "focus": "Deploy ML models to production with monitoring",
            "resource_tasks": [
                ("docker",      "Dockerize an ML model with FastAPI serving endpoint"),
                ("aws",         "Deploy model on AWS SageMaker or Google Vertex AI (free tier)"),
                ("default_1",   "Complete 'MLOps Specialization' on Coursera by DeepLearning.AI (audit free)"),
                ("default_2",   "Set up ML experiment tracking with MLflow or Weights & Biases (free tier)"),
                ("default_3",   "Build a model monitoring pipeline — detect data drift and model degradation"),
            ],
        },
        {
            "title": "Kaggle Projects & Interview Prep",
            "focus": "Build portfolio with Kaggle competitions and ML interviews",
            "resource_tasks": [
                ("default_1",   "Complete 2 Kaggle competitions — focus on feature engineering and ensembles"),
                ("default_2",   "Read 'Machine Learning System Design Interview' by Ali Aminian"),
                ("default_3",   "Build an end-to-end ML pipeline with data ingestion, training, and serving"),
                ("default_4",   "Practice ML interview questions at mlinterviews.com and leetcode ML section"),
            ],
        },
    ],

    "Data Scientist": [
        {
            "title": "Statistics, Python & Data Manipulation",
            "focus": "Strengthen statistical foundations and data wrangling skills",
            "resource_tasks": [
                ("python",      "Complete 'Python for Data Science' on DataCamp (first track free)"),
                ("pandas",      "Complete Kaggle pandas course (free) — groupby, merge, pivot tables"),
                ("numpy",       "Complete NumPy quickstart guide at numpy.org — array operations, broadcasting"),
                ("sql",         "Complete 'Mode SQL Tutorial' at mode.com/sql-tutorial (free, analytics focused)"),
                ("r",           "Complete 'R for Data Science' free book at r4ds.had.co.nz"),
                ("default_1",   "Study statistics: probability distributions, hypothesis testing, regression"),
            ],
        },
        {
            "title": "Machine Learning & Modelling",
            "focus": "Build predictive models and learn model evaluation techniques",
            "resource_tasks": [
                ("machine learning","Complete 'ML Specialization' by Andrew Ng on Coursera (audit free)"),
                ("scikit-learn","Build 5 ML models: classification, regression, clustering, anomaly detection"),
                ("tensorflow",  "Complete TensorFlow tutorials for structured data prediction (tensorflow.org)"),
                ("default_1",   "Practice on Kaggle — join a tabular data competition and finish top 50%"),
                ("default_2",   "Study model interpretability: SHAP, LIME — explain any black-box model"),
            ],
        },
        {
            "title": "Data Visualization & Storytelling",
            "focus": "Communicate insights effectively with visualizations",
            "resource_tasks": [
                ("matplotlib",  "Complete 'Scientific Visualization: Python + Matplotlib' free book on GitHub"),
                ("tableau",     "Complete Tableau Public free training videos at help.tableau.com"),
                ("default_1",   "Complete 'Storytelling with Data' book by Cole Nussbaumer Knaflic"),
                ("default_2",   "Build an interactive dashboard using Plotly Dash or Streamlit (both free)"),
                ("default_3",   "Create a data story presentation combining SQL + Python + Tableau"),
            ],
        },
        {
            "title": "Portfolio & Data Science Interviews",
            "focus": "Build 3 end-to-end projects and crack DS interviews",
            "resource_tasks": [
                ("default_1",   "Complete an end-to-end project: data collection, EDA, modelling, deployment"),
                ("default_2",   "Practice SQL interview questions at datalemur.com (free, 100+ questions)"),
                ("default_3",   "Study 'Ace the Data Science Interview' book for stats + ML + SQL questions"),
                ("default_4",   "Publish 2 analysis notebooks on Kaggle and write blog posts on Medium"),
            ],
        },
    ],

    "Data Analyst": [
        {
            "title": "SQL & Excel Mastery",
            "focus": "Master data querying and spreadsheet analysis",
            "resource_tasks": [
                ("sql",         "Complete 'Mode SQL Tutorial' at mode.com/sql-tutorial (free, 4 levels)"),
                ("python",      "Complete 'Python for Data Analysis' on Kaggle (free) — pandas focused"),
                ("excel",       "Complete 'Excel Skills for Business' on Coursera by Macquarie (audit free)"),
                ("default_1",   "Practice 50 SQL questions on datalemur.com — focus on window functions"),
            ],
        },
        {
            "title": "Data Visualization Tools",
            "focus": "Learn BI tools to create executive dashboards",
            "resource_tasks": [
                ("tableau",     "Complete Tableau Desktop free student license training at trailhead.tableau.com"),
                ("power bi",    "Complete 'Microsoft Power BI Data Analyst' on Microsoft Learn (free)"),
                ("matplotlib",  "Build 10 charts in Python — bar, line, scatter, heatmap, box plots"),
                ("default_1",   "Build an end-to-end sales dashboard from raw CSV to published dashboard"),
            ],
        },
        {
            "title": "Statistics & Machine Learning Basics",
            "focus": "Add statistical and ML knowledge to enhance analysis",
            "resource_tasks": [
                ("machine learning","Complete 'Intro to Machine Learning' on Kaggle (free, 4 hours)"),
                ("default_1",   "Study A/B testing — design, run, and analyze an experiment from scratch"),
                ("default_2",   "Complete 'Statistics with Python' on Coursera by Michigan (audit free)"),
                ("default_3",   "Build a customer churn prediction model using Python + scikit-learn"),
            ],
        },
        {
            "title": "Portfolio & Analyst Interview Prep",
            "focus": "Build data portfolio and crack analyst interviews",
            "resource_tasks": [
                ("default_1",   "Complete a full EDA project on a real dataset and publish on GitHub"),
                ("default_2",   "Practice SQL + Python interview questions at datalemur.com and stratascratch.com"),
                ("default_3",   "Build a portfolio site showing 3 analysis projects with insights and dashboards"),
                ("default_4",   "Study case interview frameworks for data analyst roles at tech companies"),
            ],
        },
    ],

    "DevOps Engineer": [
        {
            "title": "Linux, Bash & Networking Fundamentals",
            "focus": "Master Linux administration and shell scripting",
            "resource_tasks": [
                ("linux",       "Complete 'The Linux Command Line' free book at linuxcommand.org"),
                ("bash",        "Complete 'Bash Scripting Tutorial' at linuxconfig.org (free, full guide)"),
                ("default_1",   "Practice Linux commands daily on OverTheWire: Bandit (free, gamified)"),
                ("default_2",   "Study networking: TCP/IP, DNS, HTTP, firewalls, load balancing basics"),
            ],
        },
        {
            "title": "Docker, Kubernetes & CI/CD",
            "focus": "Master containerization and deployment automation",
            "resource_tasks": [
                ("docker",      "Complete Docker official 'Get Started' tutorial + docker-compose deep dive"),
                ("kubernetes",  "Complete 'Kubernetes for Beginners' on KodeKloud (free tier available)"),
                ("ci/cd",       "Build a full CI/CD pipeline: GitHub Actions → Docker → deploy to cloud"),
                ("jenkins",     "Complete Jenkins official 'Getting Started' guide + set up a pipeline"),
                ("github actions","Complete GitHub Actions documentation — build, test, deploy workflows"),
            ],
        },
        {
            "title": "Cloud Infrastructure & IaC",
            "focus": "Provision and manage cloud infrastructure as code",
            "resource_tasks": [
                ("aws",         "Complete AWS Solutions Architect Associate course on A Cloud Guru (free trial)"),
                ("terraform",   "Complete 'HashiCorp Terraform Associate' tutorial at developer.hashicorp.com (free)"),
                ("ansible",     "Complete 'Ansible for DevOps' by Jeff Geerling (free PDF on GitHub)"),
                ("azure",       "Complete 'AZ-900 Azure Fundamentals' on Microsoft Learn (free)"),
                ("gcp",         "Complete 'Google Cloud Digital Leader' on Google Cloud Skills Boost (free)"),
            ],
        },
        {
            "title": "Monitoring, Security & Interview Prep",
            "focus": "Set up observability and prepare for DevOps interviews",
            "resource_tasks": [
                ("default_1",   "Set up Prometheus + Grafana monitoring stack for a Dockerized application"),
                ("default_2",   "Study DevSecOps — implement SAST, DAST, secret scanning in CI/CD pipeline"),
                ("default_3",   "Complete 'DevOps Interview Questions' guide at roadmap.sh/devops (free)"),
                ("default_4",   "Build a complete DevOps project: app + Docker + K8s + Terraform + monitoring"),
            ],
        },
    ],

    "Cloud Engineer": [
        {
            "title": "Cloud Fundamentals & Core Services",
            "focus": "Get certified in core cloud services",
            "resource_tasks": [
                ("aws",         "Complete AWS Cloud Practitioner + Solutions Architect Associate certifications"),
                ("azure",       "Complete AZ-900 + AZ-104 Azure Administrator on Microsoft Learn (free)"),
                ("gcp",         "Complete 'Associate Cloud Engineer' on Google Cloud Skills Boost (free labs)"),
                ("networking",  "Study VPC, subnets, security groups, NAT, VPN, Direct Connect on AWS"),
                ("linux",       "Complete 'Linux Fundamentals for Cloud' on Linux Foundation (LFS101 free)"),
            ],
        },
        {
            "title": "Infrastructure as Code & Automation",
            "focus": "Automate cloud infrastructure with IaC tools",
            "resource_tasks": [
                ("terraform",   "Complete Terraform Associate tutorial + provision a 3-tier AWS architecture"),
                ("ansible",     "Automate server configuration with Ansible playbooks (Jeff Geerling book free)"),
                ("docker",      "Containerize 3 apps and deploy on AWS ECS or Google Cloud Run"),
                ("kubernetes",  "Deploy a multi-service app on AWS EKS or GKE Kubernetes cluster"),
                ("ci/cd",       "Build automated infrastructure deployment pipeline with Terraform + GitHub Actions"),
            ],
        },
        {
            "title": "Cloud Security & Cost Optimization",
            "focus": "Secure cloud environments and optimize cloud costs",
            "resource_tasks": [
                ("default_1",   "Complete AWS Security Specialty or Google Cloud Security Engineer learning path"),
                ("default_2",   "Implement IAM least-privilege, MFA, CloudTrail, GuardDuty on AWS project"),
                ("default_3",   "Study FinOps — use AWS Cost Explorer and set budget alerts + rightsizing"),
                ("default_4",   "Complete 'Cloud Security Alliance' free training at cloudsecurityalliance.org"),
            ],
        },
        {
            "title": "Projects, Certifications & Job Prep",
            "focus": "Earn certifications and build cloud portfolio",
            "resource_tasks": [
                ("default_1",   "Build a complete cloud project: multi-region, highly available 3-tier app on AWS"),
                ("default_2",   "Earn at least one associate-level certification (AWS SAA, AZ-104, or GCP ACE)"),
                ("default_3",   "Practice cloud architecture interview questions at cloudinterviews.io"),
                ("default_4",   "Contribute to an open-source Terraform module on GitHub"),
            ],
        },
    ],

    "AI / GenAI Engineer": [
        {
            "title": "LLM Fundamentals & Prompt Engineering",
            "focus": "Understand how LLMs work and master prompt engineering",
            "resource_tasks": [
                ("llm",         "Complete 'ChatGPT Prompt Engineering for Developers' on DeepLearning.AI (free)"),
                ("generative ai","Study LLM architectures: GPT, BERT, T5, Llama — read Andrej Karpathy's blog"),
                ("python",      "Complete 'Python for AI' on fast.ai — async, generators, type hints for AI apps"),
                ("default_1",   "Practice advanced prompting: chain-of-thought, few-shot, ReAct, self-consistency"),
            ],
        },
        {
            "title": "LangChain, RAG & Vector Databases",
            "focus": "Build production GenAI applications with RAG architecture",
            "resource_tasks": [
                ("langchain",   "Complete LangChain Python docs tutorials at python.langchain.com/docs (free)"),
                ("default_1",   "Build a RAG chatbot using LangChain + FAISS/Chroma + OpenAI/Gemini API"),
                ("default_2",   "Complete 'LangChain for LLM Application Development' on DeepLearning.AI (free)"),
                ("fastapi",     "Build a production GenAI API with FastAPI + LangChain + streaming responses"),
            ],
        },
        {
            "title": "Hugging Face, Fine-tuning & Open Source LLMs",
            "focus": "Fine-tune open-source models for specific tasks",
            "resource_tasks": [
                ("hugging face","Complete Hugging Face NLP course at huggingface.co/learn (free, official)"),
                ("transformers","Fine-tune DistilBERT on custom classification task using Hugging Face Trainer"),
                ("pytorch",     "Complete 'Deep Learning with PyTorch' on fast.ai — required for fine-tuning"),
                ("default_1",   "Fine-tune Llama 2 or Mistral using QLoRA/LoRA on Google Colab (free GPU)"),
                ("default_2",   "Deploy fine-tuned model on Hugging Face Spaces with Gradio demo interface"),
            ],
        },
        {
            "title": "AI Agents, Portfolio & Job Readiness",
            "focus": "Build autonomous AI agents and prepare for GenAI interviews",
            "resource_tasks": [
                ("default_1",   "Build an AI agent with tools (web search, code execution, DB queries)"),
                ("default_2",   "Complete 'Building Systems with ChatGPT API' on DeepLearning.AI (free)"),
                ("default_3",   "Study GenAI system design: latency, cost, hallucination reduction strategies"),
                ("default_4",   "Build a full GenAI product and deploy — add to GitHub + write a case study"),
            ],
        },
    ],

    "NLP Engineer": [
        {
            "title": "Transformers & Hugging Face Ecosystem",
            "focus": "Master the transformer architecture and Hugging Face library",
            "resource_tasks": [
                ("transformers","Complete Hugging Face NLP course at huggingface.co/learn (free, 9 chapters)"),
                ("hugging face","Study 'Attention Is All You Need' paper + Jay Alammar's illustrated guide"),
                ("nlp",         "Build text classification, NER, and summarization using Hugging Face Transformers"),
                ("default_1",   "Complete 'Natural Language Processing Specialization' on Coursera by DeepLearning.AI"),
            ],
        },
        {
            "title": "spaCy, NLTK & Production NLP",
            "focus": "Learn industry-standard NLP libraries for production pipelines",
            "resource_tasks": [
                ("spacy",       "Complete spaCy 101 course at spacy.io/usage/spacy-101 (free, official)"),
                ("nltk",        "Complete NLTK book at nltk.org/book (free) — ch 1-5 cover all essentials"),
                ("default_1",   "Build an end-to-end NLP pipeline: tokenize → POS tag → NER → relation extract"),
                ("default_2",   "Build a production text search engine using spaCy + Elasticsearch"),
            ],
        },
        {
            "title": "PyTorch & Custom Model Training",
            "focus": "Train custom NLP models from scratch using PyTorch",
            "resource_tasks": [
                ("pytorch",     "Complete 'Deep Learning with PyTorch' on fast.ai (free course, 7 lessons)"),
                ("default_1",   "Implement LSTM text classifier + transformer from scratch in PyTorch"),
                ("default_2",   "Fine-tune DistilBERT on a custom NLP task using Hugging Face + PyTorch"),
                ("default_3",   "Complete Kaggle NLP competition using a custom fine-tuned transformer model"),
            ],
        },
        {
            "title": "Deploy NLP Projects & Interview Prep",
            "focus": "Build portfolio projects and prepare for NLP Engineer interviews",
            "resource_tasks": [
                ("default_1",   "Build sentiment analysis API using FastAPI + Hugging Face model (deploy on HF Spaces)"),
                ("default_2",   "Create document Q&A system using LangChain + vector embeddings + RAG"),
                ("default_3",   "Study NLP interview questions: attention, BERT, fine-tuning, tokenization"),
                ("default_4",   "Publish 2 NLP projects on GitHub with detailed README and live demo"),
            ],
        },
    ],

    "Android Developer": [
        {
            "title": "Kotlin & Android Fundamentals",
            "focus": "Master Kotlin and core Android development concepts",
            "resource_tasks": [
                ("kotlin",      "Complete 'Kotlin Bootcamp for Programmers' on Udacity (free)"),
                ("java",        "Complete 'Java Programming Masterclass' — OOP, collections, generics"),
                ("android",     "Complete 'Android Basics with Compose' at developer.android.com (free, official)"),
                ("default_1",   "Build 3 Android apps: To-Do list, Weather app, Camera app"),
            ],
        },
        {
            "title": "Jetpack Compose & Modern Android",
            "focus": "Learn declarative UI with Jetpack Compose",
            "resource_tasks": [
                ("default_1",   "Complete 'Jetpack Compose for Android Developers' on developer.android.com (free)"),
                ("default_2",   "Build a full app using MVVM + LiveData/StateFlow + Room database"),
                ("default_3",   "Implement navigation, animations, and theming with Jetpack Compose"),
                ("firebase",    "Integrate Firebase Auth + Firestore + Cloud Messaging in a Compose app"),
            ],
        },
        {
            "title": "Backend Integration & APIs",
            "focus": "Integrate REST APIs and backend services in Android apps",
            "resource_tasks": [
                ("rest api",    "Integrate REST APIs using Retrofit + OkHttp + Gson in an Android app"),
                ("sqlite",      "Implement local database with Room ORM — offline-first app architecture"),
                ("default_1",   "Implement push notifications, deep links, and background sync with WorkManager"),
                ("default_2",   "Study Android architecture patterns: MVVM, MVI, Clean Architecture"),
            ],
        },
        {
            "title": "Publishing & Interview Prep",
            "focus": "Publish apps on Play Store and prepare for Android interviews",
            "resource_tasks": [
                ("default_1",   "Complete Android performance optimization — reduce APK size, improve startup time"),
                ("default_2",   "Write unit and UI tests using JUnit + Espresso for an existing app"),
                ("default_3",   "Publish a complete app on Google Play Store (free developer account for students)"),
                ("default_4",   "Practice Android interview questions at androidinterviewquestions.com"),
            ],
        },
    ],

    "Software Engineer": [
        {
            "title": "Data Structures & Algorithms",
            "focus": "Master DSA — the foundation of all software engineering interviews",
            "resource_tasks": [
                ("python",      "Complete 'Problem Solving with Algorithms and Data Structures using Python' (free online)"),
                ("java",        "Implement all major data structures from scratch in Java — lists, trees, graphs, heaps"),
                ("default_1",   "Complete LeetCode Blind 75 list — solve all 75 problems in 6 weeks"),
                ("default_2",   "Study time/space complexity — analyze Big-O for every solution you write"),
            ],
        },
        {
            "title": "System Design & Architecture",
            "focus": "Design scalable distributed systems",
            "resource_tasks": [
                ("sql",         "Complete 'Database Design' on Udemy — normalization, indexes, query optimization"),
                ("default_1",   "Study 'System Design Interview' by Alex Xu — read chapters 1-10"),
                ("default_2",   "Practice designing: URL shortener, Twitter, Netflix, WhatsApp from scratch"),
                ("default_3",   "Study distributed systems: CAP theorem, consistency, sharding, replication"),
            ],
        },
        {
            "title": "Software Development Practices",
            "focus": "Learn professional coding practices and tools",
            "resource_tasks": [
                ("git",         "Complete 'Pro Git' free book at git-scm.com/book — branching, rebasing, workflows"),
                ("docker",      "Dockerize a project with multi-stage builds + docker-compose for local dev"),
                ("default_1",   "Study software design patterns: Singleton, Factory, Observer, Strategy (refactoring.guru free)"),
                ("default_2",   "Complete 'Clean Code' by Robert C. Martin — apply principles to an existing project"),
            ],
        },
        {
            "title": "Domain Specialization & Job Prep",
            "focus": "Pick a specialization and apply confidently",
            "resource_tasks": [
                ("javascript",  "Build a full-stack project with React + Node.js and deploy on Vercel + Railway"),
                ("default_1",   "Complete mock interviews on Pramp.com (free) — do 10 mock interviews"),
                ("default_2",   "Solve 2 LeetCode problems every day for 60 days — track progress on GitHub"),
                ("default_3",   "Contribute to an open-source project on GitHub — merged PR in 4 weeks"),
            ],
        },
    ],
}


# ─── Dynamic Roadmap Builder ──────────────────────────────────────────────────
def build_dynamic_roadmap(
    name:              str,
    target_role:       str,
    missing_required:  list,
    missing_preferred: list,
    readiness_pct:     int,
    total_weeks:       int = 12,
) -> dict:
    """
    Build a personalized roadmap by:
    1. Getting the phase templates for the target role
    2. Filtering tasks to prioritize the person's MISSING skills
    3. Adding default advancement tasks if no gaps in a phase
    """
    templates = ROLE_TEMPLATES.get(target_role, ROLE_TEMPLATES["Software Engineer"])

    all_missing = set(s.lower() for s in missing_required + missing_preferred)
    phases      = []
    durations   = [3, 3, 3, 3]  # default week split

    for i, template in enumerate(templates[:4]):
        # Pick tasks relevant to this person's missing skills
        relevant_tasks   = []
        irrelevant_tasks = []

        for skill_key, task_text in template["resource_tasks"]:
            if skill_key.startswith("default"):
                irrelevant_tasks.append(task_text)
            elif skill_key.lower() in all_missing:
                relevant_tasks.append(task_text)
            else:
                irrelevant_tasks.append(task_text)

        # Build final task list: relevant first, then fill with defaults
        final_tasks = relevant_tasks[:3]
        if len(final_tasks) < 3:
            needed = 3 - len(final_tasks)
            final_tasks += irrelevant_tasks[:needed]

        # Always keep at least 3 tasks
        if not final_tasks:
            final_tasks = [t for _, t in template["resource_tasks"][:3]]

        phases.append({
            "phase_number": i + 1,
            "title":        template["title"],
            "duration":     f"{durations[i]} weeks",
            "focus":        template["focus"],
            "tasks":        final_tasks[:4],
        })

    # Build overview text
    missing_text = ", ".join(missing_required[:3]) if missing_required else "advanced topics"
    overview = (
        f"{name} is {readiness_pct}% ready for a {target_role} role. "
        f"Key focus areas: {missing_text}. "
        f"This {total_weeks}-week structured plan will bridge your skill gaps "
        f"systematically from fundamentals to job-ready portfolio projects."
    )

    return {
        "candidate_name": name,
        "target_role":    target_role,
        "total_duration": f"{total_weeks} weeks",
        "overview":       overview,
        "phases":         phases,
        "generated_by":   "rule-based-dynamic",
        "status":         "success",
    }


# ─── Gemini Generator ─────────────────────────────────────────────────────────
def build_prompt(name, target_role, current_skills,
                 missing_required, missing_preferred,
                 experience, readiness_pct) -> str:
    exp_text = "\n".join([
        f"- {e.get('role','N/A')} at {e.get('company','N/A')} ({e.get('duration','N/A')})"
        for e in experience if any(e.values())
    ]) if experience else "No professional experience (fresher)"

    return f"""
You are an expert career mentor. Generate a personalized learning roadmap.

CANDIDATE:
- Name: {name}
- Target Role: {target_role}
- Readiness: {readiness_pct}%
- Current Skills: {', '.join(current_skills[:15])}
- Experience: {exp_text}

SKILL GAPS (FOCUS ONLY ON THESE):
- Missing Required: {', '.join(missing_required) if missing_required else 'None'}
- Missing Preferred: {', '.join(missing_preferred) if missing_preferred else 'None'}

Generate exactly 4 learning phases. Include specific free resources.
Return ONLY valid JSON, no markdown:

{{
  "candidate_name": "{name}",
  "target_role": "{target_role}",
  "total_duration": "12 weeks",
  "overview": "2-3 sentence personalized summary",
  "phases": [
    {{
      "phase_number": 1,
      "title": "Phase title",
      "duration": "X weeks",
      "focus": "Main focus",
      "tasks": ["Specific task with resource", "Specific task", "Specific task"]
    }}
  ]
}}
""".strip()


def generate_roadmap(
    name, target_role, current_skills,
    missing_required, missing_preferred,
    experience, readiness_pct,
) -> dict:
    """Try Gemini first, fall back to dynamic rule-based if quota exceeded."""

    if GEMINI_API_KEY != "PASTE_YOUR_NEW_KEY_HERE":
        try:
            model  = genai.GenerativeModel("gemini-2.0-flash")
            prompt = build_prompt(name, target_role, current_skills,
                                  missing_required, missing_preferred,
                                  experience, readiness_pct)
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7, max_output_tokens=2048,
                )
            )
            raw = response.text.strip()
            raw = re.sub(r"^```json\s*", "", raw)
            raw = re.sub(r"\s*```$",     "", raw).strip()
            roadmap = json.loads(raw)
            roadmap["generated_by"] = "gemini-2.0-flash"
            roadmap["status"]       = "success"
            return roadmap
        except Exception as e:
            print(f"⚠️  Gemini failed: {str(e)[:80]} — using dynamic fallback")

    # Dynamic rule-based fallback (works for all 12 roles)
    return build_dynamic_roadmap(
        name, target_role, missing_required,
        missing_preferred, readiness_pct,
    )


def generate_roadmap_from_parsed(parsed_resume: dict) -> dict:
    """Convenience wrapper called by main.py."""
    name       = parsed_resume.get("name", "Candidate")
    skills     = parsed_resume.get("skills", {}).get("all", [])
    experience = parsed_resume.get("experience", [])
    skill_gap  = parsed_resume.get("skill_gap", {})
    matches    = parsed_resume.get("career_matches", [])

    target_role       = skill_gap.get("role", matches[0]["title"] if matches else "Software Engineer")
    missing_required  = skill_gap.get("missing_required",  [])
    missing_preferred = skill_gap.get("missing_preferred", [])
    readiness_pct     = skill_gap.get("readiness_pct", 50)

    return generate_roadmap(
        name, target_role, skills,
        missing_required, missing_preferred,
        experience, readiness_pct,
    )


# ─── Standalone Test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Test all 12 roles
    test_cases = [
        ("Abhay Srivastava",  "NLP Engineer",         ["transformers"],          ["hugging face", "spacy", "pytorch"], 80),
        ("Ravi Kumar",        "DevOps Engineer",       ["docker", "kubernetes"],  ["terraform", "ansible"],             45),
        ("Priya Sharma",      "Data Scientist",        ["pandas", "sql"],         ["tableau", "r"],                     55),
        ("Arjun Mehta",       "Full Stack Developer",  ["sql", "typescript"],     ["docker", "aws"],                    72),
        ("Sneha Patel",       "Android Developer",     ["kotlin"],                ["firebase", "jetpack compose"],      60),
    ]

    for name, role, missing_req, missing_pref, readiness in test_cases:
        print(f"\n{'='*55}")
        print(f"🎯 {name} → {role} ({readiness}% ready)")
        print(f"{'='*55}")
        roadmap = generate_roadmap(
            name, role, [], missing_req, missing_pref, [], readiness
        )
        print(f"By      : {roadmap['generated_by']}")
        print(f"Duration: {roadmap['total_duration']}")
        for phase in roadmap["phases"]:
            print(f"\n  Phase {phase['phase_number']}: {phase['title']}")
            for task in phase["tasks"][:2]:
                print(f"    ✓ {task[:70]}...")