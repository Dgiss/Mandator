
import React from 'react'
import { FileText, MessageSquare, Calculator, ClipboardEdit, FileBarChart, LockKeyhole, Layout, FileCheck } from 'lucide-react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

const features = [
  {
    id: 'documents',
    icon: <FileText className="h-6 w-6 text-btp-blue" />,
    title: 'Gestion documentaire',
    description: 'Organisez tous vos documents de marché avec versionnage et contrôle d\'accès. Workflow de validation en conformité avec le CCAG.',
    link: '/fonctionnalites/documents'
  },
  {
    id: 'situations',
    icon: <Calculator className="h-6 w-6 text-btp-blue" />,
    title: 'Situations de travaux',
    description: 'Créez et gérez vos situations de travaux avec calcul automatique des révisions, retenues et acomptes selon les clauses contractuelles.',
    link: '/fonctionnalites/situations'
  },
  {
    id: 'os',
    icon: <ClipboardEdit className="h-6 w-6 text-btp-blue" />,
    title: 'Ordres de service',
    description: 'Émettez et suivez vos ordres de service avec circuits de validation, notifications automatiques et traçabilité complète.',
    link: '/fonctionnalites/ordres-service'
  },
  {
    id: 'communication',
    icon: <MessageSquare className="h-6 w-6 text-btp-blue" />,
    title: 'Communication',
    description: 'Échangez de façon sécurisée avec tous les acteurs du projet dans un forum dédié avec historique complet et notifications.',
    link: '/fonctionnalites/communication'
  },
  {
    id: 'prix',
    icon: <FileBarChart className="h-6 w-6 text-btp-blue" />,
    title: 'Prix nouveaux',
    description: 'Gérez les prix nouveaux avec workflow de négociation, comparaison avec les prix du marché et intégration aux situations.',
    link: '/fonctionnalites/prix-nouveaux'
  },
  {
    id: 'tableaux',
    icon: <Layout className="h-6 w-6 text-btp-blue" />,
    title: 'Tableaux de bord',
    description: 'Visualisez l\'état d\'avancement de vos marchés avec des indicateurs clés et des rapports personnalisables par profil.',
    link: '/fonctionnalites/tableaux-bord'
  },
  {
    id: 'conformite',
    icon: <FileCheck className="h-6 w-6 text-btp-blue" />,
    title: 'Conformité réglementaire',
    description: 'Assurez-vous du respect des délais et procédures imposés par le CCAG Travaux 2021 grâce aux alertes et vérifications automatiques.',
    link: '/fonctionnalites/conformite'
  },
  {
    id: 'securite',
    icon: <LockKeyhole className="h-6 w-6 text-btp-blue" />,
    title: 'Sécurité avancée',
    description: 'Protégez vos données avec un système d\'authentification multi-facteurs, une traçabilité complète et des rôles précis.',
    link: '/fonctionnalites/securite'
  }
]

export default function Features() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Une solution complète pour la gestion des marchés publics</h2>
          <p className="text-lg text-btp-gray max-w-3xl mx-auto">
            Notre plateforme répond aux besoins spécifiques des acteurs des marchés publics de travaux, 
            en respectant le cadre réglementaire du CCAG Travaux 2021.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="card-feature">
              <div className="h-12 w-12 bg-btp-blue/10 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-btp-navy mb-2">{feature.title}</h3>
              <p className="text-btp-gray text-sm mb-4">{feature.description}</p>
              <Link to={feature.link} className="text-btp-blue text-sm font-medium hover:underline inline-flex items-center">
                En savoir plus
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="btpSecondary" size="lg" asChild>
            <Link to="/fonctionnalites">
              Explorer toutes les fonctionnalités
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
