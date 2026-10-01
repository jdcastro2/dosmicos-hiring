'use client'
import { CreativeForm, profiles, achievementQuestion } from '@/lib/creative'
interface Props { data: CreativeForm; update: (data: Partial<CreativeForm>) => void; errors: Record<string,string>; upload: (file: File) => void; uploading: boolean; fileName: string }
export default function CreativeFields({data, update, errors, upload, uploading, fileName}: Props) {
  function field(name: keyof CreativeForm, label: string, options?: readonly string[], type = 'text', multiline = false) {
    const props = { id: name, name, value: data[name], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => update({[name]: e.target.value}), 'aria-invalid': !!errors[name], 'aria-describedby': errors[name] ? `${name}-error` : undefined, className: `w-full min-w-0 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-neutral-700 ${errors[name] ? 'border-red-400 bg-red-50' : 'border-neutral-200 bg-white'}` }
    return <div key={name}><label htmlFor={name} className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>{options ? <select {...props}><option value="">Selecciona una opción</option>{options.map(option => <option key={option}>{option}</option>)}</select> : multiline ? <textarea {...props} rows={4} maxLength={1000}/> : <input {...props} type={type} maxLength={500} autoComplete={name === 'full_name' ? 'name' : name === 'email' ? 'email' : undefined}/>} {errors[name] && <p id={`${name}-error`} className="text-red-600 text-sm mt-2">{errors[name]}</p>}</div>
  }
  return <div className="space-y-6">
    <div><h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Tu postulación</h2><p className="text-neutral-500 mt-2">La disponibilidad y los requisitos de tu universidad se revisarán después del primer filtro.</p></div>
    {field('full_name', 'Nombre completo')}
    {field('email', 'Correo electrónico', undefined, 'email')}
    {field('profile', 'Perfil al que te postulas', profiles)}
    <div><label htmlFor="resume-upload" className="block text-sm font-medium text-neutral-700 mb-2">Hoja de vida — PDF o Word, máximo 5 MB</label><input id="resume-upload" type="file" accept=".pdf,.doc,.docx" disabled={uploading} aria-invalid={!!errors.resume_url} aria-describedby={errors.resume_url ? 'resume_url-error' : undefined} onChange={e => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = '' }} className="block w-full text-sm file:mr-3 file:py-3 file:px-4 file:border-0 file:rounded-lg"/><p role="status" className="text-sm mt-2">{uploading ? 'Subiendo…' : data.resume_url ? `Archivo subido: ${fileName}` : ''}</p>{errors.resume_url && <p id="resume_url-error" className="text-red-600 text-sm mt-2">{errors.resume_url}</p>}</div>
    {field('impressive_achievement', achievementQuestion, undefined, 'text', true)}
    {field('portfolio_link', 'Link a tu portafolio (opcional)', undefined, 'url')}
    <p className="text-sm text-neutral-500">Al enviar, compartes esta información para el proceso de selección de prácticas de Dosmicos.</p>
  </div>
}
