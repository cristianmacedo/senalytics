import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Início', icon: '🏠' },
  { path: '/statistics', label: 'Estatísticas', icon: '📊' },
  { path: '/simulator', label: 'Simulador', icon: '🎲' },
  { path: '/history', label: 'Histórico', icon: '📜' },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-gradient-to-r from-caixa-blue to-caixa-blue-dark text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Senalytics" className="w-10 h-10" />
              <span className="text-xl font-bold hidden sm:block">Senalytics</span>
            </Link>
            
            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="hidden md:block">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              Dados fornecidos pela API oficial da Caixa Econômica Federal
            </p>
            <p className="text-sm">
              Este site não tem afiliação com a Caixa ou Loterias
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
