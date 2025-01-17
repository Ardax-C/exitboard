import Link from 'next/link'

const features = [
  {
    name: 'Verified Opportunities',
    description: 'Every listing is thoroughly vetted to ensure legitimacy and maintain the highest professional standards.',
  },
  {
    name: 'Industry Focus',
    description: 'Specialized in connecting top talent with forward-thinking companies shaping the future.',
  },
  {
    name: 'Professional Network',
    description: 'Build connections with industry leaders and companies that value excellence and innovation.',
  },
]

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 pointer-events-none transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#1a237e] to-[#311b92] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero section */}
      <div className="px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-violet-200">
              The Future of Professional Careers
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Connect with industry-leading companies and discover opportunities that align with your professional aspirations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/jobs"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
              >
                Browse Opportunities
              </Link>
              <Link
                href="/post"
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-white"
              >
                Post a Job <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">Why Choose ExitBoard</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Built for Professional Excellence
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-white">
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 pointer-events-none transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#1a237e] to-[#311b92] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  )
} 