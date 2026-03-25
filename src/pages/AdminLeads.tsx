import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  RefreshCw, 
  Mail, 
  Phone, 
  Clock, 
  Globe, 
  Download,
  Users,
  Gift,
  DoorOpen,
  FileText,
  Smartphone,
  Search
} from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  phone: string;
  name: string;
  source: string;
  sourceLabel: string;
  page: string;
  timestamp: string;
  status: string;
}

const sourceIcons: Record<string, typeof Gift> = {
  welcome_popup: Gift,
  exit_intent: DoorOpen,
  footer_newsletter: Mail,
  blog_lead_magnet: FileText,
  sticky_cta: Smartphone,
};

const sourceColors: Record<string, string> = {
  welcome_popup: 'bg-green-100 text-green-700',
  exit_intent: 'bg-orange-100 text-orange-700',
  footer_newsletter: 'bg-blue-100 text-blue-700',
  blog_lead_magnet: 'bg-purple-100 text-purple-700',
  sticky_cta: 'bg-pink-100 text-pink-700',
};

export default function AdminLeads() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  async function fetchLeads(pwd: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/lead?password=${encodeURIComponent(pwd)}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads || []);
        setAuthenticated(true);
        sessionStorage.setItem('leads-pwd', pwd);
      } else {
        setError('Fel lösenord');
        setAuthenticated(false);
      }
    } catch {
      setError('Kunde inte hämta leads');
    }
    setLoading(false);
  }

  useEffect(() => {
    const savedPwd = sessionStorage.getItem('leads-pwd');
    if (savedPwd) {
      fetchLeads(savedPwd);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchLeads(password);
  }

  function handleRefresh() {
    const pwd = sessionStorage.getItem('leads-pwd') || password;
    fetchLeads(pwd);
  }

  function exportCSV() {
    const headers = ['Datum', 'Källa', 'E-post', 'Telefon', 'Sida'];
    const rows = filteredLeads.map(l => [
      new Date(l.timestamp).toLocaleString('sv-SE'),
      l.sourceLabel || l.source,
      l.email,
      l.phone,
      l.page,
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stodona-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredLeads = leads.filter(l => {
    const matchesFilter = filter === 'all' || l.source === filter;
    const matchesSearch = !searchQuery || 
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const sourceCounts = leads.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <Helmet>
        <title>Admin Leads | Stodona</title>
      </Helmet>
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-bg-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-cta-hover" />
            </div>
            <h1 className="text-xl font-bold">Leads Admin</h1>
            <p className="text-sm text-text-secondary">Logga in för att se leads</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Lösenord"
              required
              className="w-full px-4 py-3 rounded-xl border border-text-primary/10 bg-bg-primary focus:outline-none focus:ring-2 focus:ring-cta-hover/50"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-bg-dark text-text-light font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-dark text-text-light">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leads Dashboard</h1>
            <p className="text-sm text-text-light/60">{leads.length} leads totalt</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Uppdatera"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-cta-hover text-text-primary font-medium rounded-lg text-sm hover:brightness-110 transition-all"
            >
              <Download className="w-4 h-4" />
              Exportera CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { key: 'all', label: 'Alla', icon: Users, count: leads.length },
            { key: 'welcome_popup', label: 'Välkomst', icon: Gift, count: sourceCounts.welcome_popup || 0 },
            { key: 'exit_intent', label: 'Exit-intent', icon: DoorOpen, count: sourceCounts.exit_intent || 0 },
            { key: 'footer_newsletter', label: 'Newsletter', icon: Mail, count: sourceCounts.footer_newsletter || 0 },
            { key: 'blog_lead_magnet', label: 'Checklista', icon: FileText, count: sourceCounts.blog_lead_magnet || 0 },
          ].map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-xl border transition-all text-left ${
                filter === key 
                  ? 'bg-white border-cta-hover shadow-md' 
                  : 'bg-white border-text-primary/5 hover:border-text-primary/20'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${filter === key ? 'text-cta-hover' : 'text-text-secondary'}`} />
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-text-secondary">{label}</div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sök e-post, telefon eller namn..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-text-primary/10 bg-white focus:outline-none focus:ring-2 focus:ring-cta-hover/50 text-sm"
            />
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-text-primary/5 overflow-hidden shadow-sm">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">Inga leads ännu</p>
              <p className="text-sm">Leads dyker upp här automatiskt när besökare fyller i formulären.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-primary border-b border-text-primary/5">
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Datum</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Källa</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">E-post</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Telefon</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-secondary uppercase tracking-wider">Sida</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, i) => {
                    const SourceIcon = sourceIcons[lead.source] || Globe;
                    const colorClass = sourceColors[lead.source] || 'bg-gray-100 text-gray-700';
                    return (
                      <tr
                        key={lead.id || i}
                        className="border-b border-text-primary/5 last:border-none hover:bg-bg-primary/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-text-secondary" />
                            <span>{new Date(lead.timestamp).toLocaleDateString('sv-SE')}</span>
                          </div>
                          <span className="text-xs text-text-secondary pl-5.5">
                            {new Date(lead.timestamp).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                            <SourceIcon className="w-3 h-3" />
                            {lead.sourceLabel || lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="text-sm text-cta-hover hover:underline flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5" />
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-text-secondary text-sm">–</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} className="text-sm text-text-primary hover:text-cta-hover flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-text-secondary text-sm">–</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-text-secondary flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            {lead.page || '/'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
