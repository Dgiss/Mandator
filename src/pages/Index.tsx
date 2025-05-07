
import React from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'

export default function Index() {
  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-btp-navy mb-4">Bienvenue sur MandataireBTP</h1>
          <p className="max-w-2xl mx-auto text-btp-gray mb-8">
            Votre plateforme de gestion des marchés publics pour le secteur du BTP.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="btpPrimary" asChild>
              <Link to="/dashboard">Accéder au tableau de bord</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marches">Voir les marchés</Link>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
