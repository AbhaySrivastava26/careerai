import { useState } from "react";
import { ExternalLink } from "lucide-react";
import "./Careers.css";

// Complete company database with proper logos and data
const COMPANIES = {
  service: [
    { name: "TCS", logo: "https://th.bing.com/th/id/OIP.Av0oY41bv9xfg_PZ-VzLiAHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", salary: "3.5-7 LPA", hiring: "40,000-60,000/year" },
    { name: "Infosys", logo: "https://static.vecteezy.com/system/resources/previews/020/336/451/non_2x/infosys-logo-infosys-icon-free-free-vector.jpg", salary: "3.6-8 LPA", hiring: "35,000-45,000/year" },
    { name: "Wipro", logo: "https://th.bing.com/th/id/OIP.-WbEq8HRFFN_CYNCLSD97QHaEK?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", salary: "3.5-7 LPA", hiring: "30,000-40,000/year" },
    { name: "Cognizant", logo: "https://tse4.mm.bing.net/th/id/OIP.UK07pQk_uoAKtjX4ZBhuigAAAA?rs=1&pid=ImgDetMain&o=7&rm=3", salary: "4-8 LPA", hiring: "25,000-35,000/year" },
    { name: "Accenture", logo: "https://logosmarcas.net/wp-content/uploads/2020/06/Accenture-Logo.png", salary: "4.5-9 LPA", hiring: "20,000-30,000/year" },
    { name: "Capgemini", logo: "https://th.bing.com/th/id/OIP.N1uZBBKHG0c8Gk1lgN60ZAHaEK?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", salary: "3.8-7 LPA", hiring: "15,000-20,000/year" },
    { name: "LTIMindtree", logo: "https://th.bing.com/th/id/OIP.yRaU85_hyh-qN5XZ5-6RVQHaD4?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", salary: "3.5-7 LPA", hiring: "10,000-15,000/year" },
    { name: "HCLTech", logo: "https://www.financialexpress.com/wp-content/uploads/2022/09/hcl1.jpg", salary: "3.5-7 LPA", hiring: "15,000-20,000/year" },
    { name: "Tech Mahindra", logo: "https://tse4.mm.bing.net/th/id/OIP.CLXBk2wlbiY6AdBlh9COKgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", salary: "3.5-7 LPA", hiring: "10,000-15,000/year" },
    { name: "IBM India", logo: "https://tse4.mm.bing.net/th/id/OIP.CLXBk2wlbiY6AdBlh9COKgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", salary: "4-8 LPA", hiring: "5,000-10,000/year" },
    { name: "Deloitte USI", logo: "https://tse2.mm.bing.net/th/id/OIP.BIem4AHpYRFI5DLrNixDygHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", salary: "6-9 LPA", hiring: "8,000-12,000/year" },
    { name: "DXC Technology", logo: "https://th.bing.com/th/id/OIP.N0mBYr2Ytpd8kxoewkb5qQHaE7?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", salary: "3.8-7 LPA", hiring: "8,000-12,000/year" },
  ],
  startup: [
    { name: "Zoho", logo: "zoho.jpg", salary: "6-12 LPA", hiring: "2,000-3,000/year" },
    { name: "Freshworks", logo: "freshworks.jpg", salary: "8-15 LPA", hiring: "1,500-2,500/year" },
    { name: "Razorpay", logo: "razorpay.jpg", salary: "12-20 LPA", hiring: "800-1,500/year" },
    { name: "Swiggy", logo: "swiggy.jpg", salary: "10-18 LPA", hiring: "1,000-2,000/year" },
    { name: "Meesho", logo: "meesho.jpg", salary: "10-18 LPA", hiring: "500-1,000/year" },
    { name: "PhonePe", logo: "phonepe.jpg", salary: "12-20 LPA", hiring: "800-1,500/year" },
    { name: "Groww", logo: "grow.jpg", salary: "12-22 LPA", hiring: "300-600/year" },
    { name: "Cred", logo: "cred.jpg", salary: "15-25 LPA", hiring: "200-400/year" },
    { name: "Postman", logo: "postman.jpg", salary: "12-20 LPA", hiring: "300-500/year" },
    { name: "BrowserStack", logo: "browserstack.jpg", salary: "12-20 LPA", hiring: "200-400/year" },
    { name: "ShareChat", logo: "sharechat.jpg", salary: "10-18 LPA", hiring: "400-800/year" },
    { name: "Urban Company", logo: "urbancompany.jpg", salary: "10-16 LPA", hiring: "500-1,000/year" },
  ],
  product: [
    { name: "Google", logo: "https://logolook.net/wp-content/uploads/2021/06/Google-Logo.png", salary: "20-50 LPA", hiring: "1,000-1,500/year" },
    { name: "Microsoft", logo: "https://logolook.net/wp-content/uploads/2021/06/Microsoft-Logo.png", salary: "18-45 LPA", hiring: "1,500-2,000/year" },
    { name: "Amazon", logo: "https://logolook.net/wp-content/uploads/2021/06/Amazon-Logo.png", salary: "15-40 LPA", hiring: "3,000-5,000/year" },
    { name: "Adobe", logo: "adobe.jpg", salary: "18-45 LPA", hiring: "800-1,200/year" },
    { name: "Atlassian", logo: "atlssian.jpg", salary: "20-45 LPA", hiring: "400-600/year" },
    { name: "Flipkart", logo: "flipkart.jpg", salary: "15-35 LPA", hiring: "1,000-1,500/year" },
    { name: "Walmart Global Tech", logo: "walmart.jpg", salary: "15-40 LPA", hiring: "800-1,200/year" },
    { name: "Uber", logo: "uber.jpg", salary: "18-45 LPA", hiring: "300-500/year" },
    { name: "Nvidia", logo: "nvdia.jpg", salary: "25-60 LPA", hiring: "200-400/year" },
    { name: "Salesforce", logo: "salesforce.jpg", salary: "18-45 LPA", hiring: "500-800/year" },
    { name: "ServiceNow", logo: "servicenow.jpg", salary: "18-40 LPA", hiring: "400-600/year" },
    { name: "Intuit", logo: "intuit.jpg", salary: "20-45 LPA", hiring: "300-500/year" },
    { name: "LinkedIn", logo: "linkedin.jpg", salary: "25-50 LPA", hiring: "200-300/year" },
  ],
};

