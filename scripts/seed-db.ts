require("dotenv").config({ path: '.env.local' });
const { MongoClient, ObjectId } = require("mongodb");
const { ApplicationStatus } = require("../src/types/ApplicationStatus");

if (!process.env.MONGODB_URI) {
    throw new Error("Please provide MONGODB_URI in .env.local file");
}

const MONGODB_URI = process.env.MONGODB_URI;

// Define database names
const DB_USERS = "users";
const DB_APPLICATIONS = "applications";
const DB_JOBS = "jobs";
const DB_COMPANIES = "companies";

type MongoObjectId = typeof ObjectId;

interface User {
    contact: {
        first_name: string;
        last_name: string;
        birth_date: Date;
        gender: undefined;
        email: string;
        phone: string;
        location: undefined;
    };
    about: {
        work_experience: Array<{
            company: string;
            position: string;
            level: undefined;
            location: undefined;
            start_date: Date;
            end_date: Date;
            description: string;
        }>;
        education: Array<{
            school: undefined;
            degree: undefined;
            major: undefined;
            gpa: number;
            start_date: Date;
            end_date: Date;
            description: string;
        }>;
        projects: Array<{
            name: string;
            position: string;
            location: undefined;
            start_date: Date;
            end_date: Date;
            description: string;
            link: string;
        }>;
        socials: Array<{
            type: undefined;
            link: string;
        }>;
        skills: undefined[];
        languages: undefined[];
    };
    jobs: {
        applied: MongoObjectId[];
        screen: MongoObjectId[];
        interview: MongoObjectId[];
        offer: MongoObjectId[];
        accepted: MongoObjectId[];
        rejected: MongoObjectId[];
        withdrawn: MongoObjectId[];
    };
    total_applications: number;
}

interface Job {
    title: string;
    company: MongoObjectId;
    location: undefined;
    salary: number;
    category: undefined;
    remote: boolean;
    start_date: Date;
    end_date: Date;
    required_skills: undefined[];
    description: string;
}

interface Application {
    _id?: typeof ObjectId;
    user_id: typeof ObjectId;
    job_id: typeof ObjectId;
    status_history: {
        applied: Date;
        screen: Date | null;
        interview: Date | null;
        offer: Date | null;
    };
    final_status: {
        status: typeof ApplicationStatus;
        date: Date;
    } | null;
}

