import Image from "next/image";


import { ModeToggle } from "@/components/ui/mode-toggle"
import { FooterDrawer } from "@/components/footer-drawer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24">

      <ModeToggle />
      <div className="flex items-center justify-center">
        Hi, I'm Ashis
      </div>
      <FooterDrawer />

    </main>
  );
}
