
import React from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16">
        <div className="container-custom text-center">
          <h1 className="text-6xl font-bold text-btp-navy mb-4">404</h1>
          <h2 className="text-2xl font-medium text-btp-gray mb-6">Page non trouvée</h2>
          <p className="max-w-md mx-auto text-btp-gray mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
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
