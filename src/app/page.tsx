import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import Link from 'next/link'
import { ArrowRight, Bot, MapPin, Search, Star, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="gradient-bg py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Local Businesses with{' '}
              <span className="text-primary">AI Assistance</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Discover local businesses and get instant answers to your questions 
              with our AI-powered directory. Each business has its own AI assistant 
              ready to help.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/browse">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Businesses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose Our Directory?</h2>
            <p className="mb-12 text-muted-foreground">
              We're revolutionizing how customers connect with businesses using AI technology.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Bot className="h-10 w-10 text-primary" />
                <CardTitle>AI-Powered Assistance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Each business has its own AI assistant that can answer questions about 
                  services, hours, pricing, and more in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary" />
                <CardTitle>Local Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find businesses near you with our smart location-based search. 
                  Discover hidden gems in your neighborhood.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-10 w-10 text-primary" />
                <CardTitle>Verified Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All businesses are verified for authenticity. Trust that you're 
                  getting accurate information every time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary" />
                <CardTitle>Smart Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our intelligent search understands natural language queries and 
                  finds exactly what you're looking for.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary" />
                <CardTitle>Instant Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get immediate answers to your questions without waiting for 
                  business owners to respond. Available 24/7.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle>Growing Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join thousands of businesses and customers who are already 
                  part of our AI-powered directory.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Whether you're looking for businesses or want to list your own, 
              we'll help you connect with AI assistance.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/browse">
                <Button size="lg" variant="default">
                  Find Businesses
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline">
                  List Your Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}