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
    <div className="relative isolate h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-x-0 -top-40 -z-10 pointer-events-none transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#1a237e] to-[#311b92] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Main content wrapper */}
      <div className="w-full max-w-7xl px-6 lg:px-8 h-[90vh] flex flex-col justify-center space-y-6">
        {/* Hero section */}
        <div className="mx-auto mb-20 max-w-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-violet-200">
              The Future of Professional Careers
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Connect with industry-leading companies and discover opportunities that align with your professional aspirations.
            </p>
            <div className="mt-6 flex items-center justify-center gap-x-6">
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

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 -z-10 pointer-events-none transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#1a237e] to-[#311b92] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </div>
  )
} 