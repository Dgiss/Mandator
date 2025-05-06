
import React from 'react'
import { Button } from '../ui/button'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    quote: "MarchésPublicsBTP a considérablement simplifié notre suivi des situations de travaux. Les calculs automatiques nous font gagner un temps précieux et réduisent considérablement les erreurs.",
    author: "Marie Dupont",
    position: "Directrice des Services Techniques",
    organization: "Commune de Saint-Martin",
    rating: 5
  },
  {
    id: 2,
    quote: "La traçabilité des échanges et la gestion des ordres de service nous apportent une sécurité juridique inestimable. Un outil indispensable pour les collectivités.",
    author: "Thomas Lambert",
    position: "Responsable des Marchés Publics",
    organization: "Communauté d'Agglomération du Centre",
    rating: 5
  },
  {
    id: 3,
    quote: "En tant qu'entreprise de BTP, nous apprécions particulièrement la simplicité d'élaboration des situations de travaux et le suivi des paiements. La conformité au CCAG 2021 est un vrai plus.",
    author: "Jean Moreau",
    position: "Directeur Financier",
    organization: "Constructions Modernes SARL",
    rating: 4
  }
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Ils nous font confiance</h2>
          <p className="text-lg text-btp-gray max-w-3xl mx-auto">
            Découvrez comment notre solution aide les acteurs publics et les entreprises 
            du BTP à optimiser la gestion de leurs marchés publics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card-feature relative">
              <Quote className="h-8 w-8 text-btp-blue/20 absolute top-4 right-4" />
              <div className="flex items-center mb-4">
                {Array(5).fill(0).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className={`h-4 w-4 ${idx < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-btp-gray mb-6 italic">"{testimonial.quote}"</p>
              <div className="mt-auto pt-4 border-t border-gray-100">
                <p className="font-semibold text-btp-navy">{testimonial.author}</p>
                <p className="text-sm text-btp-gray">{testimonial.position}</p>
                <p className="text-sm text-btp-gray">{testimonial.organization}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-btp-lightgray rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-btp-navy mb-4">
                Prêt à simplifier la gestion de vos marchés publics ?
              </h3>
              <p className="text-btp-gray mb-8">
                Rejoignez plus de 200 collectivités et entreprises qui font déjà confiance à 
                notre solution. Demandez une démo personnalisée pour découvrir comment notre 
                plateforme peut s'adapter à vos besoins spécifiques.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="btpPrimary" asChild>
                  <a href="/demo">Demander une démo</a>
                </Button>
                <Button variant="btpOutline" asChild>
                  <a href="/essai-gratuit">Essai gratuit de 14 jours</a>
                </Button>
              </div>
            </div>
            <div className="bg-btp-blue/10 p-8 md:p-12 flex items-center justify-center">
              <div className="space-y-6 max-w-sm">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-btp-blue rounded-full flex items-center justify-center text-white font-bold">
                    82%
                  </div>
                  <div>
                    <p className="font-semibold text-btp-navy">Gain de temps administratif</p>
                    <p className="text-sm text-btp-gray">Sur le traitement des situations de travaux</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-btp-blue rounded-full flex items-center justify-center text-white font-bold">
                    93%
                  </div>
                  <div>
                    <p className="font-semibold text-btp-navy">Taux de satisfaction</p>
                    <p className="text-sm text-btp-gray">De nos utilisateurs après 6 mois d'utilisation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-btp-blue rounded-full flex items-center justify-center text-white font-bold">
                    7j
                  </div>
                  <div>
                    <p className="font-semibold text-btp-navy">Réduction des délais de paiement</p>
                    <p className="text-sm text-btp-gray">Grâce à l'automatisation des processus</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
