import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Zap, Gift, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="text-center py-12 md:py-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Start Earning Today
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6">
            Earn Rewards,
            <br />
            <span className="text-primary">Unlock Benefits</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our rewards program to earn points, unlock exclusive rewards, and celebrate your progress every step of
            the way.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-12">
          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Earn Points Daily</CardTitle>
              <CardDescription>
                Check in every day to earn points and build your streak. The longer your streak, the more you earn!
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Redeem Rewards</CardTitle>
              <CardDescription>
                Exchange your points for gift cards, cash transfers, and exclusive rewards from top brands.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Refer Friends</CardTitle>
              <CardDescription>
                Invite your friends and earn bonus points when they join. Everyone wins with our referral program!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
