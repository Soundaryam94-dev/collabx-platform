const CREATOR_IMAGES = [
  "/assets/comedy.jpg",
  "/assets/fitness.jpg",
  "/assets/lifestyle.jpg",
  "/assets/tech.jpg",
  "/assets/travel.jpg",
];

export function getAvatarSrc(id: string, role: string, avatarUrl?: string | null): string {
  if (avatarUrl) return avatarUrl;
  if (role === "brand") return "/assets/business.jpg";
  const hash = Array.from(id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CREATOR_IMAGES[hash % CREATOR_IMAGES.length];
}
