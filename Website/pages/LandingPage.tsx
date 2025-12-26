import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import LogoTicker from '../components/LogoTicker';
import AppShowcase from '../components/AppShowcase';
import Stats from '../components/Stats';
import FeatureSpotlight from '../components/FeatureSpotlight';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans selection:bg-blue-500/30">
            <Navbar />
            <main className="flex-grow">
                <Hero />
                <LogoTicker />
                <AppShowcase />
                <Stats />
                <FeatureSpotlight />
                <Features />
                <HowItWorks />
                <Testimonials />
                <Pricing />
                <FAQ />
                <CallToAction />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
