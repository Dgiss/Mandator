import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  const navItems = [{
    id: 'fonctionnalites',
    label: 'Fonctionnalités',
    hasDropdown: true,
    dropdownItems: [{
      label: 'Gestion documentaire',
      href: '/fonctionnalites/documents'
    }, {
      label: 'Situations de travaux',
      href: '/fonctionnalites/situations'
    }, {
      label: 'Ordres de service',
      href: '/fonctionnalites/ordres-service'
    }, {
      label: 'Prix nouveaux',
      href: '/fonctionnalites/prix-nouveaux'
    }, {
      label: 'Communication',
      href: '/fonctionnalites/communication'
    }]
  }, {
    id: 'secteurs',
    label: 'Secteurs',
    hasDropdown: true,
    dropdownItems: [{
      label: 'Collectivités',
      href: '/secteurs/collectivites'
    }, {
      label: 'État & administration',
      href: '/secteurs/etat-administration'
    }, {
      label: 'Entreprises BTP',
      href: '/secteurs/entreprises-btp'
    }]
  }, {
    id: 'tarification',
    label: 'Tarification',
    href: '/tarification'
  }, {
    id: 'blog',
    label: 'Ressources',
    href: '/ressources'
  }];
  return <nav className="bg-white shadow-nav sticky top-0 z-50">
      <div className="container-custom">
        

        {/* Mobile Menu */}
        {isOpen && <div className="md:hidden pt-2 pb-4 animate-fade-in">
            <ul className="space-y-1">
              {navItems.map(item => <li key={item.id}>
                  {item.hasDropdown ? <div>
                      <button onClick={() => toggleDropdown(item.id)} className="w-full text-left px-3 py-2 rounded-md text-btp-gray hover:text-btp-blue flex items-center justify-between">
                        {item.label}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      {activeDropdown === item.id && <ul className="pl-6 space-y-1 mt-1">
                          {item.dropdownItems?.map((dropdownItem, idx) => <li key={idx}>
                              <Link to={dropdownItem.href || '#'} className="block px-3 py-2 text-sm text-btp-gray hover:bg-btp-lightgray hover:text-btp-blue rounded-md">
                                {dropdownItem.label}
                              </Link>
                            </li>)}
                        </ul>}
                    </div> : <Link to={item.href || '#'} className="block px-3 py-2 rounded-md text-btp-gray hover:text-btp-blue">
                      {item.label}
                    </Link>}
                </li>)}
            </ul>
            <div className="mt-4 space-y-2 px-3">
              <Button variant="btpSecondary" className="w-full" asChild>
                <Link to="/connexion">Se connecter</Link>
              </Button>
              <Button variant="btpPrimary" className="w-full" asChild>
                <Link to="/essai-gratuit">Essai gratuit</Link>
              </Button>
            </div>
          </div>}
      </div>
    </nav>;
}