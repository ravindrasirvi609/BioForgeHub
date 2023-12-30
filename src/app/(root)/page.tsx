import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return <main>
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Image src="/assets/images/logo.svg" alt="BioForgeHub Logo" width={128} height={38} />
      <Button asChild className="rounded-full" size="lg">
        <a href="/auth/sign-in">Login</a>
      </Button>
    </div>
  </main>;
}
