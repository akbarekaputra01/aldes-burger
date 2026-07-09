import { ArrowLeft, Sandwich } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../context/LanguageContext'

function NotFound() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-screen items-center justify-center bg-aldesCream px-4">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-md">
        <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-red-600">
          <Sandwich className="h-8 w-8" />
        </div>
        <p className="text-7xl font-black leading-none text-red-600">{t('notFound.title')}</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">{t('notFound.subtitle')}</h1>
        <p className="mt-3 text-gray-500">{t('notFound.desc')}</p>

        <Link to="/menu" className="mx-auto mt-7 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700">
          <ArrowLeft className="h-4 w-4" /> {t('notFound.backHome')}
        </Link>
      </section>
    </main>
  )
}

export default NotFound
