
import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CallToAction() {
  return (
    <section className="py-16 md:py-20 bg-btp-navy text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Simplifiez la gestion des marchés publics de travaux dès aujourd'hui
            </h2>
            <p className="text-lg text-gray-300">
              Notre plateforme est conçue pour répondre aux besoins spécifiques des acteurs 
              des marchés publics dans le secteur du BTP, avec un respect strict du cadre 
              réglementaire et une expérience utilisateur optimisée.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-btp-yellow flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">Déploiement rapide en moins de 72h</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-btp-yellow flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">Support technique dédié</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-btp-yellow flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">Formation incluse</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-5 w-5 text-btp-yellow flex-shrink-0 mt-0.5" />
                <p className="text-gray-300">Mises à jour réglementaires</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="btpPrimary" size="lg" className="bg-btp-yellow hover:bg-btp-yellow/90 text-btp-navy" asChild>
                <Link to="/essai-gratuit">
                  Commencer l'essai gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10" asChild>
                <Link to="/tarification">Voir les tarifs</Link>
              </Button>
            </div>
          </div>
          
          <div className="rounded-xl overflow-hidden bg-white/5 p-6">
            <div className="bg-gradient-to-br from-white/10 to-transparent rounded-lg p-6 h-full">
              <h3 className="text-xl font-semibold mb-6">Offres adaptées à vos besoins</h3>
              
              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">Essentiel</h4>
                      <p className="text-gray-300 text-sm">Pour les petites collectivités</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">199€<span className="text-sm font-normal">/mois</span></p>
                      <p className="text-sm text-gray-300">Par entité juridique</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-btp-blue" />
                      Jusqu'à 10 marchés actifs
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-btp-blue" />
                      5 utilisateurs inclus
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-btp-blue" />
                      10 Go de stockage
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-lg p-5 relative">
                  <div className="absolute -top-3 right-5 bg-btp-yellow text-btp-navy px-3 py-1 text-xs font-semibold rounded-full">
                    Recommandé
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">Professionnel</h4>
                      <p className="text-gray-300 text-sm">Pour les collectivités moyennes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">399€<span className="text-sm font-normal">/mois</span></p>
                      <p className="text-sm text-gray-300">Par entité juridique</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-btp-blue" />
                      Jusqu'à 50 marchés actifs
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-btp-blue" />
                      25 utilisateurs inclus
                    </li>
                    <li className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-btp-blue" />
                      50 Go de stockage
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Link to="/tarification" className="text-btp-blue hover:text-btp-blue/80 flex items-center justify-center text-sm">
                  Voir tous les forfaits et options
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
