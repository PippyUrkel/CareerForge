import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("generator", "routes/generator.tsx"),
  route("skills", "routes/skills.tsx"),
  route("careers", "routes/careers.tsx"),
  route("learning-paths", "routes/learning-paths.tsx"),
  route("jobs", "routes/jobs.tsx"),
  route("jobs/matching", "routes/job-matching.tsx"),
  route("analytics", "routes/analytics.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;

