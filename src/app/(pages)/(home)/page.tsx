import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/common/logo";
import HomeHeader from "./home-header";
import CTAGroup from "./cta-group";

export default function Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HomeHeader />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Logo size={96} />
            </div>

            <div className="space-y-4">
              <h1 className="text-b32 font-bold tracking-tight">
                Your Personal <span className="text-primary">Digital Board</span>
              </h1>
              <p className="text-m18 text-muted-foreground max-w-2xl mx-auto">
                A modern, lightweight alternative to Notion. Create, organize, and collaborate on boards with rich text
                editing, task management, and real-time features - perfect for university students who need a simple yet
                powerful workspace.
              </p>
            </div>

            <CTAGroup />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-b18 flex items-center gap-2">🎨 Rich Text Editing</CardTitle>
                <CardDescription>Powerful TipTap editor with formatting, tables, and image support</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-b18 flex items-center gap-2">🔄 Seamless Co-Work</CardTitle>
                <CardDescription>Work together real-time with live updates and sync</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-b18 flex items-center gap-2">🎯 Task Management</CardTitle>
                <CardDescription>Stay organized with built-in task tracking and board management</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center pt-8">
            <p className="text-r14 text-muted-foreground">
              Want to try Sylva without an account?{" "}
              <Link href="/demo" className="text-primary hover:underline">
                Free Board
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
