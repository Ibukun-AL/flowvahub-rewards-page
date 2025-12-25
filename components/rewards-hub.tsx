"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Bell,
  Calendar,
  BookOpen,
  Settings,
  Home,
  Compass,
  Layers,
  CreditCard,
  Diamond,
  Zap,
  Star,
  Users,
  Share2,
  Gift,
  Flame,
  SmilePlus,
  MoreVertical,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface Reward {
  id: string
  name: string
  description: string
  points_required: number
  category: string
  icon: string
}

interface UserData {
  points: number
  streak: number
  lastCheckIn: string | null
  referrals: number
  pointsEarned: number
}

export function RewardsHub({ user: initialUser }: { user: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<"earn" | "redeem">("earn")
  const [activeFilter, setActiveFilter] = useState<"all" | "unlocked" | "locked" | "coming_soon">("all")
  const [user, setUser] = useState<any>(initialUser)
  const [userPoints, setUserPoints] = useState(0)
  const [rewards, setRewards] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [userData, setUserData] = useState<UserData>({
    points: 0,
    streak: 0,
    lastCheckIn: null,
    referrals: 0,
    pointsEarned: 0,
  })
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchRewards()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const [pointsRes, streakRes, referralsRes] = await Promise.all([
        supabase.from("points_balance").select("points").eq("user_id", user.id).single(),
        supabase.from("daily_streaks").select("current_streak, last_check_in").eq("user_id", user.id).single(),
        supabase.from("referrals").select("*").eq("referrer_id", user.id),
      ])

      setUserData({
        points: pointsRes.data?.points || 0,
        streak: streakRes.data?.current_streak || 0,
        lastCheckIn: streakRes.data?.last_check_in || null,
        referrals: referralsRes.data?.length || 0,
        pointsEarned:
          referralsRes.data?.reduce((acc, r) => acc + (r.status === "completed" ? r.points_awarded : 0), 0) || 0,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRewards = async () => {
    try {
      const { data } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true })

      setRewards(data || [])
    } catch (error) {
      console.error("Error fetching rewards:", error)
    }
  }

  const handleClaimDailyPoints = async () => {
    setClaiming(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const lastCheckIn = userData.lastCheckIn

      if (lastCheckIn === today) {
        alert("You've already claimed today's points!")
        return
      }

      const isConsecutive = lastCheckIn === new Date(Date.now() - 86400000).toISOString().split("T")[0]
      const newStreak = isConsecutive ? userData.streak + 1 : 1
      const pointsToAdd = 5

      await Promise.all([
        supabase
          .from("points_balance")
          .update({ points: userData.points + pointsToAdd })
          .eq("user_id", user.id),
        supabase
          .from("daily_streaks")
          .update({ current_streak: newStreak, last_check_in: today })
          .eq("user_id", user.id),
      ])

      setUserData({
        ...userData,
        points: userData.points + pointsToAdd,
        streak: newStreak,
        lastCheckIn: today,
      })
    } catch (error) {
      console.error("Error claiming points:", error)
    } finally {
      setClaiming(false)
    }
  }

  const canClaimToday = userData.lastCheckIn !== new Date().toISOString().split("T")[0]
  const referralLink = `https://app.flowwahub.com/signup?ref=${user.email?.split("@")[0] || "user"}8245`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    alert("Referral link copied!")
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  const notifications = [
    {
      id: 1,
      icon: "flame",
      title: "Daily Streak Reminder",
      message: "Don't forget to claim your streak today and start building your momentum!",
      time: "1d ago",
    },
    {
      id: 2,
      icon: "flame",
      title: "Daily Streak Reminder",
      message: "Don't forget to claim your streak today and start building your momentum!",
      time: "2d ago",
    },
    {
      id: 3,
      icon: "welcome",
      title: `Welcome, ${user?.email?.split("@")[0] || "Ibukun"}!`,
      message: "We're thrilled to have you on board! Explore powerful tools and start earning rewards.",
      time: "3d ago",
    },
    {
      id: 4,
      icon: "calendar",
      title: "Automate and Optimize Your Schedule",
      message: "Try Reclaim.ai and earn 50 Flowva Points when you sign up!",
      time: "4d ago",
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-background flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="20" r="8" fill="#8B5CF6" />
              <circle cx="28" cy="20" r="8" fill="#8B5CF6" />
              <path d="M8 12 L12 8 L16 12" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M24 12 L28 8 L32 12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
            <span className="text-xl font-semibold text-primary">Flowwa</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted w-full text-left transition-colors">
              <Home className="h-5 w-5" />
              Home
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted w-full text-left transition-colors">
              <Compass className="h-5 w-5" />
              Discover
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted w-full text-left transition-colors">
              <BookOpen className="h-5 w-5" />
              Library
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted w-full text-left transition-colors">
              <Layers className="h-5 w-5" />
              Tech Stack
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted w-full text-left transition-colors">
              <CreditCard className="h-5 w-5" />
              Subscriptions
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary w-full text-left">
              <Diamond className="h-5 w-5" />
              Rewards Hub
            </button>
            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted w-full text-left transition-colors">
              <Settings className="h-5 w-5" />
              Settings
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-400 flex items-center justify-center text-sm font-medium text-white">
              {user.email?.[0].toUpperCase() || "I"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {user.email?.split("@")[0] || "Ibukun"}
              </div>
              <div className="text-xs text-muted-foreground truncate">{user.email || "aluko.ibkjsp@gmail.com"}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-60 h-screen overflow-y-auto">
        {/* Header - Only title, subtitle, notification, and tabs */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Rewards Hub</h1>
                <p className="text-gray-600 mt-1">Earn points, unlock rewards, and celebrate your progress!</p>
              </div>
              {/* Notifications Popover */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative hover:opacity-80 transition-opacity"
                >
                  <Bell className="h-6 w-6 text-muted-foreground" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    {/* Purple Header */}
                    <div className="bg-primary px-6 py-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Notifications</h3>
                      <div className="flex items-center gap-4">
                        <button className="text-white text-sm hover:underline">Mark all as read</button>
                        <button className="text-white text-sm hover:underline">Delete All</button>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3"
                        >
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              notification.icon === "flame"
                                ? "bg-orange-100"
                                : notification.icon === "welcome"
                                  ? "bg-green-100"
                                  : "bg-purple-100"
                            }`}
                          >
                            {notification.icon === "flame" && <Flame className="w-5 h-5 text-orange-500" />}
                            {notification.icon === "welcome" && <SmilePlus className="w-5 h-5 text-green-500" />}
                            {notification.icon === "calendar" && <Calendar className="w-5 h-5 text-purple-500" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                            <p className="text-gray-600 text-sm mt-1 truncate">{notification.message}</p>
                            <span className="text-gray-400 text-xs mt-2 block">{notification.time}</span>
                          </div>

                          {/* Menu Button */}
                          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="relative flex gap-8 border-b border-border">
              <button
                onClick={() => setActiveTab("earn")}
                className={`pb-4 px-1 font-medium text-sm transition-colors ${
                  activeTab === "earn" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Earn Points
              </button>
              <button
                onClick={() => setActiveTab("redeem")}
                className={`pb-4 px-1 font-medium text-sm transition-colors ${
                  activeTab === "redeem" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Redeem Rewards
              </button>
              {/* Sliding underline indicator */}
              <div
                className={`absolute bottom-0 h-1 bg-primary transition-all duration-300 ease-in-out ${
                  activeTab === "earn" ? "left-0 w-[102px]" : "left-[134px] w-[138px]"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {activeTab === "earn" ? (
            <div className="space-y-8">
              {/* Your Rewards Journey */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold">Your Rewards Journey</h2>
                </div>

                {/* Updated grid to use equal column widths for first two cards and fixed heights */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Points Balance */}
                  <Card className="bg-violet-50/50 border-none shadow-sm h-[390px] p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Diamond className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Points Balance</span>
                    </div>
                    <div className="flex items-center justify-between mb-8">
                      <div className="text-5xl font-bold text-primary">{userData.points}</div>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                        <Star className="h-7 w-7 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Progress to <span className="font-medium text-foreground">$5 Gift Card</span>
                      </span>
                      <span className="font-semibold text-foreground">{userData.points}/5000</span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.min((userData.points / 5000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-auto">
                      <span>🚀</span> Just getting started — keep earning points!
                    </p>
                  </Card>

                  {/* Daily Streak */}
                  <Card className="bg-blue-50/30 border-none shadow-sm h-[390px] p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Daily Streak</span>
                    </div>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-primary">{userData.streak}</span>{" "}
                      <span className="text-xl font-bold text-primary">day</span>
                    </div>
                    <div className="flex gap-2 mb-6">
                      {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            i === 2
                              ? "bg-white text-foreground border-2 border-primary"
                              : "bg-gray-200 text-muted-foreground"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground text-center mb-6">Check in daily to earn +5 points</p>
                    <Button
                      className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-full mt-auto"
                      onClick={handleClaimDailyPoints}
                      disabled={!canClaimToday || claiming}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {claiming ? "Claiming..." : canClaimToday ? "Claim Today's Points" : "Claimed Today"}
                    </Button>
                  </Card>

                  {/* Featured Spotlight */}
                  <Card className="border-none shadow-sm h-[390px] overflow-hidden p-0 flex flex-col">
                    {/* Gradient top section */}
                    <div className="bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#60A5FA] text-white relative p-6 pb-5">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 mb-3 px-3 py-1 text-xs font-medium">
                        Featured
                      </Badge>
                      <h3 className="text-xl font-bold mb-1 text-white">Top Tool Spotlight</h3>
                      <h4 className="text-2xl font-bold text-white">Reclaim</h4>
                      <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-blue-500/90 flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4 rounded-full bg-white absolute top-2 left-2" />
                        <div className="w-4 h-4 rounded-full bg-black absolute top-2 right-2" />
                        <div className="w-6 h-6 rounded-full bg-pink-400 absolute bottom-2 left-1/2 -translate-x-1/2" />
                      </div>
                    </div>

                    {/* White bottom section */}
                    <div className="bg-white p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold mb-2 text-foreground">Automate and Optimize Your Schedule</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Reclaim.ai is an AI-powered calendar assistant that automatically schedules your tasks,
                            meetings, and breaks to boost productivity. Free to try — earn Flowwa Points when you sign
                            up!
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-auto">
                        <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 h-10 text-sm rounded-full">
                          <Users className="h-4 w-4 mr-2" />
                          Sign up
                        </Button>
                        <Button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 h-10 text-sm rounded-full">
                          <Gift className="h-4 w-4 mr-2" />
                          Claim 50 pts
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Earn More Points */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-2xl font-bold">Earn More Points</h2>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 max-w-4xl">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Star className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">Refer and win 10,000 points!</h3>
                          <p className="text-sm text-muted-foreground">
                            Invite 3 friends by Nov 20 and earn a chance to be one of 5 winners of{" "}
                            <span className="text-primary font-semibold">10,000 points</span>. Friends must complete
                            onboarding to qualify.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Share2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">Share Your Stack</h3>
                          <p className="text-sm text-muted-foreground mb-4">Earn +25 pts</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-foreground">Share your tool stack</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Refer & Earn */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-2xl font-bold">Refer & Earn</h2>
                </div>

                <Card>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-8">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Share Your Link</h3>
                        <p className="text-muted-foreground">Invite friends and earn 25 points when they join!</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary mb-2">{userData.referrals}</div>
                        <div className="text-sm text-muted-foreground">Referrals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary mb-2">{userData.pointsEarned}</div>
                        <div className="text-sm text-muted-foreground">Points Earned</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-sm text-muted-foreground mb-2 block">Your personal referral link:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="flex-1 px-4 py-3 bg-muted rounded-lg text-sm"
                        />
                        <Button
                          onClick={copyToClipboard}
                          size="icon"
                          className="h-12 w-12 bg-primary/10 hover:bg-primary/20 text-primary"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-[#1877F2]/90 flex items-center justify-center text-white transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </button>
                      <button className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center text-white transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7.084 4.126H5.117z" />
                        </svg>
                      </button>
                      <button className="w-12 h-12 rounded-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 flex items-center justify-center text-white transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </button>
                      <button className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 flex items-center justify-center text-white transition-colors">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Redeem Your Points */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-2xl font-bold">Redeem Your Points</h2>
              </div>

              <div className="flex gap-2 mb-6">
                <Button
                  variant="secondary"
                  className={`${
                    activeFilter === "all"
                      ? "bg-purple-100 text-primary hover:bg-purple-200"
                      : "bg-transparent text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveFilter("all")}
                >
                  All Rewards{" "}
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeFilter === "all" ? "bg-white" : "bg-muted"}`}
                  >
                    {rewards.length}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className={`${
                    activeFilter === "unlocked"
                      ? "bg-purple-100 text-primary hover:bg-purple-200"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveFilter("unlocked")}
                >
                  Unlocked{" "}
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeFilter === "unlocked" ? "bg-white" : "bg-muted"}`}
                  >
                    {rewards.filter((r) => userData.points >= r.points_required && r.points_required > 0).length}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className={`${
                    activeFilter === "locked"
                      ? "bg-purple-100 text-primary hover:bg-purple-200"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveFilter("locked")}
                >
                  Locked{" "}
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeFilter === "locked" ? "bg-white" : "bg-muted"}`}
                  >
                    {rewards.filter((r) => userData.points < r.points_required && r.points_required > 0).length}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  className={`${
                    activeFilter === "coming_soon"
                      ? "bg-purple-100 text-primary hover:bg-purple-200"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setActiveFilter("coming_soon")}
                >
                  Coming Soon{" "}
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeFilter === "coming_soon" ? "bg-white" : "bg-muted"}`}
                  >
                    {rewards.filter((r) => r.points_required === 0).length}
                  </span>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {rewards
                  .filter((reward) => {
                    const isLocked = userData.points < reward.points_required && reward.points_required > 0
                    const isUnlocked = userData.points >= reward.points_required && reward.points_required > 0
                    const isComingSoon = reward.points_required === 0

                    if (activeFilter === "all") return true
                    if (activeFilter === "unlocked") return isUnlocked
                    if (activeFilter === "locked") return isLocked
                    if (activeFilter === "coming_soon") return isComingSoon
                    return true
                  })
                  .map((reward) => {
                    const isLocked = userData.points < reward.points_required
                    const isComingSoon = reward.points_required === 0

                    // Determine icon background color based on reward type
                    const getIconBg = (name: string) => {
                      if (name.includes("Bank") || name.includes("PayPal")) return "bg-purple-100"
                      if (name.includes("Udemy")) return "bg-purple-100"
                      return "bg-pink-100"
                    }

                    return (
                      <Card key={reward.id} className="border">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div
                            className={`w-16 h-16 rounded-2xl ${getIconBg(reward.name)} flex items-center justify-center mb-4`}
                          >
                            {reward.name.includes("Udemy") ? (
                              <svg
                                className="h-8 w-8 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C4.168 5.477 5.754 5 7.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            ) : reward.name.includes("Bank") || reward.name.includes("PayPal") ? (
                              <svg
                                className="h-8 w-8 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              </svg>
                            ) : (
                              <Gift className="h-8 w-8 text-pink-600" />
                            )}
                          </div>

                          <h3 className="font-bold text-lg mb-2">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{reward.description}</p>

                          <div className="flex items-center gap-1 mb-4">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-semibold text-primary">
                              {isComingSoon ? "0 pts" : `${reward.points_required} pts`}
                            </span>
                          </div>

                          <Button
                            className="w-full"
                            disabled={isLocked || isComingSoon}
                            variant={isLocked || isComingSoon ? "secondary" : "default"}
                          >
                            {isComingSoon ? "Coming Soon" : isLocked ? "Locked" : "Redeem"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
