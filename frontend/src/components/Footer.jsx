/**
 * Footer Component
 */

import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-dark-900 text-dark-300 mt-auto">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Shop<span className="text-primary-400">Verse</span>
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed">
              Your premium destination for quality products delivered fast.
            </p>
            <div className="flex gap-3 mt-4">
              {[FiGithub, FiTwitter, FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { heading: 'Shop',    links: [['Products', '/products'], ['Cart', '/cart'], ['Checkout', '/checkout']] },
            { heading: 'Account', links: [['Login', '/login'], ['Register', '/register'], ['My Orders', '/orders'], ['Profile', '/profile']] },
            { heading: 'Info',    links: [['About', '#'], ['Shipping Policy', '#'], ['Returns', '#'], ['Contact', '#']] },
          ].map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="font-display font-semibold text-white text-sm mb-3 uppercase tracking-wider">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-dark-400 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-dark-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-dark-500">© {year} ShopVerse. All rights reserved.</p>
          <p className="text-xs text-dark-500">Built with the MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
