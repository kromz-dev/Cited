import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Adresse email invalide.").max(254);
const password = z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères.").max(128);

export const registerSchema = z.object({
  email,
  password,
  name: z.string().trim().min(1, "Le nom est requis.").max(100),
});

export const loginSchema = z.object({ email, password });
