import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Loader2, MapPin, X } from 'lucide-react'
import api from '../lib/api'
import { applySuggestionToForm, canSubmitAddress } from '../pages/addressbook/formLogic'
import { searchAddressSuggestions } from '../pages/addressbook/geocoding'
import { getCities, getDistricts, getPostalCodes, getProvinces } from '../pages/addressbook/regions'

export default function AddressBookModal({ open, onClose, onSaved, initialAddress, userPhone }) {
  const isEdit = Boolean(initialAddress?.id)
  const [form, setForm] = useState({ recipient_name: '', phone_number: '', province: '', city: '', district: '', postal_code: '', street_address: '', detail_address: '', label: 'Home', is_default: false, is_pickup: false, is_return: false, latitude: null, longitude: null, pin_source: 'default', pin_confirmed: false })
  const [isSaving, setIsSaving] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showPhoneReco, setShowPhoneReco] = useState(false)
  const [showMapLayer, setShowMapLayer] = useState(false)
  const [error, setError] = useState('')
  const markerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(initialAddress ? { ...form, ...initialAddress } : { ...form, phone_number: userPhone || '' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAddress, userPhone])

  const provinceOptions = useMemo(() => getProvinces(), [])
  const cityOptions = useMemo(() => getCities(form.province), [form.province])
  const districtOptions = useMemo(() => getDistricts(form.province, form.city), [form.province, form.city])
  const postalCodeOptions = useMemo(() => getPostalCodes(form.province, form.city, form.district), [form.province, form.city, form.district])

  useEffect(() => {
    const q = form.street_address?.trim()
    if (!q || q.length < 3) return setSuggestions([])
    searchAddressSuggestions(q, { province: form.province, city: form.city, district: form.district, postalCode: form.postal_code })
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
  }, [form.street_address, form.province, form.city, form.district, form.postal_code])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmitAddress(form)) return setError('Lengkapi data alamat dulu.')
    setIsSaving(true)
    try {
      if (isEdit) await api.put(`/addresses/${initialAddress.id}`, form)
      else await api.post('/addresses', form)
      onSaved()
      onClose()
    } catch {
      setError('Gagal menyimpan alamat.')
    } finally { setIsSaving(false) }
  }

  if (!open) return null
  return <div className="fixed inset-0 z-50 bg-black/45 p-4"><div className="mx-auto mt-8 w-full max-w-2xl rounded-2xl bg-white p-6">
    {showMapLayer ? <div>
      <div className='mb-3 flex items-center gap-2'><button type='button' onClick={()=>setShowMapLayer(false)}><ArrowLeft className='h-5 w-5'/></button><h3 className='font-bold'>Edit Location</h3></div>
      <div className='h-80 rounded-xl border bg-aldesCream grid place-items-center text-sm text-gray-600'>Map layer (drag pin) - klik confirm untuk kembali</div>
      <div className='mt-4 flex justify-end gap-3'><button type='button' onClick={()=>setShowMapLayer(false)} className='px-4 py-2'>Back</button><button type='button' onClick={()=>setShowMapLayer(false)} className='rounded-xl bg-aldesRed px-5 py-2 text-white'>Confirm</button></div>
    </div> : <form onSubmit={onSubmit} className='space-y-3'>
      <div className='flex items-center justify-between'><h3 className='text-2xl font-black'>{isEdit ? 'Edit Address' : 'New Address'}</h3><button type='button' onClick={onClose}><X/></button></div>
      <div className='grid grid-cols-2 gap-3'><input className='rounded-xl border px-3 py-2' placeholder='Full Name' value={form.recipient_name || ''} onChange={e=>setForm(p=>({...p, recipient_name:e.target.value}))}/><div className='relative'><input className='w-full rounded-xl border px-3 py-2' placeholder='Phone Number' value={form.phone_number || ''} onFocus={()=>setShowPhoneReco(true)} onChange={e=>setForm(p=>({...p, phone_number:e.target.value}))}/>{showPhoneReco && userPhone && <div className='absolute z-10 mt-1 w-full rounded-lg border bg-white p-2 text-sm'><div className='flex items-center justify-between'><span>{userPhone}</span><button type='button' className='text-aldesRed' onClick={()=>{setForm(p=>({...p, phone_number:userPhone}));setShowPhoneReco(false)}}>Use</button></div></div>}</div></div>
      <input className='w-full rounded-xl border px-3 py-2' placeholder='Province, City, District, Postal Code' value={[form.province, form.city, form.district, form.postal_code].filter(Boolean).join(', ')} readOnly onClick={()=>{}} />
      <div className='grid grid-cols-4 gap-2'>
        <select className='rounded-xl border px-2 py-2' value={form.province} onChange={e=>setForm(p=>({...p,province:e.target.value,city:'',district:'',postal_code:''}))}><option value=''>Province</option>{provinceOptions.map(x=><option key={x.id} value={x.name}>{x.name}</option>)}</select>
        <select className='rounded-xl border px-2 py-2' value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value,district:'',postal_code:''}))}><option value=''>City</option>{cityOptions.map(x=><option key={x.id} value={x.name}>{x.name}</option>)}</select>
        <select className='rounded-xl border px-2 py-2' value={form.district} onChange={e=>setForm(p=>({...p,district:e.target.value,postal_code:''}))}><option value=''>District</option>{districtOptions.map(x=><option key={x.id} value={x.name}>{x.name}</option>)}</select>
        <select className='rounded-xl border px-2 py-2' value={form.postal_code} onChange={e=>setForm(p=>({...p,postal_code:e.target.value}))}><option value=''>Postal</option>{postalCodeOptions.map(x=><option key={x.postalCode} value={x.postalCode}>{x.postalCode}</option>)}</select>
      </div>
      <input className='w-full rounded-xl border px-3 py-2' placeholder='Street Name, Building, House No.' value={form.street_address || ''} onChange={e=>setForm(p=>({...p,street_address:e.target.value}))}/>
      {suggestions.length > 0 && <div className='max-h-32 overflow-auto rounded-xl border'>{suggestions.slice(0,5).map(s=><button type='button' key={s.id} className='block w-full border-b px-3 py-2 text-left text-sm hover:bg-gray-50' onClick={()=>setForm(p=>applySuggestionToForm(p,s))}>{s.formattedAddress || s.title}</button>)}</div>}
      <button type='button' className='w-full rounded-xl border px-3 py-2 text-left text-sm' onClick={()=>setShowMapLayer(true)}><MapPin className='mr-1 inline h-4 w-4'/>Set/Adjust map point</button>
      <input className='w-full rounded-xl border px-3 py-2' placeholder='Other details (optional)' value={form.detail_address || ''} onChange={e=>setForm(p=>({...p,detail_address:e.target.value}))}/>
      <div className='flex gap-2'><button type='button' onClick={()=>setForm(p=>({...p,label:'Home'}))} className={`rounded-lg border px-3 py-1 ${form.label==='Home'?'border-aldesRed text-aldesRed':''}`}>Home</button><button type='button' onClick={()=>setForm(p=>({...p,label:'Work'}))} className={`rounded-lg border px-3 py-1 ${form.label==='Work'?'border-aldesRed text-aldesRed':''}`}>Work</button><button type='button' onClick={()=>setForm(p=>({...p,label:'Other'}))} className={`rounded-lg border px-3 py-1 ${form.label==='Other'?'border-aldesRed text-aldesRed':''}`}>Other</button></div>
      <div className='grid grid-cols-1 gap-1 text-sm text-gray-600'><label><input type='checkbox' checked={!!form.is_default} onChange={e=>setForm(p=>({...p,is_default:e.target.checked}))}/> Set as default</label><label><input type='checkbox' checked={!!form.is_pickup} onChange={e=>setForm(p=>({...p,is_pickup:e.target.checked}))}/> Pickup address</label><label><input type='checkbox' checked={!!form.is_return} onChange={e=>setForm(p=>({...p,is_return:e.target.checked}))}/> Return address</label></div>
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <div className='flex justify-end gap-2'><button type='button' onClick={onClose}>Cancel</button><button disabled={isSaving} className='rounded-xl bg-aldesRed px-5 py-2 text-white'>{isSaving ? <Loader2 className='h-4 w-4 animate-spin'/> : 'Submit'}</button></div>
    </form>}
  </div></div>
}
