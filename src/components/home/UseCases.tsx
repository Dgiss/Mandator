
import React from 'react'
import { Button } from '../ui/button'
import { Building2, BarChart3, LucideGanttChart, FileCheck, Mail, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const useCases = [
  {
    id: 'collectivites',
    icon: <Building2 className="h-8 w-8" />,
    title: 'Pour les collectivités',
    description: 'Simplifiez le suivi administratif et financier de vos marchés de travaux.',
    benefits: [
      'Gestion des délais réglementaires',
      'Suivi budgétaire et financier',
      'Archivage légal et sécurisé',
      'Contrôle des paiements'
    ],
    linkText: 'Solutions pour collectivités',
    linkUrl: '/secteurs/collectivites'
  },
  {
    id: 'etat',
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Services de l\'État',
    description: 'Optimisez le pilotage et la conformité de vos projets d\'infrastructures.',
    benefits: [
      'Tableaux de bord centralisés',
      'Traçabilité des décisions',
      'Gestion des avenants',
      'Reporting personnalisé'
    ],
    linkText: 'Solutions pour l\'État',
    linkUrl: '/secteurs/etat-administration'
  },
  {
    id: 'entreprises',
    icon: <LucideGanttChart className="h-8 w-8" />,
    title: 'Entreprises BTP',
    description: 'Maîtrisez vos situations de travaux et vos démarches administratives.',
    benefits: [
      'Suivi des paiements',
      'Gestion des sous-traitants',
      'Facturation simplifiée',
      'Réponse aux OS optimisée'
    ],
    linkText: 'Solutions pour entreprises',
    linkUrl: '/secteurs/entreprises-btp'
  }
];

export default function UseCases() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-btp-lightgray to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Solutions adaptées à tous les acteurs du secteur</h2>
          <p className="text-lg text-btp-gray max-w-3xl mx-auto">
            Notre plateforme s'ajuste à vos besoins spécifiques, que vous soyez une collectivité, 
            un service de l'État ou une entreprise du secteur BTP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <div key={useCase.id} className="card-feature flex flex-col h-full">
              <div className="bg-btp-blue/10 text-btp-blue p-4 rounded-full inline-block mb-4">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-semibold text-btp-navy mb-3">{useCase.title}</h3>
              <p className="text-btp-gray mb-4">{useCase.description}</p>
              
              <ul className="space-y-2 mb-6 flex-1">
                {useCase.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-btp-blue flex-shrink-0" />
                    <span className="text-sm text-btp-gray">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="btpOutline" className="mt-auto" asChild>
                <Link to={useCase.linkUrl}>
                  {useCase.linkText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-btp-navy to-btp-blue rounded-xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Architecture technique avancée</h3>
              <p className="mb-6">
                Notre solution utilise la puissance d'AWS Amplify pour vous offrir une plateforme robuste,
                sécurisée et évolutive qui répond aux exigences les plus strictes des marchés publics.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-btp-yellow" />
                  <div>
                    <p className="font-semibold">AWS Cognito</p>
                    <p className="text-sm text-gray-200">Authentication sécurisée</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <FileCheck className="h-5 w-5 text-btp-yellow" />
                  <div>
                    <p className="font-semibold">AWS Lambda</p>
                    <p className="text-sm text-gray-200">Traitement à la demande</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 text-btp-yellow" />
                  <div>
                    <p className="font-semibold">EventBridge</p>
                    <p className="text-sm text-gray-200">Notifications en temps réel</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <LucideGanttChart className="h-5 w-5 text-btp-yellow" />
                  <div>
                    <p className="font-semibold">Step Functions</p>
                    <p className="text-sm text-gray-200">Workflows d'approbation</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="bg-white/5 backdrop-blur-sm rounded h-full flex items-center justify-center">
                  <div className="space-y-4 text-center">
                    <div className="h-16 w-16 bg-btp-blue/20 rounded-full mx-auto flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                      </svg>
                    </div>
                    <p className="font-medium">Architecture Cloud</p>
                    <p className="text-sm opacity-80">Basée sur AWS Amplify</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 bg-btp-yellow h-16 w-16 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-btp-navy">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
