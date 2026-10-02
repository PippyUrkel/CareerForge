import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "CareerForge | AI Career & Learning Platform" },
    { name: "description", content: "AI-powered career development, course generation, and talent analytics." },
  ];
}

export default function Home() {
  return <Welcome />;
}
