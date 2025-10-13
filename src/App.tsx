import CardNav from './manual-components/navbar';
import logo from './assets/sportify-logo-light.svg';
import './App.css'
import './css/glass.css'
import ShinyText from './manual-components/paragraf';
import MagicBento from './manual-components/menu';
import ImageReveal from './components/lightswind/image-reveal';

import SpotlightCard from './manual-components/card-menu';

import { GlowingCards, GlowingCard } from "./components/lightswind/glowing-cards";
import { Zap, Sparkles, Crown } from "lucide-react";

// Font
import { FaUserFriends } from "react-icons/fa";
import { MdEmojiEvents, MdGroupAdd } from "react-icons/md";
import { TbMilitaryRankFilled } from "react-icons/tb";
import { FaPeopleGroup, FaLocationDot } from "react-icons/fa6";


function App() {


  // Function

  const items = [
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", href: "/about/company", ariaLabel: "About Company" },
        { label: "Careers", href: "/about/careers", ariaLabel: "About Careers" }
      ]
    },
    {
      label: "Projects",
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", href: "/projects/featured", ariaLabel: "Featured Projects" },
        { label: "Case Studies", href: "/projects/case-studies", ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Email", href: "mailto:info@example.com", ariaLabel: "Email us" },
        { label: "Twitter", href: "https://twitter.com/", ariaLabel: "Twitter" },
        { label: "LinkedIn", href: "https://linkedin.com/", ariaLabel: "LinkedIn" }
      ]
    }
  ];
  return (
    <div>
      {/* Header */}
      <div className='h-screen relative'>
        <CardNav
          logo={logo}
          logoAlt="Company Logo"
          items={items}
          baseColor="rgba(17, 25, 40, 0.39)"
          menuColor="#fff"
          buttonBgColor="rgba(255,255,255,0.1)"
          buttonTextColor="#fff"
          ease="power3.out"
          className="glassNav mt-4"
        />
        <div className="absolute w-full h-screen text-white">


          <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 lg:px-24">

            <div className="max-w-2xl">
              <div className="text-lg font-semibold mb-2">
                <ShinyText
                  text="Welcome To Sportify!"
                  disabled={false}
                  speed={3}
                  className='custom-class'
                />

              </div>

              <h1 className="text-start text-5xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-balance sm:w-[450px]">
                Built for players, powered by passion.
              </h1>
              <div className="mt-4 text-lg md:text-xl">
                <ShinyText
                  text="Your community. Your sport. Your vibe."
                  disabled={false}
                  speed={3}
                  className='custom-class'
                />
              </div>
            </div>

          </div>
        </div>

        <div className='px-4 py-4'>
          <div
            className="hero min-h-screen px rounded-2xl"
            style={{
              backgroundImage:
                "url(https://images.pexels.com/photos/6140711/pexels-photo-6140711.jpeg)",
            }}
          >
            <div className="hero-overlay rounded-2xl"></div>
            <div>

            </div>
          </div>
        </div>
      </div>

      {/* Header End */}

      {/* Menu */}
      <div className='items-center justify-center flex mt-10 mb-10'>
        <MagicBento
          textAutoHide={true}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={8}
          glowColor="150, 156, 172"
        />
      </div>
      {/* Menu End */}

      {/* Most Popular Sport */}
      <div className='mx-auto px-4'>
        <section className="overflow-hidden sm:grid sm:grid-cols-2">
          <div className="p-8 md:p-8 lg:px-16 lg:py-12">
            <div className="mx-auto max-w-xl text-center ltr:sm:text-left rtl:sm:text-right">
              <h1 className="text-2xl font-bold text-[#006989] md:text-6xl">
                The Hottest Sports of the New Generation
              </h1>

              <p className="hidden text-gray-500 md:mt-4 md:block">
                From fast-paced matches to social-driven activities, these are the sports capturing the hearts of Gen Z. Fueled by creativity, community, and digital culture, each sport reflects a lifestyle that blends fitness, fun, and self-expression. Discover what keeps this generation moving — both online and on the field.
              </p>

            </div>
          </div>

          <div>
            <ImageReveal />
          </div>

        </section>

      </div>
      {/* Most Popular Sport End */}

      {/* Profile, Kalo blm login gaada */}

      <section className="mt-10 group relative block bg-black w-[250px] sm:w-[400px] flex justify-center items-center mx-auto px-4 rounded-xl">
        <img
          alt=""
          src="https://i.pinimg.com/1200x/5c/2b/e1/5c2be1ef0a3e71298bc39308fd57a3aa.jpg"
          className="absolute inset-0 h-full w-full object-cover opacity-75 transition-opacity group-hover:opacity-50 rounded-xl"
        />

        <div className="relative p-4 sm:p-6 lg:p-8 rounded-xl">
          <p className="text-sm font-medium tracking-widest text-[#EAEBED] uppercase">Padel</p>

          <p className="text-xl font-bold text-[#EAEBED] sm:text-2xl">Jequeline Bensol</p>

          <div className="mt-32 sm:mt-48 lg:mt-64">
            <div
              className="translate-y-8 transform opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100"
            >
              <p className="text-sm text-white">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis perferendis hic asperiores
                quibusdam quidem voluptates doloremque reiciendis nostrum harum. Repudiandae?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stat */}
      <div className='mx-auto px-4 my-8 flex justify-center items-center'>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-[#006989]">
              <FaUserFriends />
            </div>
            <div className="stat-title text-[#1A1A1A]">Total Community</div>
            <div className="stat-value text-[#006989]">3</div>
            <div className="stat-desc text-[#4A4A4A]">total Community attended by the user</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-[#006989]">
              <MdEmojiEvents />
            </div>
            <div className="stat-title text-[#1A1A1A]">Total Events</div>
            <div className="stat-value text-[#006989]">10</div>
            <div className="stat-desc text-[#4A4A4A]">total events attended by the user</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-[#006989]">
              <TbMilitaryRankFilled />
            </div>
            <div className="stat-value text-[#006989]">11</div>
            <div className="stat-title text-[#1A1A1A]">Expert</div>
            <div className="stat-desc text-[#4A4A4A]">30 Level more to Master</div>
          </div>
        </div>
      </div>


      {/* Stat End */}


      {/* Promotion */}
      <section>
        <div className="mx-auto max-w-6xl grid lg:grid-cols-1 items-center gap-8 px-6 py-12 lg:py-16">
          {/* IMAGE SECTION */}
          <div className="relative order-1 lg:order-1">
            <img
              src="https://images.pexels.com/photos/34269399/pexels-photo-34269399.jpeg"
              alt="Sportify Community"
              className="h-56 w-[720px] object-cover sm:h-full flex justify-center mx-auto"
            />
          </div>

          {/* TEXT SECTION */}
          <div className="order-1 lg:order-2 text-center lg:text-center space-y-2 -mt-30 sm:-mt-70 z-10 bg-[#eaebed]/60 p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-[#006989] leading-tight">
              Here’s What You Can Do on Sportify.id
            </h2>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -mt-20 flex justify-center items-center sm:-mt-34 mx-auto px-4">

        {/* --- Card 1: Join Your Squad --- */}
        {/* --- Card 1: Find Your Crew --- */}
        <GlowingCards /* ...props */ >
          <GlowingCard /* ...props */ >
            <div className="mb-4">
              <FaPeopleGroup className='text-4xl' />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-2">
              Find Your Crew
            </h3>
            <p className="text-base opacity-90">
              No more solo runs. Link up with players who match your vibe and skill.
            </p>
          </GlowingCard>
        </GlowingCards>

        {/* --- Card 2: Discover Your Arena --- */}
        <GlowingCards /* ...props */ >
          <GlowingCard /* ...props */ >
            <div className="mb-4">
              <FaLocationDot className='text-4xl' />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-2">
              Find Arena
            </h3>
            <p className="text-base opacity-90">
              Unlock the best courts, fields, and hidden gems to play right around you.
            </p>
          </GlowingCard>
        </GlowingCards>

        {/* --- Card 3: Be the Captain --- */}
        <GlowingCards /* ...props */ >
          <GlowingCard /* ...props */ >
            <div className="mb-4">
              <MdGroupAdd className='text-4xl' />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-2">
              Be the Captain
            </h3>
            <p className="text-base opacity-90">
              Rally your friends, create an exclusive squad, and start ruling the game.
            </p>
          </GlowingCard>
        </GlowingCards>

        {/* --- Card 4: Join the Action --- */}
        <GlowingCards /* ...props */ >
          <GlowingCard /* ...props */ >
            <div className="mb-4">
              <MdEmojiEvents className='text-4xl' />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-2">
              Join the Action
            </h3>
            <p className="text-base opacity-90">
              From friendly matches to epic tourneys, find the next big event near you.
            </p>
          </GlowingCard>
        </GlowingCards>

      </div>


    </div>

  )
}

export default App

