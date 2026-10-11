import React, { useState, useEffect, useCallback } from 'react';
import { Writeup, ActiveTab } from './types';
import { INITIAL_WRITEUPS } from './data/writeups';
import { INITIAL_LABS } from './data/labs';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StatsBar } from './components/StatsBar';
import { FeaturedDossiers } from './components/FeaturedDossiers';
import { RecentWriteupsTable } from './components/RecentWriteupsTable';
import { HomelabSection } from './components/HomelabSection';
import { WriteupDetailView } from './components/WriteupDetailView';
import { WriteupOverviewView } from './components/WriteupOverviewView';
import { AboutPageView } from './components/AboutPageView';
import { LabsPageView } from './components/LabsPageView';
import { ResumeModal } from './components/ResumeModal';
import { Footer } from './components/Footer';

// Helper: Detect base repository path on GitHub Pages (e.g. '/portfolio')
const getBasePath = (): string => {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  const segments = pathname.split('/').filter(Boolean);
  const knownRoutes = ['writeup', 'writeups', 'lab', 'labs', 'about', 'homelab', 'resources', 'api'];
  if (segments.length > 0 && !knownRoutes.includes(segments[0].toLowerCase())) {
    return '/' + segments[0]; // e.g. '/portfolio' on GitHub Pages (linhtat00.github.io/portfolio)
  }
  return '';
};

interface ParsedRoute {
  tab: ActiveTab;
  writeup: Writeup | null;
  labSlug: string | null;
  isInvalid: boolean;
}

