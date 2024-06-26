import { Button } from "@/components/ui/button"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import { Terminal, CircleChevronDown } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export function FooterDrawer() {  
    return (
        <Drawer>
            <DrawerTrigger>
            <Alert className="text-left">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Say Hi!</AlertTitle>
                <AlertDescription>
                    Always happy to connect with new people. Feel free to reach out to me.
                </AlertDescription>
            </Alert>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Feel free to reach out</DrawerTitle>
                    <DrawerDescription>Site is currently under construction - reach out <a className="rounded-full bg-primary text-secondary py-1 px-2 hover:bg-primary/50" href="https://bio.site/ashis">here</a></DrawerDescription>
                </DrawerHeader>
                <DrawerFooter className="flex items-center justify-center">
                    <DrawerClose>
                        <div className="flex items-center justify-center gap-2 p-2 text-primary">
                            <CircleChevronDown /> Close
                        </div>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

