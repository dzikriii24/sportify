import CardNav from './manual-components/navbar';
import logo from './assets/sportify-logo-light.svg';
import './App.css'
import './css/glass.css'
import ShinyText from './manual-components/paragraf';
import MagicBento from './manual-components/menu';
import ImageReveal from './components/lightswind/image-reveal';


import { GlowingCards, GlowingCard } from "./components/lightswind/glowing-cards";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/lightswind/accordion';

// Font
import { FaUserFriends } from "react-icons/fa";
import { MdEmojiEvents, MdGroupAdd } from "react-icons/md";
import { TbMilitaryRankFilled } from "react-icons/tb";
import { FaPeopleGroup, FaLocationDot } from "react-icons/fa6";


function Dashboard() {


  // Function

  const items = [
    {
      label: "Communities",
      bgColor: "#006989",
      textColor: "#ffffff",
      links: [
        { label: "Padel", href: "/dashboard-community", ariaLabel: "Padel Community" },
        { label: "Running", href: "/community/running", ariaLabel: "Running Community" },
        { label: "Soccer", href: "/community/soccer", ariaLabel: "Soccer Community" },
        { label: "Hiking", href: "/community/hiking", ariaLabel: "Hiking Community" }
      ]
    },
    {
      label: "Events",
      bgColor: "#005b78",
      textColor: "#ffffff",
      links: [
        { label: "Upcoming Events", href: "/events/upcoming", ariaLabel: "Upcoming Events" },
        { label: "Tournaments", href: "/events/tournaments", ariaLabel: "Tournaments" },
        { label: "Community Meetups", href: "/events/meetups", ariaLabel: "Community Meetups" },
        { label: "Add Event", href: "/events/add", ariaLabel: "Add New Event" }
      ]
    },
    {
      label: "Places",
      bgColor: "#004d5a",
      textColor: "#ffffff",
      links: [
        { label: "Nearby Sports Venues", href: "/places", ariaLabel: "Nearby Sports Venues" },
        { label: "Find by Community", href: "/places/community", ariaLabel: "Find Places by Community" },
        { label: "Map View", href: "/places/map", ariaLabel: "Sports Map" }
      ]
    },
    {
      label: "About",
      bgColor: "#003f47",
      textColor: "#ffffff",
      links: [
        { label: "About Sportify.id", href: "/about", ariaLabel: "About Sportify.id" },
        { label: "Our Mission", href: "/about/mission", ariaLabel: "Our Mission" },
        { label: "Blog", href: "/blog", ariaLabel: "Sportify Blog" },
        { label: "Contact", href: "/contact", ariaLabel: "Contact Us" }
      ]
    },
    {
      label: "Join Us",
      bgColor: "#002f35",
      textColor: "#ffffff",
      links: [
        { label: "Sign In", href: "/login", ariaLabel: "Sign In" },
        { label: "Register", href: "/register", ariaLabel: "Register" },
        { label: "Become a Community Leader", href: "/register/leader", ariaLabel: "Community Leader Registration" }
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

      {/* Promotion End */}



      {/* FAQ */}
      <h1 className="text-2xl font-bold text-[#006989] md:text-4xl px-8 mb-4 mt-10">
        Frequently Asked Questions
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <Accordion type="single" collapsible className="w-full px-8">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is Sportify.id?</AccordionTrigger>
            <AccordionContent>
              Sportify.id is a community hub where sports lovers and adventurers connect, share, and grow together. From esports to hiking — we got your squad covered.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>How can I join a community?</AccordionTrigger>
            <AccordionContent>
              Simply sign up, pick your favorite sport or activity, and join a community that fits your vibe. It’s that easy — no limits, no pressure.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Is Sportify.id free to use?</AccordionTrigger>
            <AccordionContent>
              Yes! Joining and exploring communities is totally free. Some events or premium features might come later, but the core experience stays open for everyone.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Can I create my own community?</AccordionTrigger>
            <AccordionContent>
              Absolutely. Sportify.id empowers users to start their own clubs or teams — whether you’re a solo hiker or an esports coach, this is your playground.
            </AccordionContent>
          </AccordionItem>


        </Accordion>

        <Accordion type="single" collapsible className="w-full px-8">
          <AccordionItem value="item-5">
            <AccordionTrigger>What makes Sportify.id different?</AccordionTrigger>
            <AccordionContent>
              We blend the energy of Gen Z communities with the love for sports and adventure. It’s not just about playing — it’s about belonging, vibing, and growing together.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>Can I join multiple communities?</AccordionTrigger>
            <AccordionContent>
              Of course! You can be part of as many communities as you want — one for hiking weekends, another for gaming nights. Balance your grind and chill. 💪🎮
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>Is there a mobile version of Sportify.id?</AccordionTrigger>
            <AccordionContent>
              Yep, the site’s fully responsive — works smooth on phones, tablets, and desktops. Mobile app’s coming soon, so stay tuned 👀📱
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>How do I stay updated with events?</AccordionTrigger>
            <AccordionContent>
              Each community posts their latest news, meetups, and tournaments right on their page. You can also turn on notifications to never miss a moment. 🔔
            </AccordionContent>
          </AccordionItem>
        </Accordion>

      </div>

      {/* FAQ END */}

      {/* CTAS */}
      <section className="bg-[#eaebed] text-[#006989] py-20 px-6 text-center rounded-3xl max-w-5xl mx-auto mt-16">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Join the Movement with <span className="font-bold">Sportify.id</span>
        </h2>
        <p className="text-lg md:text-xl text-[#006989]/80 mb-8 max-w-2xl mx-auto">
          Connect with athletes, explore new communities, and push your limits.
          Your next adventure starts here.
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-[#006989] text-[#eaebed] font-semibold px-8 py-3 rounded-full hover:bg-[#005089] transition duration-300">
            Get Started
          </button>
          <button className="border-2 border-[#006989] text-[#006989] px-8 py-3 rounded-full hover:bg-white/10 transition duration-300">
            Learn More
          </button>
        </div>
      </section>
      {/* CTAS END */}

      {/* FOOTER */}
      <footer className="">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex justify-center text-teal-600">
            <img src="./src/assets/sportify-logo-dark.svg" className='h-20' alt="" />
          </div>

          <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-[#006989]">
            Empowering athletes and communities to move, connect, and grow together.
            Discover your passion with <span className="font-semibold">Sportify.id</span>.
          </p>

          <ul className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
            <li>
              <a className="text-[#006989] font-medium transition hover:text-[#004d5a]" href="#"> About Us </a>
            </li>

            <li>
              <a className="text-[#006989] font-medium transition hover:text-[#004d5a]" href="#"> Communities </a>
            </li>

            <li>
              <a className="text-[#006989] font-medium transition hover:text-[#004d5a]" href="#"> Events </a>
            </li>

            <li>
              <a className="text-[#006989] font-medium transition hover:text-[#004d5a]" href="#"> Join Us </a>
            </li>

            <li>
              <a className="text-[#006989] font-medium transition hover:text-[#004d5a]" href="#"> Blog </a>
            </li>

            <li>
              <a className="text-[#006989] font-medium transition hover:text-[#004d5a]" href="#"> Contact </a>
            </li>
          </ul>

          <ul className="mt-12 flex justify-center gap-6 md:gap-8">
            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-[#006989] transition hover:text-[#004d5a]"
              >
                <span className="sr-only">Facebook</span>
                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-[#006989] transition hover:text-[#004d5a]"
              >
                <span className="sr-only">Instagram</span>
                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-[#006989] transition hover:text-[#004d5a]"
              >
                <span className="sr-only">Twitter</span>
                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                  />
                </svg>
              </a>
            </li>

            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="text-[#006989] transition hover:text-[#004d5a]"
              >
                <span className="sr-only">GitHub</span>
                <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </div>
        <p className="mt-6 text-center text-sm text-[#006989]/70 mb-2">
          © {new Date().getFullYear()} <span className="font-semibold text-[#006989]">Sportify.id</span>. All rights reserved.
        </p>
      </footer>

      {/* FOOTER END */}
    </div>

  )
}

export default Dashboard

