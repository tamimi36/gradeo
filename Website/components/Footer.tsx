import React from 'react';
import { Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center space-x-2 mb-4">
               <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-lg">
                  G
               </div>
               <span className="text-xl font-bold text-zinc-900 dark:text-white">Gradeo</span>
            </a>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Empowering educators with AI-driven grading and analytics tools.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-blue-500 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-zinc-400 hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-zinc-400 hover:text-blue-700 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Web Dashboard</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Answer Sheets</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Press Kit</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} Gradeo Inc. All rights reserved.
          </p>
          <div className="flex items-center space-x-2 text-sm text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;