async function seed() {
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(MONGODB_URI);
    
    // Get database references
    const usersDb = client.db(DB_USERS);
    const applicationsDb = client.db(DB_APPLICATIONS);
    const jobsDb = client.db(DB_JOBS);
    const companiesDb = client.db(DB_COMPANIES);

    // Clear existing data
    await usersDb.collection("all").deleteMany({});
    await applicationsDb.collection("all").deleteMany({});
    await jobsDb.collection("all").deleteMany({});
    await companiesDb.collection("all").deleteMany({});

    console.log("Creating test user...");
    // Create a test user
    const user: Omit<User, "_id"> = {
        contact: {
            first_name: "John",
            last_name: "Doe",
            birth_date: new Date("1990-01-01"),
            gender: undefined,
            email: "john.doe@example.com",
            phone: "+1234567890",
            location: undefined
        },
        about: {
            work_experience: [
                {
                    company: "Previous Corp",
                    position: "Software Engineer",
                    level: undefined,
                    location: undefined,
                    start_date: new Date("2020-01-01"),
                    end_date: new Date("2023-01-01"),
                    description: "Full-stack development"
                }
            ],
            education: [
                {
                    school: undefined,
                    degree: undefined,
                    major: undefined,
                    gpa: 3.8,
                    start_date: new Date("2016-09-01"),
                    end_date: new Date("2020-05-01"),
                    description: "Computer Science"
                }
            ],
            projects: [
                {
                    name: "Personal Website",
                    position: "Developer",
                    location: undefined,
                    start_date: new Date("2023-01-01"),
                    end_date: new Date("2023-02-01"),
                    description: "Built with Next.js",
                    link: "https://example.com"
                }
            ],
            socials: [
                {
                    type: undefined,
                    link: "https://linkedin.com/in/johndoe"
                }
            ],
            skills: [],
            languages: []
        },
        jobs: {
            applied: [],
            screen: [],
            interview: [],
            offer: [],
            accepted: [],
            rejected: [],
            withdrawn: []
        },
        total_applications: 0
    };

    const userResult = await usersDb.collection("all").insertOne(user);
    const userId = userResult.insertedId;
    console.log("Created user with ID:", userId);

    console.log("Creating test companies...");
    // Create some test companies
    const companies = [
        { name: "Tech Corp", website: "https://techcorp.com" },
        { name: "Startup Inc", website: "https://startup.inc" },
        { name: "Big Enterprise", website: "https://bigenterprise.com" }
    ];

    const companyResults = await companiesDb.collection("all").insertMany(companies);
    const companyIds = Object.values(companyResults.insertedIds);

    console.log("Creating test jobs...");
    // Create some test jobs
    const jobs: Omit<Job, "_id">[] = companyIds.flatMap(companyId => [
        {
            title: "Frontend Developer",
            company: companyId,
            location: undefined,
            salary: 100000,
            category: undefined,
            remote: true,
            start_date: new Date(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            required_skills: [],
            description: "Looking for a frontend developer..."
        },
        {
            title: "Backend Developer",
            company: companyId,
            location: undefined,
            salary: 120000,
            category: undefined,
            remote: false,
            start_date: new Date(),
            end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
            required_skills: [],
            description: "Looking for a backend developer..."
        }
    ]);

    const jobResults = await jobsDb.collection("all").insertMany(jobs);
    const jobIds = Object.values(jobResults.insertedIds);

    console.log("Creating test applications...");
    // Create applications with different dates and statuses
    const applications: Omit<Application, "_id">[] = [];

    // Create applications for the current month
    for (let i = 0; i < 5; i++) {
        const jobId = jobIds[i];
        const now = new Date();
        const appliedDate = new Date(now.getFullYear(), now.getMonth(), Math.floor(Math.random() * 30) + 1);
        
        applications.push({
            user_id: userId,
            job_id: jobId,
            status_history: {
                applied: appliedDate,
                screen: Math.random() > 0.5 ? new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
                interview: Math.random() > 0.7 ? new Date(appliedDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
                offer: Math.random() > 0.8 ? new Date(appliedDate.getTime() + 21 * 24 * 60 * 60 * 1000) : null
            },
            final_status: Math.random() > 0.9 ? {
                status: ApplicationStatus.ACCEPTED,
                date: new Date(appliedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            } : null
        });
    }

    // Create applications for the previous month
    for (let i = 5; i < 10; i++) {
        const jobId = jobIds[i];
        const now = new Date();
        const appliedDate = new Date(now.getFullYear(), now.getMonth() - 1, Math.floor(Math.random() * 30) + 1);
        
        applications.push({
            user_id: userId,
            job_id: jobId,
            status_history: {
                applied: appliedDate,
                screen: Math.random() > 0.5 ? new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
                interview: Math.random() > 0.7 ? new Date(appliedDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
                offer: Math.random() > 0.8 ? new Date(appliedDate.getTime() + 21 * 24 * 60 * 60 * 1000) : null
            },
            final_status: Math.random() > 0.9 ? {
                status: ApplicationStatus.REJECTED,
                date: new Date(appliedDate.getTime() + 30 * 24 * 60 * 60 * 1000)
            } : null
        });
    }

    await applicationsDb.collection("all").insertMany(applications);

    // Update user's job arrays
    const userApplications = await applicationsDb.collection("all").find({ user_id: userId }).toArray();
    const jobsByStatus = userApplications.reduce((acc, app) => {
        const status = app.final_status?.status ?? ApplicationStatus.APPLIED;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(app.job_id);
        return acc;
    }, {} as Record<typeof ApplicationStatus, typeof ObjectId[]>);

    await usersDb.collection("all").updateOne(
        { _id: userId },
        {
            $set: {
                "jobs.applied": jobsByStatus[ApplicationStatus.APPLIED] || [],
                "jobs.screen": jobsByStatus[ApplicationStatus.SCREEN] || [],
                "jobs.interview": jobsByStatus[ApplicationStatus.INTERVIEW] || [],
                "jobs.offer": jobsByStatus[ApplicationStatus.OFFER] || [],
                "jobs.accepted": jobsByStatus[ApplicationStatus.ACCEPTED] || [],
                "jobs.rejected": jobsByStatus[ApplicationStatus.REJECTED] || [],
                "jobs.withdrawn": jobsByStatus[ApplicationStatus.WITHDRAWN] || [],
                total_applications: userApplications.length
            }
        }
    );

    console.log("Database seeded successfully!");
    console.log("Test user ID:", userId.toString());
    await client.close();
}

seed().catch(console.error); 