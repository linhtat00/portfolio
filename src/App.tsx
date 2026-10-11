import React, { useState, useEffect, useCallback } from 'react';
import { Writeup, ActiveTab } from './types';
import { INITIAL_WRITEUPS } from './data/writeups';
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
  const knownRoutes = ['writeup', 'writeups', 'lab', 'labs', 'about', 'upload', 'resources', 'api'];
  if (segments.length > 0 && !knownRoutes.includes(segments[0].toLowerCase())) {
    return '/' + segments[0]; // e.g. '/portfolio' on GitHub Pages (linhtat00.github.io/portfolio)
  }
  return '';
};

// Helper: Parse route from pathname, search queries, and hash
const parseRouteFromLocation = (writeupList: Writeup[]): {
  tab: ActiveTab;
  writeup: Writeup | null;
  labSlug: string | null;
  isUpload: boolean;
} => {
  if (typeof window === 'undefined') {
    return { tab: 'home', writeup: null, labSlug: null, isUpload: false };
  }

  const path = window.location.pathname.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  // 1. Upload CMS check
  if (path.includes('/upload') || rawHash === 'upload' || rawHash.startsWith('upload/') || search.get('portal') === 'upload') {
    return { tab: 'home', writeup: null, labSlug: null, isUpload: true };
  }

  // 2. Query parameter checks (?writeup=... or ?lab=... or ?tab=...)
  const qWriteup = search.get('writeup');
  if (qWriteup) {
    const found = writeupList.find(w => 
      w.id.toLowerCase() === qWriteup.toLowerCase() || 
      (w.slug && w.slug.toLowerCase() === qWriteup.toLowerCase())
    );
    if (found) {
      return { tab: 'writeups', writeup: found, labSlug: null, isUpload: false };
    }
  }

  const qLab = search.get('lab') || search.get('labs');
  if (qLab) {
    return { tab: 'labs', writeup: null, labSlug: qLab, isUpload: false };
  }

  if (search.get('tab') === 'about') return { tab: 'about', writeup: null, labSlug: null, isUpload: false };
  if (search.get('tab') === 'labs') return { tab: 'labs', writeup: null, labSlug: null, isUpload: false };
  if (search.get('tab') === 'writeups') return { tab: 'writeups', writeup: null, labSlug: null, isUpload: false };

  // 3. Hash-based routing check (#/writeup/id, #/lab/slug, #/about, #/writeups, #/labs)
  if (rawHash.startsWith('writeup/') || rawHash.startsWith('writeups/')) {
    const id = rawHash.replace(/^writeups?\//, '').trim();
    if (id) {
      const found = writeupList.find(w => 
        w.id.toLowerCase() === id.toLowerCase() || 
        (w.slug && w.slug.toLowerCase() === id.toLowerCase())
      );
      return { tab: 'writeups', writeup: found || null, labSlug: null, isUpload: false };
    }
    return { tab: 'writeups', writeup: null, labSlug: null, isUpload: false };
  }

  if (rawHash.startsWith('lab/') || rawHash.startsWith('labs/')) {
    const slug = rawHash.replace(/^labs?\//, '').trim();
    return { tab: 'labs', writeup: null, labSlug: slug || null, isUpload: false };
  }

  if (rawHash === 'about') return { tab: 'about', writeup: null, labSlug: null, isUpload: false };
  if (rawHash === 'labs' || rawHash === 'homelab') return { tab: 'labs', writeup: null, labSlug: null, isUpload: false };
  if (rawHash === 'writeups') return { tab: 'writeups', writeup: null, labSlug: null, isUpload: false };

  // 4. Pathname segment check (works with /writeup/:id or /portfolio/writeup/:id)
  const segments = path.split('/').filter(Boolean);

  const writeupIndex = segments.findIndex(s => s === 'writeup' || s === 'writeups');
  if (writeupIndex !== -1) {
    const id = segments[writeupIndex + 1];
    if (id) {
      const found = writeupList.find(w => 
        w.id.toLowerCase() === id.toLowerCase() || 
        (w.slug && w.slug.toLowerCase() === id.toLowerCase())
      );
      return { tab: 'writeups', writeup: found || null, labSlug: null, isUpload: false };
    }
    return { tab: 'writeups', writeup: null, labSlug: null, isUpload: false };
  }

  const labIndex = segments.findIndex(s => s === 'lab' || s === 'labs');
  if (labIndex !== -1) {
    const slug = segments[labIndex + 1];
    if (slug) {
      return { tab: 'labs', writeup: null, labSlug: slug, isUpload: false };
    }
    return { tab: 'labs', writeup: null, labSlug: null, isUpload: false };
  }

  if (segments.some(s => s === 'about')) {
    return { tab: 'about', writeup: null, labSlug: null, isUpload: false };
  }

  if (segments.some(s => s === 'homelab')) {
    return { tab: 'labs', writeup: null, labSlug: null, isUpload: false };
  }

  return { tab: 'home', writeup: null, labSlug: null, isUpload: false };
};

export default function App() {
  const [writeups, setWriteups] = useState<Writeup[]>(() => {
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

  // Initialize initial route from location
  const initialRoute = parseRouteFromLocation(writeups);

  const [isUploadPortal, setIsUploadPortal] = useState<boolean>(initialRoute.isUpload);
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialRoute.tab);
  const [selectedWriteup, setSelectedWriteup] = useState<Writeup | null>(initialRoute.writeup);
  const [selectedLabSlug, setSelectedLabSlug] = useState<string | null>(initialRoute.labSlug);

  // Modals
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Listen to browser navigation (back/forward & hash changes)
  const syncRouteFromBrowser = useCallback(() => {
    const route = parseRouteFromLocation(writeups);
    setIsUploadPortal(route.isUpload);
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

  // Persist writeups on change
  useEffect(() => {
    try {
      localStorage.setItem('blue_team_writeups', JSON.stringify(writeups));
    } catch (e) {
      console.warn('Failed to save writeups to localStorage', e);
    }
  }, [writeups]);

  // Update browser URL with base-path awareness
  const updateRoute = (path: string) => {
    try {
      const base = getBasePath();
      const fullPath = base ? `${base}${path}` : path;
      window.history.pushState(null, '', fullPath);
    } catch (e) {
      window.location.hash = path;
    }
  };

  // Routing actions
  const navigateToUpload = () => {
    updateRoute('/upload');
    setIsUploadPortal(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPublic = () => {
    updateRoute('/');
    setIsUploadPortal(false);
    setSelectedWriteup(null);
    setSelectedLabSlug(null);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CMS: Handle saving (create or update) writeup
  const handleSaveWriteup = (savedWriteup: Writeup) => {
    setWriteups((prev) => {
      const existsIndex = prev.findIndex((item) => item.id === savedWriteup.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedWriteup;
        return updated;
      }
      return [savedWriteup, ...prev];
    });
  };

  // CMS: Handle deleting writeup
  const handleDeleteWriteup = (id: string) => {
    setWriteups((prev) => prev.filter((item) => item.id !== id));
    if (selectedWriteup?.id === id) {
      setSelectedWriteup(null);
    }
  };

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
      {/* Top Fixed Header - Showcase Only */}
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
          /* View 2: /writeup Overview Blog Catalog Page (Showcase) */
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
