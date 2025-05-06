
import React from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'

export default function ParcelsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold text-btp-navy mb-4">Page en cours de développement</h1>
          <p className="max-w-md mx-auto text-btp-gray mb-8">
            Cette fonctionnalité sera disponible prochainement.
          </p>
          <Button variant="btpPrimary" asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
