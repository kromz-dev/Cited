export type BotAgent = 
  | "Browser" 
  | "GPTBot" 
  | "ClaudeBot" 
  | "PerplexityBot" 
  | "GoogleExtended" 
  | "OmgiliBot";

export const USER_AGENTS: Record<BotAgent, string> = {
  // Le contrôle : un navigateur Chrome récent classique
  Browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  
  // OpenAI
  GPTBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot",
  
  // Anthropic
  ClaudeBot: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com",
  
  // Perplexity
  PerplexityBot: "PerplexityBot/1.0",
  
  // Google (Bard / Vertex / Gemini)
  GoogleExtended: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 (compatible; Google-Extended; +https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)",
  
  // Webz.io / Divers souvent utilisés pour l'IA
  OmgiliBot: "Mozilla/5.0 (compatible; Omgilibot/1.0; +http://omgili.com/bot.html)"
};

// La liste des bots que nous scannons par défaut
export const DEFAULT_SCAN_BOTS: BotAgent[] = ["Browser", "GPTBot", "ClaudeBot", "PerplexityBot", "GoogleExtended"];
