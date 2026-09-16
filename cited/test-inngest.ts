import { Inngest } from "inngest";
const inngest = new Inngest({ id: "cited" });

inngest.createFunction(
  { id: "daily-scan" },
  { cron: "0 3 * * *" },
  async () => {}
);
