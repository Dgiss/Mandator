
import React from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'

export default function StatsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto p-6 flex items-center justify-center py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-btp-navy mb-4">Page en cours de développement</h1>
          <p className="max-w-md mx-auto text-btp-gray mb-8">
            Cette fonctionnalité sera disponible prochainement.
          </p>
          <Button variant="btpPrimary" asChild>
            <Link to="/home">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
