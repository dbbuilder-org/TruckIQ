import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { specDocuments } from '@/lib/data/mock-data';
import {
  Truck,
  Target,
  ClipboardList,
  Network,
  Database,
  RefreshCw,
  Brain,
  Layout,
  Shield,
  Map,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Target,
  ClipboardList,
  Network,
  Database,
  RefreshCw,
  Brain,
  Layout,
  Shield,
  Map,
  BookOpen,
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Truck className="h-12 w-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">TruckIQ</h1>
            <Badge className="bg-blue-500 text-white text-lg px-3 py-1">AI</Badge>
          </div>
          <p className="text-xl text-slate-300 mb-4">
            Revolutionary Fleet Intelligence Platform
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Predict failures before they happen. Fix trucks before they break.
            Deliver exceptional uptime for Kenworth fleets.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Sparkles className="h-5 w-5 mr-2" />
                Launch Demo
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="#specs">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                View Specifications
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <RefreshCw className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">TruckTech+ Integration</h3>
              <p className="text-slate-400 text-sm">
                Automated data sync with MFA handling from PACCAR Solutions portal
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Brain className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Predictive AI</h3>
              <p className="text-slate-400 text-sm">
                30/60/90-day failure predictions with component-level detail
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Layout className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Tier Dashboards</h3>
              <p className="text-slate-400 text-sm">
                Truck → Group → Company → Dealer views with smart filtering
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prototype Demo Section */}
      <div className="bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-green-500 text-white mb-4">PROTOTYPE READY</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">Interactive Demo</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Explore the full dashboard experience with realistic placeholder data.
              All pages are functional and ready for real data integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <Link href="/dashboard">
              <Card className="bg-slate-700 border-slate-600 hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Layout className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <p className="font-medium text-white">Company Dashboard</p>
                  <p className="text-xs text-slate-400 mt-1">Fleet overview & KPIs</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/vehicles">
              <Card className="bg-slate-700 border-slate-600 hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Truck className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <p className="font-medium text-white">Vehicle List</p>
                  <p className="text-xs text-slate-400 mt-1">Search & filter</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/vehicles/v1">
              <Card className="bg-slate-700 border-slate-600 hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <p className="font-medium text-white">Vehicle Detail</p>
                  <p className="text-xs text-slate-400 mt-1">Faults & predictions</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/dealer">
              <Card className="bg-slate-700 border-slate-600 hover:border-blue-500 transition-colors cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <p className="font-medium text-white">Dealer View</p>
                  <p className="text-xs text-slate-400 mt-1">Multi-fleet management</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Specification Documents Section */}
      <div id="specs" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Complete Specification Kit</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comprehensive documentation covering every aspect of the TruckIQ AI platform,
              from product vision to technical implementation details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {specDocuments.map((doc) => {
              const Icon = iconMap[doc.icon] || BookOpen;
              return (
                <Card key={doc.title} className="bg-slate-800 border-slate-700 hover:border-slate-500 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <CardTitle className="text-lg text-white">{doc.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-400">
                      {doc.description}
                    </CardDescription>
                    <div className="mt-4 flex items-center text-xs text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      Complete
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="bg-slate-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Technology Stack</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Built with modern, production-ready technologies
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
            {[
              'Next.js 14+',
              'React',
              'TypeScript',
              'Tailwind CSS',
              'shadcn/ui',
              'PostgreSQL',
              'Prisma',
              'Clerk Auth',
              'Python',
              'Playwright',
              'Render',
            ].map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-slate-300 border-slate-600 px-4 py-2"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Fleet Maintenance?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            TruckIQ AI is ready for development. The architecture is defined, the prototype is built,
            and the path to MVP is clear.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explore Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>TruckIQ AI &copy; 2026 ServiceVision. Built with care for the future of fleet maintenance.</p>
          <p className="mt-2">
            Contact: <a href="mailto:chris@servicevision.net" className="text-blue-400 hover:underline">chris@servicevision.net</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