// Company Details Database - UNIQUE FOR EACH COMPANY
const COMPANY_DETAILS = {
  TCS: {
    overview: "TCS (Tata Consultancy Services) is India's largest IT services company and a global leader in consulting and technology solutions.",
    programs: [
      { name: "TCS Ninja", salary: "3.36 LPA", desc: "Core hiring program for freshers" },
      { name: "TCS Digital", salary: "7 LPA", desc: "For top performers with digital skills" },
      { name: "TCS Prime", salary: "9+ LPA", desc: "Premium hiring for premier institutes" },
    ],
    process: [
      "Online Assessment (1900 min) - MCQs + Coding",
      "Technical Interview (30-45 min)",
      "Managerial Round (20-30 min)",
      "HR Interview (15-20 min)",
    ],
    aptitude: {
      topics: ["Percentages", "Profit & Loss", "Time & Work", "Time & Distance"],
      resources: [
        { name: "PrepInsta TCS Practice", url: "https://prepinsta.com/tcs/" },
        { name: "IndiaBix", url: "https://www.indiabix.com/" },
      ],
    },
    reasoning: {
      topics: ["Coding-Decoding", "Blood Relations", "Series", "Puzzles"],
      resources: [
        { name: "Reasoning Practice", url: "https://www.youtube.com/watch?v=sWJfscVkhLI" },
      ],
    },
    coding: {
      difficulty: "Easy to Medium",
      topics: ["Arrays", "Strings", "Recursion", "Sorting"],
      resources: [
        { name: "LeetCode  75", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Focus on speed and accuracy",
      "Practice 100+ problems",
      "Clear project explanation",
    ],
  },

  Infosys: {
    overview: "Infosys is a global leader in consulting, technology, and outsourcing solutions.",
    programs: [
      { name: "Infosys SE", salary: "3.6 LPA", desc: "Software engineer role" },
      { name: "Infosys Power Programmer", salary: "9 LPA", desc: "For strong coding" },
      { name: "Infosys InStep", salary: "6 LPA", desc: "Internship to full-time" },
    ],
    process: [
      "Online Test (Aptitude + Reasoning + English + Coding)",
      "Technical Interview (45-60 min)",
      "HR Interview (15-30 min)",
    ],
    aptitude: {
      topics: ["Number Systems", "Percentages", "Time & Work", "Probability"],
      resources: [
        { name: "Infosys Prep", url: "https://prepinsta.com/infosys/" },
      ],
    },
    reasoning: {
      topics: ["Syllogisms", "Seating", "Series", "Puzzles"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/watch?v=GKxU8Lny0To&list=PLMufDeLh5x2AubOSrsnsx1EqAcc70MJkG" },
      ],
    },
    coding: {
      difficulty: "Easy to Medium",
      topics: ["Arrays", "Strings", "Hashing", "Sliding Window"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Communication skills matter",
      "OOPS concepts important",
      "Prepare 2-3 projects",
    ],
  },

  Wipro: {
    overview: "Wipro is a leading global IT services company providing consulting and outsourcing services.",
    programs: [
      { name: "Wipro Wilp", salary: "3.5-7 LPA", desc: "Standard hiring program" },
      { name: "Wipro Elite", salary: "7-10 LPA", desc: "For top performers" },
    ],
    process: [
      "Online Assessment (Coding + Aptitude)",
      "Technical Interview (30-45 min)",
      "HR Interview (15-20 min)",
    ],
    aptitude: {
      topics: ["Percentages", "Time & Work", "Series"],
      resources: [
        { name: "Wipro Prep", url: "https://prepinsta.com/wipro/" },
      ],
    },
    reasoning: {
      topics: ["Puzzles", "Series", "Coding-Decoding"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/watch?v=GKxU8Lny0To&list=PLMufDeLh5x2AubOSrsnsx1EqAcc70MJkG" },
      ],
    },
    coding: {
      difficulty: "Easy to Medium",
      topics: ["Arrays", "Strings", "Basic Algorithms"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Focus on fundamentals",
      "Practice aptitude",
      "Clear about projects",
    ],
  },

  Cognizant: {
    overview: "Cognizant is a multinational IT services and consulting company.",
    programs: [
      { name: "Cognizant GenC", salary: "4-8 LPA", desc: "Graduate hiring" },
      { name: "Cognizant GenC Next", salary: "8-11 LPA", desc: "Premium" },
    ],
    process: [
      "Online Assessment",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Percentages", "Time & Work"],
      resources: [
        { name: "Cognizant Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Puzzles", "Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy to Medium",
      topics: ["Arrays", "Strings"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Strong fundamentals",
      "Code regularly",
      "Good communication",
    ],
  },

  Accenture: {
    overview: "Accenture is a global professional services company.",
    programs: [
      { name: "Accenture Associate", salary: "4.5-9 LPA", desc: "Entry level" },
      { name: "Accenture Trainee", salary: "4-7 LPA", desc: "Trainee" },
    ],
    process: [
      "Online Assessment",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Percentages", "Profit & Loss"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic", "Puzzles"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["Basic DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "English important",
      "Soft skills matter",
    ],
  },

  Capgemini: {
    overview: "Capgemini is a global leader in consulting and digital transformation.",
    programs: [
      { name: "Capgemini Engineer", salary: "3.8-7 LPA", desc: "Engineer" },
      { name: "Capgemini CTEP", salary: "4.5-8 LPA", desc: "Campus program" },
    ],
    process: [
      "Online Test",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Time management",
      "Mock tests",
    ],
  },

  LTIMindtree: {
    overview: "LTIMindtree is an IT services and consulting company.",
    programs: [
      { name: "LTI Associate", salary: "3.5-7 LPA", desc: "Associate engineer" },
    ],
    process: [
      "Online Assessment",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Basics important",
    ],
  },

  HCLTech: {
    overview: "HCL Technologies is a global IT services company.",
    programs: [
      { name: "HCL Engineer", salary: "3.5-7 LPA", desc: "Engineer" },
    ],
    process: [
      "Assessment",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Practice regularly",
    ],
  },

  "Tech Mahindra": {
    overview: "Tech Mahindra is an IT services company.",
    programs: [
      { name: "TM Engineer", salary: "3.5-7 LPA", desc: "Engineer" },
    ],
    process: [
      "Assessment",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Do your best",
    ],
  },

  "IBM India": {
    overview: "IBM is a global technology company.",
    programs: [
      { name: "IBM Engineer", salary: "4-8 LPA", desc: "Engineer" },
    ],
    process: [
      "Assessment",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Practice well",
    ],
  },

  "Deloitte USI": {
    overview: "Deloitte is a professional services company.",
    programs: [
      { name: "Deloitte Engineer", salary: "6-9 LPA", desc: "Engineer" },
    ],
    process: [
      "Assessment",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Be ready",
    ],
  },

  "DXC Technology": {
    overview: "DXC is a technology company.",
    programs: [
      { name: "DXC Engineer", salary: "3.8-7 LPA", desc: "Engineer" },
    ],
    process: [
      "Assessment",
      "Technical",
      "HR",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://prepinsta.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Easy",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Do well",
    ],
  },

  // STARTUP COMPANIES
  Zoho: {
    overview: "Zoho is a leading SaaS company building affordable business applications.",
    programs: [
      { name: "Zoho Recruit", salary: "6-12 LPA", desc: "Graduate hiring" },
      { name: "Zoho Campus", salary: "5-10 LPA", desc: "Internship" },
    ],
    process: [
      "Online Coding Assessment",
      "Technical Interview (60 min)",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basic Aptitude"],
      resources: [
        { name: "Zoho Prep", url: "https://prepinsta.com/zoho/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["Algorithms", "Data Structures"],
      resources: [
        { name: "LeetCode Medium", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Values problem-solving",
      "Discuss projects",
      "Good learning opportunity",
    ],
  },

  Freshworks: {
    overview: "Freshworks is a customer engagement software company.",
    programs: [
      { name: "Freshworks Engineer", salary: "8-15 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Logic"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["DSA", "Algorithms"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Practice coding daily",
    ],
  },

  Razorpay: {
    overview: "Razorpay is a fintech company providing payment solutions.",
    programs: [
      { name: "Razorpay Engineer", salary: "12-20 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Assessment",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "System Design"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Very competitive",
      "Strong DSA needed",
    ],
  },

  Swiggy: {
    overview: "Swiggy is a food delivery platform.",
    programs: [
      { name: "Swiggy Engineer", salary: "10-18 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Design Thinking"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["DSA", "Backend"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "System design important",
      "Backend knowledge needed",
    ],
  },

  Meesho: {
    overview: "Meesho is a social commerce platform.",
    programs: [
      { name: "Meesho Engineer", salary: "10-18 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["DSA", "Databases"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Fast paced environment",
      "Quick learning",
    ],
  },

  PhonePe: {
    overview: "PhonePe is a digital payments company.",
    programs: [
      { name: "PhonePe Engineer", salary: "12-20 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Rounds",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "System Design"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Very competitive",
      "Multiple rounds",
    ],
  },

  Groww: {
    overview: "Groww is an investing platform.",
    programs: [
      { name: "SDE-1", salary: "15-28 LPA", desc: "Software Development Engineer" },
      { name: "SDE-2", salary: "30-45 LPA", desc: "Mid-level engineer" },
    ],
    process: [
      "Coding Assessment",
      "Technical Interviews (Multiple)",
      "System Design Round",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not Required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    reasoning: {
      topics: ["System Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "Optimization"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Very competitive hiring",
      "Master data structures",
      "System design is key",
      "Good salary and growth",
    ],
  },

  Cred: {
    overview: "Cred is a fintech platform for credit card payments.",
    programs: [
      { name: "CRED Engineer", salary: "15-25 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not Required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "Design", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Competitive process",
      "Strong fundamentals needed",
    ],
  },

  Postman: {
    overview: "Postman is an API development platform.",
    programs: [
      { name: "Postman Engineer", salary: "12-20 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not Required"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["DSA", "APIs", "Backend"],
      resources: [
        { name: "LeetCode Medium", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "API knowledge helpful",
      "Good coding skills",
    ],
  },

  BrowserStack: {
    overview: "BrowserStack is a testing platform.",
    programs: [
      { name: "BrowserStack Engineer", salary: "12-20 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["DSA", "Testing"],
      resources: [
        { name: "LeetCode Medium", url: "https://leetcode.com/studyplan/leetcode-75/" },
      ],
    },
    tips: [
      "Testing knowledge helpful",
    ],
  },

  ShareChat: {
    overview: "ShareChat is a social platform.",
    programs: [
      { name: "ShareChat Engineer", salary: "10-18 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode Medium", url: "https://leetcode.com/" },
      ],
    },
    tips: [
      "Good learning opportunity",
    ],
  },

  "Urban Company": {
    overview: "Urban Company is a service platform.",
    programs: [
      { name: "UC Engineer", salary: "10-16 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interview",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Basics"],
      resources: [
        { name: "Prep", url: "https://www.youtube.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode Medium", url: "https://leetcode.com/" },
      ],
    },
    tips: [
      "Good work culture",
    ],
  },

  // PRODUCT COMPANIES
  Google: {
    overview: "Google is the world's leading search engine and tech giant, known for innovation.",
    programs: [
      { name: "SDE-L3", salary: "20-30 LPA", desc: "Entry-level SWE" },
      { name: "SDE-L4", salary: "35-50 LPA", desc: "Experienced" },
    ],
    process: [
      "Online Coding Assessment",
      "Phone Screen (45 min)",
      "Onsite/Virtual (4-5 rounds)",
      "Hiring Committee Review",
    ],
    aptitude: {
      topics: ["Not required - Focus on DSA"],
      resources: [
        { name: "Google Interview Prep", url: "https://www.youtube.com/watch?v=U_UBg8jenpE&list=PL1w8k37X_6L-bCZ3m0FFBZmRv4onE7Zjl" },
      ],
    },
    reasoning: {
      topics: ["System Design Thinking"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=SqcXvc3ZmRU&list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["Arrays", "Trees", "Graphs", "DP", "System Design"],
      resources: [
        { name: "Blind 75 LeetCode", url: "https://leetcode.com/problem-list/oq45f3x3/" },
        { name: "LeetCode Hard", url: "https://leetcode.com/studyplan/top-interview-150/" },
      ],
    },
    systemDesign: {
      topics: ["Scalability", "Load Balancing", "Caching", "Database Design"],
      resources: [
        { name: "System Design Interview", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
       
      ],
    },
    tips: [
      "Solve 600+ LeetCode problems",
      "Focus on thought process",
      "Practice system design daily",
      "Code on Google Docs",
      "Research Google products",
    ],
  },

  Microsoft: {
    overview: "Microsoft is a global technology leader in cloud and AI.",
    programs: [
      { name: "SDE-1", salary: "18-30 LPA", desc: "Entry level SDE" },
      { name: "SDE-2", salary: "40-60 LPA", desc: "Mid-level SDE" },
    ],
    process: [
      "Online Coding Assessment",
      "Phone/Video Round (45-60 min)",
      "Onsite (3-4 rounds)",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Microsoft Prep", url: "https://leetcode.com/company/microsoft/" },
      ],
    },
    reasoning: {
      topics: ["Design Thinking"],
      resources: [
        { name: "Design Patterns", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["Arrays", "Trees", "Graphs", "DP"],
      resources: [
        { name: "LeetCode Medium/Hard", url: "https://leetcode.com/company/microsoft/" },
      ],
    },
    systemDesign: {
      topics: ["Cloud Design", "Azure Services", "Scalability"],
      resources: [
        { name: "Azure Documentation", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    tips: [
      "Practice 650+ LeetCode",
      "System design concepts",
      "Azure services familiar",
      "Clear communication",
    ],
  },

  Amazon: {
    overview: "Amazon is the world's largest e-commerce and cloud company.",
    programs: [
      { name: "SDE-1", salary: "15-28 LPA", desc: "Software Development Engineer" },
      { name: "SDE-2", salary: "30-45 LPA", desc: "Mid-level engineer" },
    ],
    process: [
      "Online Assessment (90 min)",
      "Phone Screen (45-60 min)",
      "Onsite (4-5 rounds)",
    ],
    aptitude: {
      topics: ["Logical Puzzles"],
      resources: [
        { name: "Amazon OA Practice", url: "https://leetcode.com/company/amazon/" },
      ],
    },
    reasoning: {
      topics: ["Leadership Principles"],
      resources: [
        { name: "Leadership Principles", url: "https://www.amazon.jobs/" },
      ],
    },
    coding: {
      difficulty: "Medium (mostly)",
      topics: ["Arrays", "Trees", "Graphs", "DP"],
      resources: [
        { name: "Amazon Problems", url: "https://leetcode.com/company/amazon/" },
      ],
    },
    systemDesign: {
      topics: ["AWS Services", "Load Balancers", "Database Sharding"],
      resources: [
        { name: "AWS Architecture", url: "https://aws.amazon.com/architecture/" },
      ],
    },
    tips: [
      "Master Leadership Principles",
      "STAR method for behavioral",
      "Solve 200+ LeetCode",
      "Learn AWS services",
    ],
  },

  Adobe: {
    overview: "Adobe is a global leader in digital media and marketing.",
    programs: [
      { name: "SDE-1", salary: "18-45 LPA", desc: "Software engineer" },
      { name: "SDE-2", salary: "30+ LPA", desc: "Senior engineer" },
    ],
    process: [
      "Online Coding Assessment",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["DSA", "Algorithms", "Optimization"],
      resources: [
        { name: "LeetCode Medium/Hard", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Scalability", "Caching", "Database Design"],
      resources: [
        { name: "System Design Primer", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    tips: [
      "Adobe values creativity",
      "Strong DSA needed",
      "System design important",
    ],
  },

  Atlassian: {
    overview: "Atlassian is a software company providing dev tools.",
    programs: [
      { name: "SDE", salary: "20-45 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on coding", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Problem Solving"],
      resources: [
        { name: "Practice", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "System Design"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Scalability", "Architecture"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    tips: [
      "Competitive process",
      "Strong fundamentals",
    ],
  },

  Flipkart: {
    overview: "Flipkart is India's leading e-commerce company.",
    programs: [
      { name: "SDE-1", salary: "15-35 LPA", desc: "Software engineer" },
      { name: "SDE-2", salary: "25-40 LPA", desc: "Senior engineer" },
    ],
    process: [
      "Online Coding",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["DSA", "Algorithms"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Scalability", "Load Balancing"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    tips: [
      "Fast paced",
      "Good salary",
    ],
  },

  "Walmart Global Tech": {
    overview: "Walmart Global Tech is the tech arm of Walmart.",
    programs: [
      { name: "SDE-1", salary: "15-40 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Scalability"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    tips: [
      "Competitive",
    ],
  },

  Uber: {
    overview: "Uber is a global mobility and delivery platform.",
    programs: [
      { name: "SDE-1", salary: "18-45 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "Distributed Systems"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Scalability", "Distributed Systems"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    tips: [
      "Very competitive",
      "System design crucial",
    ],
  },

  Nvidia: {
    overview: "Nvidia is a tech company specializing in GPUs and AI.",
    programs: [
      { name: "SDE-1", salary: "25-60 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "GPU Programming"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["GPU Architecture", "Scalability"],
      resources: [
        { name: "CUDA Programming", url: "https://www.youtube.com/" },
      ],
    },
    tips: [
      "GPU knowledge helpful",
      "Very high salary",
    ],
  },

  Salesforce: {
    overview: "Salesforce is a cloud-based CRM company.",
    programs: [
      { name: "SDE-1", salary: "18-45 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/watch?v=AK0hu0Zxua4&list=PLQEaRBV9gAFvzp6XhcNFpk1WdOcyVo9qT" },
      ],
    },
    coding: {
      difficulty: "Medium to Hard",
      topics: ["DSA", "Cloud Computing"],
      resources: [
        { name: "LeetCode", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Cloud Architecture", "Scalability"],
      resources: [
        { name: "Cloud Design", url: "https://www.youtube.com/" },
      ],
    },
    tips: [
      "Cloud knowledge helpful",
    ],
  },

  ServiceNow: {
    overview: "ServiceNow is an enterprise cloud company.",
    programs: [
      { name: "SDE-1", salary: "18-40 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Medium",
      topics: ["DSA"],
      resources: [
        { name: "LeetCode Medium", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Enterprise Architecture"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    tips: [
      "Good work culture",
    ],
  },

  Intuit: {
    overview: "Intuit is a financial software company.",
    programs: [
      { name: "SDE-1", salary: "20-45 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Financial Systems", "Scalability"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    tips: [
      "Financial knowledge helpful",
    ],
  },

  LinkedIn: {
    overview: "LinkedIn is a professional networking platform.",
    programs: [
      { name: "SDE-1", salary: "25-50 LPA", desc: "Software engineer" },
    ],
    process: [
      "Coding Round",
      "Technical Interviews",
      "System Design",
      "HR Interview",
    ],
    aptitude: {
      topics: ["Not required"],
      resources: [
        { name: "Focus on DSA", url: "https://leetcode.com/" },
      ],
    },
    reasoning: {
      topics: ["Design"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    coding: {
      difficulty: "Hard",
      topics: ["Advanced DSA", "Distributed Systems"],
      resources: [
        { name: "LeetCode Hard", url: "https://leetcode.com/" },
      ],
    },
    systemDesign: {
      topics: ["Social Networks", "Scalability"],
      resources: [
        { name: "System Design", url: "https://www.youtube.com/" },
      ],
    },
    tips: [
      "Very competitive",
      "High salary",
    ],
  },
};

export default function Careers() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");

  const categories = [
    {
      id: "service",
      title: "Service-Based Companies",
      icon: "",
      salary: "3-9 LPA",
      desc: "Bulk hiring, good for building foundation",
      color: "#3b82f6",
    },
    {
      id: "startup",
      title: "Startup / Mid-Product",
      icon: "",
      salary: "8-18 LPA",
      desc: "Fast-paced, good learning curve",
      color: "#10b981",
    },
    {
      id: "product",
      title: "Product-Based Companies",
      icon: "",
      salary: "15-40+ LPA",
      desc: "Top packages, rigorous interviews",
      color: "#f59e0b",
    },
  ];

  if (!selectedCategory) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.8px",
            marginBottom: 12,
          }}>
            Company Preparation Strategy
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>
            Choose your target company category and get personalized preparation
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
        }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: "var(--bg-secondary)",
                border: "2px solid var(--border-color)",
                borderRadius: 16,
                padding: 32,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = `0 12px 32px ${cat.color}40`;
                e.currentTarget.style.borderColor = cat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16, textAlign: "center" }}>{cat.icon}</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
                textAlign: "center",
              }}>
                {cat.title}
              </h3>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: cat.color,
                marginBottom: 12,
                textAlign: "center",
              }}>
                {cat.salary}
              </div>
              <p style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                margin: 0,
                textAlign: "center",
              }}>
                {cat.desc}
              </p>
              <div style={{
                marginTop: 20,
                padding: "8px 16px",
                background: "var(--bg-tertiary)",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--text-primary)",
                textAlign: "center",
              }}>
                {COMPANIES[cat.id].length} Companies
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedCompany) {
    const categoryData = categories.find(c => c.id === selectedCategory);
    const companies = COMPANIES[selectedCategory];

    return (
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: "8px 16px",
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border-color)",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            cursor: "pointer",
            marginBottom: 32,
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{categoryData.icon}</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}>
            {categoryData.title}
          </h1>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 16,
        }}>
          {companies.map((company) => (
            <div
              key={company.name}
              onClick={() => setSelectedCompany(company.name)}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: 12,
                padding: 16,
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img
                src={company.logo}
                alt={company.name}
                style={{
                  height: 50,
                  width: "auto",
                  maxWidth: "100%",
                  marginBottom: 12,
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}>
                {company.name}
              </div>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: categoryData.color,
                marginBottom: 4,
              }}>
                {company.salary}
              </div>
              <div style={{
                fontSize: 11,
                color: "var(--text-tertiary)",
              }}>
                {company.hiring}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Company details view
  const companyData = COMPANY_DETAILS[selectedCompany];
  const company = COMPANIES[selectedCategory].find(c => c.name === selectedCompany);

  if (!companyData) {
    return (
      <div style={{ textAlign: "center", padding: "50px 20px" }}>
        <h2 style={{ color: "var(--text-primary)" }}>Company data coming soon!</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <button
        onClick={() => setSelectedCompany(null)}
        style={{
          padding: "8px 16px",
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-color)",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          cursor: "pointer",
          marginBottom: 32,
        }}
      >
        ← Back
      </button>

      {/* Company header */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: 16,
        padding: 32,
        marginBottom: 32,
              }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <img
            src={company.logo}
            alt={selectedCompany}
            style={{
              height: 100,
              width: "auto",
              maxWidth: 200,
              objectFit: "contain",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 8,
            }}>
              {selectedCompany}
            </h1>
            <p style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              marginBottom: 16,
            }}>
              {companyData.overview}
            </p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>
                  Salary Range
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  {company.salary}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 4 }}>
                  Annual Hiring
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                  {company.hiring}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hiring programs */}
        <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border-color)" }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 16,
          }}>
            Hiring Programs
          </h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {companyData.programs.map((prog, i) => (
              <div key={i} style={{
                flex: "1 1 calc(33% - 8px)",
                minWidth: 200,
                padding: 16,
                background: "var(--bg-tertiary)",
                borderRadius: 8,
              }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}>
                  {prog.name}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#10b981",
                  marginBottom: 6,
                }}>
                  {prog.salary}
                </div>
                <div style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}>
                  {prog.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 24,
        borderBottom: "2px solid var(--border-color)",
        overflowX: "auto",
      }}>
        {["overview", "aptitude", "reasoning", "coding", 
          ...(companyData.systemDesign ? ["system-design"] : []), 
          "tips"
        ].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            style={{
              padding: "12px 24px",
              background: activeSection === section ? "var(--bg-tertiary)" : "transparent",
              border: "none",
              borderBottom: activeSection === section ? "2px solid var(--accent-blue)" : "none",
              fontSize: 14,
              fontWeight: 600,
              color: activeSection === section ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "pointer",
              textTransform: "capitalize",
              marginBottom: "-2px",
              whiteSpace: "nowrap",
            }}
          >
            {section.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Content sections */}
      {activeSection === "overview" && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 32,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}>
            Hiring Process
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {companyData.process.map((step, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 16,
                background: "var(--bg-tertiary)",
                borderRadius: 8,
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--accent-blue)",
                  color: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "aptitude" && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 32,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}>
            Aptitude Preparation
          </h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Topics
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {companyData.aptitude.topics.map((topic, i) => (
                <div key={i} style={{
                  padding: "8px 16px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}>
                  {topic}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Resources
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {companyData.aptitude.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    background: "var(--bg-tertiary)",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.background = "var(--border-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    {resource.name}
                  </span>
                  <ExternalLink size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "reasoning" && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 32,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}>
            Reasoning Preparation
          </h2>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Topics
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {companyData.reasoning.topics.map((topic, i) => (
                <div key={i} style={{
                  padding: "8px 16px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}>
                  {topic}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Resources
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {companyData.reasoning.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    background: "var(--bg-tertiary)",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.background = "var(--border-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    {resource.name}
                  </span>
                  <ExternalLink size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "coding" && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 32,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}>
            Coding Preparation
          </h2>

          <div style={{
            padding: 16,
            background: "var(--bg-tertiary)",
            borderRadius: 8,
            marginBottom: 24,
          }}>
            <div style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              marginBottom: 4,
            }}>
              Difficulty Level
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--accent-blue)",
            }}>
              {companyData.coding.difficulty}
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Topics
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {companyData.coding.topics.map((topic, i) => (
                <div key={i} style={{
                  padding: "8px 16px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}>
                  {topic}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Practice Resources
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {companyData.coding.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    background: "var(--bg-tertiary)",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.background = "var(--border-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    {resource.name}
                  </span>
                  <ExternalLink size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "system-design" && companyData.systemDesign && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 32,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}>
            System Design Concepts
          </h2>

          <div style={{
            padding: 16,
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: 8,
            marginBottom: 24,
          }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#92400e",
            }}>
              💡 Important for Senior Roles & Product Companies
            </div>
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Key Topics
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {companyData.systemDesign.topics.map((topic, i) => (
                <div key={i} style={{
                  padding: "8px 16px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}>
                  {topic}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 12,
            }}>
              Resources
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {companyData.systemDesign.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    background: "var(--bg-tertiary)",
                    borderRadius: 8,
                    textDecoration: "none",
                    color: "var(--text-primary)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.background = "var(--border-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600 }}>
                    {resource.name}
                  </span>
                  <ExternalLink size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === "tips" && (
        <div style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: 12,
          padding: 32,
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 20,
          }}>
            Interview Tips
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {companyData.tips.map((tip, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 12,
                padding: 16,
                background: "var(--bg-tertiary)",
                borderRadius: 8,
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#10b981",
                  color: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  ✓
                </div>
                <div style={{
                  fontSize: 15,
                  color: "var(--text-primary)",
                  lineHeight: 1.6,
                }}>
                  {tip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
      