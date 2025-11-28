import React from 'react'
import Banner from '../components/home/Banner'
import Hero from '../components/home/Hero'
import Features from '../components/home/Features'
import Testimonials from '../components/home/Testimonials'
import CalltoAction from '../components/home/CalltoAction'
import Footer from '../components/home/Footer'


const Home = () => {
  return (
    <div>
      <Banner/>
      <Hero/>
      <Features/>
      <Testimonials/>
      <CalltoAction/>
      <Footer/>
    </div>
  )
}

export default Home