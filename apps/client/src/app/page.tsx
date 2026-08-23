import { log } from "@repo/logger";
import { Link } from "@food360/ui/link";
import { CounterButton } from "@food360/ui/counter-button";

export const metadata = {
  title: "Food360 Client",
};

export default function Store() {
  log("Hey! This is the Store page.");

  return (
    <div className="container">
      <h1 className="title">
        Food360 <br />
        <span>Client</span>
      </h1>
      <CounterButton />
      <p className="description">
        Built With{" "}
        <Link href="https://turborepo.dev" newTab>
          Turborepo
        </Link>
        {" & "}
        <Link href="https://nextjs.org/" newTab>
          Next.js
        </Link>
      </p>
    </div>
  );
}
