import Image from "next/image";


import { ModeToggle } from "@/components/ui/mode-toggle"
import { FooterDrawer } from "@/components/footer-drawer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between items-center p-24">

      <ModeToggle />
      <div className="flex flex-col items-center w-8/12">
          <p className="text-6xl ">
            Hi, I&apos;m 
          </p>
          <a href="https://bio.site/ashis" className="font-bold text-9xl text-primary hover:text-primary/50">
            Ashis
          </a>
          <p className="text-3xl text-primary/50 italic">
            Site is currently under construction
          </p>
      </div>
      <FooterDrawer />

    </main>
  );
}
