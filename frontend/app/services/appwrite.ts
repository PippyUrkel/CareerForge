import { Client, Account, Databases, Storage, ID, Query, Permission, Role, type Models } from "appwrite";

// Environment Configuration with Sensible Defaults
export const APPWRITE_ENDPOINT =
  import.meta.env.VITE_APPWRITE_ENDPOINT || "http://localhost/v1";
export const APPWRITE_PROJECT_ID =
  import.meta.env.VITE_APPWRITE_PROJECT_ID || "6abfe1b1000b09b7c5b6";
export const APPWRITE_DATABASE_ID =
  import.meta.env.VITE_APPWRITE_DATABASE_ID || "careerforge_db";
export const APPWRITE_PROFILES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || "profiles";
export const APPWRITE_COURSES_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_COURSES_COLLECTION_ID || "courses";
export const APPWRITE_BUCKET_ID =
  import.meta.env.VITE_APPWRITE_BUCKET_ID || "resumes";

// Initialize Appwrite Client
export const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query, Permission, Role };

// User Profile Model
export interface UserProfile extends Models.Document {
  userId: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
  targetRole?: string;
  targetCareer?: string;
  experienceLevel?: string;
  strongSkills?: string; // JSON string array
  weakSkills?: string;   // JSON string array
  skillProfile?: string; // JSON string
  assessmentStatus?: string;
  primaryGoals?: string;
  resumeFileId?: string;
}

// Appwrite Course Document Model
export interface AppwriteCourseDocument extends Models.Document {
  courseId: string;
  userId: string;
  title: string;
  description?: string;
  difficulty?: string;
  topic: string;
  targetAudience?: string;
  language?: string;
  learningObjectives?: string; // JSON string
  prerequisites?: string;       // JSON string
  modules?: string;             // JSON string of Module[]
  metadata?: string;            // JSON string of PipelineMetadata
  status?: string;
}

// Helper methods for User Profiles
export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  try {
    const response = await databases.listDocuments<UserProfile>(
      APPWRITE_DATABASE_ID,
      APPWRITE_PROFILES_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(1)]
    );
    if (response.documents.length > 0) {
      return response.documents[0];
    }
    return null;
  } catch (error) {
    console.warn("Could not retrieve user profile from Appwrite:", error);
    return null;
  }
}

export async function createProfile(data: {
  userId: string;
  name: string;
  email: string;
  onboardingCompleted?: boolean;
  targetRole?: string;
  targetCareer?: string;
  experienceLevel?: string;
  strongSkills?: string[];
  weakSkills?: string[];
  skillProfile?: Record<string, any>;
  assessmentStatus?: string;
  primaryGoals?: string;
  resumeFileId?: string;
}): Promise<UserProfile> {
  const permissions = [
    Permission.read(Role.user(data.userId)),
    Permission.update(Role.user(data.userId)),
    Permission.delete(Role.user(data.userId)),
  ];

  const payload: Record<string, any> = {
    userId: data.userId,
    name: data.name,
    email: data.email,
    onboardingCompleted: data.onboardingCompleted ?? false,
    targetRole: data.targetRole || "",
    targetCareer: data.targetCareer || "",
    experienceLevel: data.experienceLevel || "beginner",
    strongSkills: JSON.stringify(data.strongSkills || []),
    weakSkills: JSON.stringify(data.weakSkills || []),
    skillProfile: JSON.stringify(data.skillProfile || {}),
    assessmentStatus: data.assessmentStatus || "pending",
    primaryGoals: data.primaryGoals || "",
    resumeFileId: data.resumeFileId || "",
  };

  return await databases.createDocument<UserProfile>(
    APPWRITE_DATABASE_ID,
    APPWRITE_PROFILES_COLLECTION_ID,
    ID.unique(),
    payload,
    permissions
  );
}

