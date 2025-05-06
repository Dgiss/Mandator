
import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white to-btp-lightgray">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-btp-blue/10 text-btp-blue rounded-full text-sm font-semibold">
              Conforme au CCAG Travaux 2021
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-btp-navy leading-tight">
              La plateforme de gestion des marchés publics de travaux
            </h1>
            <p className="text-lg text-btp-gray lg:pr-12">
              Simplifiez la gestion de vos marchés publics avec notre solution tout-en-un : documents, workflows, situations de travaux et ordres de service dans un seul espace sécurisé.
            </p>
            
            <ul className="space-y-3">
              {[
                'Gestion documentaire avec workflow de validation',
                'Situations de travaux avec calcul automatique',
                'Ordres de service et circuits d\'approbation',
                'Communication sécurisée entre acteurs'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-btp-blue flex-shrink-0" />
                  <span className="text-btp-gray">{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="btpPrimary" size="lg" asChild>
                <Link to="/essai-gratuit">
                  Essai gratuit de 14 jours
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="btpOutline" size="lg" asChild>
                <Link to="/demo">Demander une démo</Link>
              </Button>
            </div>
            
            <p className="text-sm text-btp-gray">
              Aucune carte de crédit requise. Annulez à tout moment.
            </p>
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-xl">
            <div className="aspect-[16/9] bg-gradient-to-tr from-btp-navy to-btp-blue rounded-xl overflow-hidden flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg w-5/6 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-btp-navy">Situation de Travaux #ST-2023-42</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">En cours de validation</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-btp-lightgray/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-btp-gray">Montant de la situation</span>
                      <span className="font-bold text-btp-navy">142 850,00 €</span>
                    </div>
                  </div>
                  <div className="bg-btp-lightgray/50 rounded-lg p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-btp-gray">Reste à mandater</span>
                      <span className="font-bold text-btp-navy">357 150,00 €</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-btp-blue/20 rounded-full"></div>
                      <div className="h-8 w-8 bg-btp-blue/20 rounded-full"></div>
                      <div className="h-8 w-8 bg-btp-blue/20 rounded-full"></div>
                    </div>
                    <button className="text-sm text-btp-blue">Voir les détails →</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 bg-btp-yellow h-12 w-12 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-btp-navy">
                <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path>
                <path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
