import { HomePage } from "@/components/home/HomePage";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  return <HomePage isLoggedIn={!!session?.user} />;
}
