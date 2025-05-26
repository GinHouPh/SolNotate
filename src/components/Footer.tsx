import { Github } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <p>© {year} SolNotate. Inspired by sol2snd.com</p>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <a 
              href="#" 
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
              rel="noopener noreferrer"
            >
              About
            </a>
            <a 
              href="#" 
              className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
              rel="noopener noreferrer"
            >
              Help
            </a>
            <a 
              href="#" 
              className="flex items-center hover:text-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4 mr-1" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;