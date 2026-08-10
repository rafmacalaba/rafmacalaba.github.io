// Build-time GitHub data fetcher. All API calls happen during astro build.
// Handles missing tokens gracefully — never throws, returns partial data on failures.

interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  hireable: boolean | null;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  updated_at: string;
  archived: boolean;
  fork: boolean;
}

interface GitHubLanguage {
  name: string;
  bytes: number;
}

interface GitHubData {
  profile: GitHubProfile;
  pinnedRepos: GitHubRepo[];
  topLanguages: GitHubLanguage[];
  contributionSummary: ContributionSummary;
}

interface ContributionSummary {
  recentPushCount: number;
  lastActive: string | null;
}

const BASE = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  } else {
    console.warn("GITHUB_TOKEN not set — unauthenticated requests may hit rate limits");
  }
  return h;
}

const USERNAME = process.env.GITHUB_USERNAME ?? "rafmacalaba";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function ensureArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function safeFetch(url: string): Promise<unknown> {
  return fetch(url, { headers: headers() }).then((r) => {
    if (!r.ok) throw new Error(`GitHub API ${r.status}: ${url}`);
    return r.json();
  });
}

export async function fetchGitHubProfile(username: string): Promise<GitHubProfile> {
  try {
    const data = await safeFetch(`${BASE}/users/${username}`);
    if (!isRecord(data)) throw new Error("Invalid profile response");
    return {
      login: String(data.login ?? username),
      name: typeof data.name === "string" ? data.name : null,
      avatar_url: String(data.avatar_url ?? ""),
      bio: typeof data.bio === "string" ? data.bio : null,
      location: typeof data.location === "string" ? data.location : null,
      company: typeof data.company === "string" ? data.company : null,
      blog: typeof data.blog === "string" ? data.blog : "",
      html_url: String(data.html_url ?? `https://github.com/${username}`),
      public_repos: typeof data.public_repos === "number" ? data.public_repos : 0,
      followers: typeof data.followers === "number" ? data.followers : 0,
      following: typeof data.following === "number" ? data.following : 0,
      hireable: typeof data.hireable === "boolean" ? data.hireable : null,
    };
  } catch (err) {
    console.warn(`Failed to fetch GitHub profile for ${username}:`, err);
    return emptyProfile(username);
  }
}

function emptyProfile(username: string): GitHubProfile {
  return {
    login: username,
    name: null,
    avatar_url: "",
    bio: null,
    location: null,
    company: null,
    blog: "",
    html_url: `https://github.com/${username}`,
    public_repos: 0,
    followers: 0,
    following: 0,
    hireable: null,
  };
}

export async function fetchGitHubPinned(username: string): Promise<GitHubRepo[]> {
  try {
    const data = await safeFetch(`${BASE}/users/${username}/repos?sort=pushed&per_page=6`);
    const repos = ensureArray(data);
    return repos.slice(0, 6).map(parseRepo);
  } catch (err) {
    console.warn(`Failed to fetch repos for ${username}:`, err);
    return [];
  }
}

function parseRepo(raw: unknown): GitHubRepo {
  if (!isRecord(raw)) throw new Error("Invalid repo entry");
  const topics: unknown = raw.topics;
  return {
    name: String(raw.name ?? ""),
    full_name: String(raw.full_name ?? ""),
    description: typeof raw.description === "string" ? raw.description : null,
    html_url: String(raw.html_url ?? ""),
    stargazers_count: typeof raw.stargazers_count === "number" ? raw.stargazers_count : 0,
    forks_count: typeof raw.forks_count === "number" ? raw.forks_count : 0,
    language: typeof raw.language === "string" ? raw.language : null,
    topics: Array.isArray(topics) ? topics.map(String) : [],
    updated_at: String(raw.updated_at ?? ""),
    archived: raw.archived === true,
    fork: raw.fork === true,
  };
}

export async function fetchGitHubLanguages(username: string): Promise<GitHubLanguage[]> {
  try {
    // Get up to 30 repos and aggregate language counts
    const data = await safeFetch(`${BASE}/users/${username}/repos?per_page=30&sort=updated`);
    const repos = ensureArray(data);

    const langMap = new Map<string, number>();
    for (const repo of repos) {
      if (!isRecord(repo)) continue;
      const lang = repo.language;
      if (typeof lang === "string" && lang.length > 0) {
        langMap.set(lang, (langMap.get(lang) ?? 0) + 1);
      }
    }

    const sorted = [...langMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Use repo count as proxy for byte weight when individual lang stats unavailable
    const total = sorted.reduce((sum, [, c]) => sum + c, 0);
    return sorted.map(([name, count]) => ({
      name,
      bytes: Math.round((count / total) * 1000), // scaled bytes proxy
    }));
  } catch (err) {
    console.warn(`Failed to fetch languages for ${username}:`, err);
    return [];
  }
}

export async function fetchGitHubData(
  username: string = USERNAME,
): Promise<GitHubData> {
  const [profile, pinnedRepos, topLanguages] = await Promise.all([
    fetchGitHubProfile(username),
    fetchGitHubPinned(username),
    fetchGitHubLanguages(username),
  ]);

  const contributionSummary: ContributionSummary = {
    recentPushCount: pinnedRepos.length,
    lastActive:
      pinnedRepos.length > 0
        ? pinnedRepos.reduce((latest, r) =>
            r.updated_at > latest ? r.updated_at : latest, pinnedRepos[0].updated_at)
        : null,
  };

  return { profile, pinnedRepos, topLanguages, contributionSummary };
}
