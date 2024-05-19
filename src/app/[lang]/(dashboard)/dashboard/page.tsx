import PageLayout from '@/components/pageLayout'
import {
  BarChartIcon,
  BriefcaseIcon,
  CogIcon,
  CreditCardIcon,
  PlugIcon,
  UsersIcon,
} from 'lucide-react'
import Link from 'next/link'

export default async function Page() {
  return (
    <>
      <PageLayout title="Dashboard">
        <main className="flex flex-col items-center justify-center min-h-screen px-4 md:px-6 pb-0 lg:pb-32">
          <div className="max-w-3xl w-full space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Explore the latest updates and features.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                href="#"
              >
                <BriefcaseIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Projects
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    View and manage your projects.
                  </p>
                </div>
              </Link>
              <Link
                className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                href="#"
              >
                <BarChartIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Analytics
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Analyze your data and performance.
                  </p>
                </div>
              </Link>
              <Link
                className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                href="#"
              >
                <CogIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Customize your account and preferences.
                  </p>
                </div>
              </Link>
              <Link
                className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                href="#"
              >
                <UsersIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Team
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your team and collaborators.
                  </p>
                </div>
              </Link>
              <Link
                className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                href="#"
              >
                <PlugIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Integrations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Connect your tools and services.
                  </p>
                </div>
              </Link>
              <Link
                className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                href="#"
              >
                <CreditCardIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Billing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage your subscription and payments.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </PageLayout>
    </>
  )
}
