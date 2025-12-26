import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutDashboard } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsOpen(false);
    }
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between mx-auto py-4 px-4">
          <a href="#" onClick={(e) => scrollToSection(e, '#root')} className="flex items-center space-x-2 rtl:space-x-reverse group">
            <div className="w-9 h-9 bg-gradient-to-tr from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-300">
              G
            </div>
            <span className="self-center text-xl font-bold whitespace-nowrap text-zinc-900 dark:text-white tracking-tight">
              Gradeo
            </span>
          </a>

          <div className="flex md:order-2 space-x-3 md:space-x-4 items-center">
            <ThemeToggle />
            <Link
              to="/teacher"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:text-black dark:bg-white dark:hover:bg-zinc-200 transition-all duration-300 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02]"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-zinc-500 rounded-xl md:hidden hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700"
              aria-controls="navbar-sticky"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div
            className={`${isOpen ? 'block' : 'hidden'
              } items-center justify-between w-full md:flex md:w-auto md:order-1`}
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium md:space-x-2 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-white md:bg-transparent dark:bg-zinc-900 md:dark:bg-transparent border border-zinc-100 md:border-none rounded-2xl dark:border-zinc-800">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="relative px-4 py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors duration-300 group"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <span className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800/60 rounded-full scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 ease-out -z-0"></span>
                  </a>
                </li>
              ))}
              <li className="md:hidden mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  to="/teacher"
                  className="flex items-center gap-2 py-2 px-4 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Access Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;