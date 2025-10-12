import CardNav from './manual-components/navbar';
import logo from './assets/react.svg';
import './App.css'
import './css/glass.css'
import ShinyText from './manual-components/paragraf';
import MagicBento from './manual-components/menu';

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
              <p className="text-lg font-semibold mb-2">
                <ShinyText
                  text="Welcome To Sportify!"
                  disabled={false}
                  speed={3}
                  className='custom-class'
                />

              </p>

              <h1 className="text-start text-5xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-balance w-[450px]">
                Built for players, powered by passion.
              </h1>
              <p className="mt-4 text-lg md:text-xl">
                <ShinyText
                  text="Your community. Your sport. Your vibe."
                  disabled={false}
                  speed={3}
                  className='custom-class'
                />
              </p>
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

    </div>

  )
}

export default App