// Helper: Parse and validate routes strictly. If any route is non-existent, mark as isInvalid: true.
const parseRouteFromLocation = (writeupList: Writeup[]): ParsedRoute => {
  if (typeof window === 'undefined') {
    return { tab: 'home', writeup: null, labSlug: null, isInvalid: false };
  }

  const base = getBasePath().toLowerCase();
  let path = window.location.pathname.toLowerCase();
  
  // Strip base prefix if present
  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }
  
  const search = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').trim();
  const segments = path.split('/').filter(Boolean);

  // 1. Query parameter checks (?tab=... or ?writeup=... or ?lab=...)
  if (window.location.search) {
    const qWriteup = search.get('writeup');
    if (qWriteup) {
      const found = writeupList.find(w => 
        w.id.toLowerCase() === qWriteup.toLowerCase() || 
        (w.slug && w.slug.toLowerCase() === qWriteup.toLowerCase())
      );
      if (found) {
        return { tab: 'writeups', writeup: found, labSlug: null, isInvalid: false };
      }
      return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
    }

    const qLab = search.get('lab') || search.get('labs');
    if (qLab) {
      const labExists = INITIAL_LABS.some(l => l.slug.toLowerCase() === qLab.toLowerCase());
      if (labExists) {
        return { tab: 'labs', writeup: null, labSlug: qLab, isInvalid: false };
      }
      return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
    }

    const qTab = search.get('tab');
    if (qTab === 'about') return { tab: 'about', writeup: null, labSlug: null, isInvalid: false };
    if (qTab === 'labs') return { tab: 'labs', writeup: null, labSlug: null, isInvalid: false };
    if (qTab === 'writeups') return { tab: 'writeups', writeup: null, labSlug: null, isInvalid: false };
    if (qTab === 'home') return { tab: 'home', writeup: null, labSlug: null, isInvalid: false };

    // Any other unrecognized query param with no other path is invalid
    if (segments.length === 0 && !rawHash) {
      return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
    }
  }

  // 2. Hash-based routing checks (#/about, #/writeups, #/labs, #/writeup/:id, #/lab/:slug)
  if (rawHash) {
    if (rawHash === 'about') return { tab: 'about', writeup: null, labSlug: null, isInvalid: false };
    if (rawHash === 'labs' || rawHash === 'homelab') return { tab: 'labs', writeup: null, labSlug: null, isInvalid: false };
    if (rawHash === 'writeups') return { tab: 'writeups', writeup: null, labSlug: null, isInvalid: false };
    if (rawHash === '' || rawHash === '/') return { tab: 'home', writeup: null, labSlug: null, isInvalid: false };

    if (rawHash.startsWith('writeup/') || rawHash.startsWith('writeups/')) {
      const id = rawHash.replace(/^writeups?\//, '').trim();
      if (id) {
        const found = writeupList.find(w => 
          w.id.toLowerCase() === id.toLowerCase() || 
          (w.slug && w.slug.toLowerCase() === id.toLowerCase())
        );
        if (found) {
          return { tab: 'writeups', writeup: found, labSlug: null, isInvalid: false };
        }
      }
      return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
    }

    if (rawHash.startsWith('lab/') || rawHash.startsWith('labs/')) {
      const slug = rawHash.replace(/^labs?\//, '').trim();
      if (slug) {
        const labExists = INITIAL_LABS.some(l => l.slug.toLowerCase() === slug.toLowerCase());
        if (labExists) {
          return { tab: 'labs', writeup: null, labSlug: slug, isInvalid: false };
        }
      }
      return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
    }

    // Unrecognized hash
    return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
  }

  // 3. Pathname routing checks
  // Empty or root path "/"
  if (segments.length === 0) {
    return { tab: 'home', writeup: null, labSlug: null, isInvalid: false };
  }

  // /about
  if (segments.length === 1 && segments[0] === 'about') {
    return { tab: 'about', writeup: null, labSlug: null, isInvalid: false };
  }

  // /labs or /homelab
  if (segments.length === 1 && (segments[0] === 'labs' || segments[0] === 'homelab')) {
    return { tab: 'labs', writeup: null, labSlug: null, isInvalid: false };
  }

  // /labs/:slug or /lab/:slug
  if (segments.length === 2 && (segments[0] === 'labs' || segments[0] === 'lab')) {
    const slug = segments[1];
    const labExists = INITIAL_LABS.some(l => l.slug.toLowerCase() === slug.toLowerCase());
    if (labExists) {
      return { tab: 'labs', writeup: null, labSlug: slug, isInvalid: false };
    }
    return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
  }

  // /writeups
  if (segments.length === 1 && segments[0] === 'writeups') {
    return { tab: 'writeups', writeup: null, labSlug: null, isInvalid: false };
  }

  // /writeup/:idOrSlug or /writeups/:idOrSlug
  if (segments.length === 2 && (segments[0] === 'writeup' || segments[0] === 'writeups')) {
    const id = segments[1];
    const found = writeupList.find(w => 
      w.id.toLowerCase() === id.toLowerCase() || 
      (w.slug && w.slug.toLowerCase() === id.toLowerCase())
    );
    if (found) {
      return { tab: 'writeups', writeup: found, labSlug: null, isInvalid: false };
    }
    return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
  }

  // 4. Any other route (e.g. /upload, /uploads, /anything-invalid)
  return { tab: 'home', writeup: null, labSlug: null, isInvalid: true };
};

export default function App() {
  const [writeups] = useState<Writeup[]>(() => {
    try {
      const saved = localStorage.getItem('blue_team_writeups');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load local writeups', e);
    }
    return INITIAL_WRITEUPS;
  });

  // Parse initial route on load
  const initialRoute = parseRouteFromLocation(writeups);

  // If initial route is invalid, reset URL to clean Home URL immediately
  if (initialRoute.isInvalid && typeof window !== 'undefined') {
    const base = getBasePath();
    const homeUrl = base ? `${base}/` : '/';
    try {
      window.history.replaceState(null, '', homeUrl);
    } catch (e) {
      window.location.hash = '';
    }
  }

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialRoute.tab);
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(initialRoute.writeup);
  const [selectedLabSlug, setSelectedLabSlug] = useState<string | null>(initialRoute.labSlug);

  // Modals
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Helper to update browser URL bar
  const updateRoute = (path: string) => {
    try {
      const base = getBasePath();
      const fullPath = base ? `${base}${path}` : path;
      window.history.pushState(null, '', fullPath);
    } catch (e) {
      window.location.hash = path;
    }
  };

  // Listen to browser navigation (back/forward & hash changes)
  const syncRouteFromBrowser = useCallback(() => {
    const route = parseRouteFromLocation(writeups);
    
    // If user navigated to an invalid route, redirect URL back to clean Home
    if (route.isInvalid) {
      const base = getBasePath();
      const homeUrl = base ? `${base}/` : '/';
      try {
        window.history.replaceState(null, '', homeUrl);
      } catch (e) {
        window.location.hash = '';
      }
    }

    setActiveTab(route.tab);
    setSelectedWriteup(route.writeup);
    setSelectedLabSlug(route.labSlug);
  }, [writeups]);

  useEffect(() => {
    window.addEventListener('popstate', syncRouteFromBrowser);
    window.addEventListener('hashchange', syncRouteFromBrowser);
    return () => {
      window.removeEventListener('popstate', syncRouteFromBrowser);
      window.removeEventListener('hashchange', syncRouteFromBrowser);
    };
  }, [syncRouteFromBrowser]);

  // Showcase Navigation
  const handleSelectWriteup = (w: Writeup) => {
    setSelectedWriteup(w);
    setActiveTab('writeups');
    updateRoute(`/writeup/${w.slug || w.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setSelectedWriteup(null);
    setActiveTab('writeups');
    updateRoute('/writeups');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLab = (slug: string | null) => {
    setSelectedLabSlug(slug);
    setActiveTab('labs');
    if (slug) {
      updateRoute(`/labs/${slug}`);
    } else {
      updateRoute('/labs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: ActiveTab) => {
    setSelectedWriteup(null);
    setSelectedLabSlug(null);
    setActiveTab(tab);
    
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    updateRoute(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // PUBLIC SHOWCASE PORTFOLIO (www.myportfolio.io)
  return (
    <div className="app-root">
      {/* Top Fixed Header */}
      <Header
        activeTab={selectedWriteup ? 'writeups' : activeTab}
        setActiveTab={handleTabChange}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {selectedWriteup ? (
          /* View 1: Detailed Threat Dossier / Specific Challenge Reader */
          <WriteupDetailView
            writeup={selectedWriteup}
            onBack={handleBackFromDetail}
            onSelectOtherWriteup={handleSelectWriteup}
            allWriteups={writeups}
          />
        ) : activeTab === 'writeups' ? (
          /* View 2: /writeup Overview Blog Catalog Page */
          <WriteupOverviewView
            writeups={writeups}
            onSelectWriteup={handleSelectWriteup}
            onBackToHome={() => handleTabChange('home')}
          />
        ) : activeTab === 'about' ? (
          /* View 3: /about Dedicated Personal Profile & Certifications Page */
          <AboutPageView
            onBackToHome={() => handleTabChange('home')}
            onOpenResume={() => setIsResumeOpen(true)}
            onExploreWriteups={() => handleTabChange('writeups')}
            onExploreHomelab={() => handleTabChange('labs')}
            onExploreLabs={(labSlug) => handleSelectLab(labSlug || null)}
          />
        ) : activeTab === 'labs' ? (
          /* View 4: /labs Dedicated Academic, Cert & Engineering Ranges Page */
          <LabsPageView
            initialSelectedLabSlug={selectedLabSlug}
            onBackToHome={() => handleTabChange('home')}
            onExploreWriteups={() => handleTabChange('writeups')}
            onOpenResume={() => setIsResumeOpen(true)}
            onSelectLab={handleSelectLab}
          />
        ) : (
          /* View 5: Primary Portfolio Homepage - Showcase Projects & Skills */
          <div className="flex flex-col w-full">
            {/* Hero Section */}
            <HeroSection
              onExploreWriteups={() => handleTabChange('writeups')}
              onDownloadResume={() => setIsResumeOpen(true)}
            />

            {/* Metrics / Stats Bar */}
            <StatsBar
              onOpenWriteups={() => handleTabChange('writeups')}
              onOpenLabs={() => handleSelectLab(null)}
              onOpenCerts={() => handleTabChange('about')}
            />

            {/* Featured Threat Analyses Dossiers */}
            <FeaturedDossiers
              writeups={writeups}
              onSelectWriteup={handleSelectWriteup}
              onViewAll={() => handleTabChange('writeups')}
            />

            {/* Recent All-Writeups Table */}
            <RecentWriteupsTable
              writeups={writeups}
              onSelectWriteup={handleSelectWriteup}
              onViewAll={() => handleTabChange('writeups')}
            />

            {/* Proxmox Homelab Range Showcase */}
            <HomelabSection
              onExploreHomelabPage={() => handleTabChange('labs')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Resume Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}
