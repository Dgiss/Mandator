
import React from 'react'

export default function FeaturedIn() {
  const logos = [
    { name: "Le Moniteur", className: "h-5 md:h-6" },
    { name: "Association des Maires de France", className: "h-5 md:h-7" },
    { name: "Gazette des Communes", className: "h-5 md:h-6" },
    { name: "FNTP", className: "h-5 md:h-6" },
    { name: "CAPEB", className: "h-5 md:h-6" }
  ];

  return (
    <section className="py-12 bg-btp-lightgray">
      <div className="container-custom">
        <p className="text-center text-btp-gray text-sm uppercase font-semibold tracking-wider mb-8">
          Ils parlent de nous
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {logos.map((logo, idx) => (
            <div key={idx} className="text-btp-gray font-bold text-xl">{logo.name}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
