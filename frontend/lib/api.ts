import { z } from "zod";

export const ProjectStatus = z.enum(["active", "in_progress", "archived"]);
export const SkillLevel = z.enum(["daily", "learning"]);

export type ProjectStatus = z.infer<typeof ProjectStatus>;
export type SkillLevel = z.infer<typeof SkillLevel>;

export const ProjectSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title_en: z.string(),
  title_pt: z.string(),
  short_description_en: z.string(),
  short_description_pt: z.string(),
  long_description_en: z.string().nullable(),
  long_description_pt: z.string().nullable(),
  tech_stack: z.array(z.string()),
  image_url: z.string().nullable(),
  live_url: z.string().nullable(),
  repo_url: z.string().nullable(),
  status: ProjectStatus,
  featured: z.boolean(),
  order: z.number().int(),
  create_date: z.string(),
  write_date: z.string(),
});

export const SkillSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  category: z.string(),
  level: SkillLevel,
  visible: z.boolean(),
  order: z.number().int(),
  create_date: z.string(),
  write_date: z.string(),
});

export const SkillsByCategorySchema = z.record(z.string(), z.array(SkillSchema));
export const ProjectListSchema = z.array(ProjectSchema);

export type Project = z.infer<typeof ProjectSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SkillsByCategory = z.infer<typeof SkillsByCategorySchema>;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchJson(url: string, tags: string[]): Promise<unknown> {
  const res = await fetch(url, {
    next: { revalidate: 3600, tags },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText} (${url})`);
  }

  return res.json();
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const data = await fetchJson(`${API_URL}/projects?featured=true`, ["projects"]);
  return ProjectListSchema.parse(data);
}

export async function getAllProjects(): Promise<Project[]> {
  const data = await fetchJson(`${API_URL}/projects`, ["projects"]);
  return ProjectListSchema.parse(data);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const res = await fetch(`${API_URL}/projects/${slug}`, {
    next: { revalidate: 3600, tags: ["projects"] },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch project: ${res.status} ${res.statusText}`);
  }

  return ProjectSchema.parse(await res.json());
}

export async function getAllSkills(): Promise<SkillsByCategory> {
  const data = await fetchJson(`${API_URL}/skills`, ["skills"]);
  return SkillsByCategorySchema.parse(data);
}