export async function updateProfile(
  documentId: string,
  userId: string,
  data: Partial<{
    name: string;
    onboardingCompleted: boolean;
    targetRole: string;
    targetCareer: string;
    experienceLevel: string;
    strongSkills: string[];
    weakSkills: string[];
    skillProfile: Record<string, any>;
    assessmentStatus: string;
    primaryGoals: string;
    resumeFileId: string;
  }>
): Promise<UserProfile> {
  const payload: Record<string, any> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.onboardingCompleted !== undefined) payload.onboardingCompleted = data.onboardingCompleted;
  if (data.targetRole !== undefined) payload.targetRole = data.targetRole;
  if (data.targetCareer !== undefined) payload.targetCareer = data.targetCareer;
  if (data.experienceLevel !== undefined) payload.experienceLevel = data.experienceLevel;
  if (data.strongSkills !== undefined) payload.strongSkills = JSON.stringify(data.strongSkills);
  if (data.weakSkills !== undefined) payload.weakSkills = JSON.stringify(data.weakSkills);
  if (data.skillProfile !== undefined) payload.skillProfile = JSON.stringify(data.skillProfile);
  if (data.assessmentStatus !== undefined) payload.assessmentStatus = data.assessmentStatus;
  if (data.primaryGoals !== undefined) payload.primaryGoals = data.primaryGoals;
  if (data.resumeFileId !== undefined) payload.resumeFileId = data.resumeFileId;

  return await databases.updateDocument<UserProfile>(
    APPWRITE_DATABASE_ID,
    APPWRITE_PROFILES_COLLECTION_ID,
    documentId,
    payload
  );
}

// Helper methods for User Courses in Appwrite
export async function listUserCourses(userId: string): Promise<AppwriteCourseDocument[]> {
  try {
    const response = await databases.listDocuments<AppwriteCourseDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_COURSES_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ]
    );
    return response.documents;
  } catch (error) {
    console.warn("Could not list user courses from Appwrite:", error);
    return [];
  }
}

export async function saveUserCourse(
  userId: string,
  courseData: {
    courseId: string;
    title: string;
    description?: string;
    difficulty?: string;
    topic: string;
    targetAudience?: string;
    language?: string;
    learningObjectives?: string[];
    prerequisites?: string[];
    modules?: any[];
    metadata?: any;
  }
): Promise<AppwriteCourseDocument> {
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  let modulesStr = JSON.stringify(courseData.modules || []);
  if (modulesStr.length > 65000) {
    modulesStr = modulesStr.slice(0, 65000);
  }

  const payload = {
    courseId: courseData.courseId,
    userId: userId,
    title: courseData.title.slice(0, 255),
    description: (courseData.description || "").slice(0, 4000),
    difficulty: (courseData.difficulty || "beginner").slice(0, 32),
    topic: courseData.topic.slice(0, 255),
    targetAudience: (courseData.targetAudience || "general learners").slice(0, 255),
    language: (courseData.language || "en").slice(0, 16),
    learningObjectives: JSON.stringify(courseData.learningObjectives || []).slice(0, 4000),
    prerequisites: JSON.stringify(courseData.prerequisites || []).slice(0, 4000),
    modules: modulesStr,
    metadata: JSON.stringify(courseData.metadata || {}).slice(0, 2000),
    status: "completed",
  };

  return await databases.createDocument<AppwriteCourseDocument>(
    APPWRITE_DATABASE_ID,
    APPWRITE_COURSES_COLLECTION_ID,
    ID.unique(),
    payload,
    permissions
  );
}

export async function deleteUserCourse(documentId: string): Promise<void> {
  await databases.deleteDocument(
    APPWRITE_DATABASE_ID,
    APPWRITE_COURSES_COLLECTION_ID,
    documentId
  );
}

// Helper methods for Appwrite Storage (Resumes)
export async function uploadResumeFile(
  userId: string,
  file: File
): Promise<Models.File> {
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];

  return await storage.createFile(
    APPWRITE_BUCKET_ID,
    ID.unique(),
    file,
    permissions
  );
}

export function getFileViewUrl(fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}
