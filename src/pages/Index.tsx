
import React from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import UseCases from '../components/home/UseCases'
import Testimonials from '../components/home/Testimonials'
import CallToAction from '../components/home/CallToAction'
import FeaturedIn from '../components/home/FeaturedIn'

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <FeaturedIn />
        <Features />
        <UseCases />
        <Testimonials />
        <CallToAction />
      </main>
      
      <Footer />
    </div>
  )
}
