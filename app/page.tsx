'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  film_title: string;
  genre: string;
  synopsis: string;
  screener_link: string;
  runtime_minutes: string;
  production_country: string;
  production_language: string;
  budget_tier: string;
  tos_accepted: boolean;
  privacy_policy_accepted: boolean;
  metadata_license_granted: boolean;
  opt_out_ai_training: boolean;
};

const initial: FormState = {
  full_name: '', email: '', phone: '', company: '', country: '',
  film_title: '', genre: '', synopsis: '', screener_link: '',
  runtime_minutes: '', production_country: '', production_language: '',
  budget_tier: '', tos_accepted: false, privacy_policy_accepted: false,
  metadata_license_granted: false, opt_out_ai_training: false,
};

export default function PortalPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tos_accepted || !form.privacy_policy_accepted) {
      setErrorMsg('Debes aceptar los Terminos y la Politica de Privacidad para continuar.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const { data: submitter, error: subErr } = await supabase
        .from('submitters')
        .insert({ full_name: form.full_name, email: form.email, phone: form.phone || null, company: form.company || null, country: form.country || null })
        .select('id')
        .single();
      if (subErr) throw subErr;

      const { data: submission, error: submiErr } = await supabase
        .from('submissions')
        .insert({
          submitter_id: submitter.id,
          film_title: form.film_title,
          genre: form.genre || null,
          synopsis: form.synopsis || null,
          screener_link: form.screener_link || null,
          runtime_minutes: form.runtime_minutes ? Number(form.runtime_minutes) : null,
          production_country: form.production_country || null,
          production_language: form.production_language || null,
          budget_tier: form.budget_tier || null,
        })
        .select('id')
        .single();
      if (submiErr) throw submiErr;

      const { error: consentErr } = await supabase
        .from('submission_consents')
        .insert({
          submission_id: submission.id,
          tos_accepted: form.tos_accepted,
          tos_accepted_at: new Date().toISOString(),
          privacy_policy_accepted: form.privacy_policy_accepted,
          privacy_policy_accepted_at: new Date().toISOString(),
          metadata_license_granted: form.metadata_license_granted,
          metadata_license_accepted_at: form.metadata_license_granted ? new Date().toISOString() : null,
          opt_out_ai_training: form.opt_out_ai_training,
        });
      if (consentErr) throw consentErr;

      setStatus('success');
      setForm(initial);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado. Intenta de nuevo.');
    }
  };

  if (status === 'success') {
    return (
      <main>
        <div className="success">
          <h2>Postulacion Enviada</h2>
          <p>Hemos recibido tu postulacion. Nos pondremos en contacto contigo pronto.</p>
          <button onClick={() => setStatus('idle')} style={{marginTop:'1rem',background:'none',border:'1px solid #4ade80',color:'#4ade80',padding:'0.5rem 1.25rem',borderRadius:'6px',cursor:'pointer'}}>Nueva postulacion</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1>Masala Festival Portal</h1>
      <p className="subtitle">Portal oficial de postulaciones V1 &mdash; Masala Group S.A.S.</p>
      <form onSubmit={handleSubmit}>
        <h2 style={{fontSize:'1.1rem',color:'#e25822'}}>Informacion del Postulante</h2>
        <div><label>Nombre completo *</label><input name="full_name" required value={form.full_name} onChange={handleChange} placeholder="Tu nombre completo" /></div>
        <div><label>Email *</label><input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="tu@email.com" /></div>
        <div><label>Telefono</label><input name="phone" value={form.phone} onChange={handleChange} placeholder="+57 300 000 0000" /></div>
        <div><label>Empresa / Productora</label><input name="company" value={form.company} onChange={handleChange} placeholder="Nombre de tu productora" /></div>
        <div><label>Pais de residencia</label><input name="country" value={form.country} onChange={handleChange} placeholder="Colombia" /></div>

        <h2 style={{fontSize:'1.1rem',color:'#e25822',marginTop:'1rem'}}>Informacion del Film</h2>
        <div><label>Titulo del film *</label><input name="film_title" required value={form.film_title} onChange={handleChange} placeholder="Titulo oficial" /></div>
        <div><label>Genero</label><select name="genre" value={form.genre} onChange={handleChange}><option value="">Selecciona un genero</option><option value="drama">Drama</option><option value="documentary">Documental</option><option value="experimental">Experimental</option><option value="animation">Animacion</option><option value="short">Cortometraje</option><option value="other">Otro</option></select></div>
        <div><label>Duracion (minutos)</label><input name="runtime_minutes" type="number" min="1" value={form.runtime_minutes} onChange={handleChange} placeholder="90" /></div>
        <div><label>Pais de produccion</label><input name="production_country" value={form.production_country} onChange={handleChange} placeholder="Colombia" /></div>
        <div><label>Idioma principal</label><input name="production_language" value={form.production_language} onChange={handleChange} placeholder="Espanol" /></div>
        <div><label>Presupuesto</label><select name="budget_tier" value={form.budget_tier} onChange={handleChange}><option value="">Selecciona rango</option><option value="micro">Micro (&lt; $10k USD)</option><option value="low">Bajo ($10k - $100k USD)</option><option value="mid">Medio ($100k - $1M USD)</option></select></div>
        <div><label>Sinopsis</label><textarea name="synopsis" value={form.synopsis} onChange={handleChange} placeholder="Breve descripcion del film (max. 500 palabras)" /></div>
        <div><label>Link de screener (Vimeo / Drive)</label><input name="screener_link" value={form.screener_link} onChange={handleChange} placeholder="https://vimeo.com/..." /></div>

        <h2 style={{fontSize:'1.1rem',color:'#e25822',marginTop:'1rem'}}>Consentimientos</h2>
        <div className="checkbox-row"><input type="checkbox" name="tos_accepted" checked={form.tos_accepted} onChange={handleChange} /><span>Acepto los <a href="#" style={{color:'#e25822'}}>Terminos y Condiciones</a> del festival *</span></div>
        <div className="checkbox-row"><input type="checkbox" name="privacy_policy_accepted" checked={form.privacy_policy_accepted} onChange={handleChange} /><span>Acepto la <a href="#" style={{color:'#e25822'}}>Politica de Privacidad</a> *</span></div>
        <div className="checkbox-row"><input type="checkbox" name="metadata_license_granted" checked={form.metadata_license_granted} onChange={handleChange} /><span>Autorizo el uso de metadatos del film para estadisticas del festival</span></div>
        <div className="checkbox-row"><input type="checkbox" name="opt_out_ai_training" checked={form.opt_out_ai_training} onChange={handleChange} /><span>Prefiero que mis datos NO se usen para entrenar modelos de IA</span></div>

        {errorMsg && <p className="error-msg">{errorMsg}</p>}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando...' : 'Enviar postulacion'}
        </button>
      </form>
    </main>
  );
}
