import Link from "next/link";

/** Landing del apartado Empresas — explica las dos funciones y dirige a registro/login. */
export const EmpresasView = () => {
  return (
    <main>
      <header className="bg-background-inverse px-6 pt-16 pb-14 text-foreground-inverse">
        <div className="mx-auto w-full max-w-page">
          <span className="mb-1.5 block text-[0.813rem] font-bold tracking-[0.06em] text-accent-gold-soft uppercase">
            Nuevo
          </span>
          <h1 className="max-w-[38rem] text-[clamp(1.75rem,4vw,2.5rem)] leading-display font-display font-bold">
            Las mismas oportunidades para todos, y el estudio de seguridad en un solo lugar.
          </h1>
          <p className="mt-4 max-w-[38rem] text-[0.9375rem] text-foreground-inverse/62">
            Crea una cuenta de empresa verificada por NIT para suscribirte a alertas de Modo
            Oportunidad y consultar el estudio de seguridad de una persona por cédula.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/empresas/registro"
              className="rounded-full bg-linear-to-br from-accent-gold-soft to-accent-gold px-6 py-3.25 text-[0.9375rem] font-semibold text-background-inverse"
            >
              Crear cuenta de empresa
            </Link>
            <Link
              href="/empresas/login"
              className="rounded-full border border-foreground-inverse/20 bg-foreground-inverse/6 px-6 py-3.25 text-[0.9375rem] font-semibold"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 py-16">
        <div className="mx-auto grid w-full max-w-page gap-6 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-foreground/8 bg-surface-raised p-9">
            <div className="grid size-13 place-items-center rounded-2xl bg-accent-gold-soft/15 text-2xl">📣</div>
            <h2 className="mt-6 font-display text-[1.375rem] font-bold">Alertas de oportunidad</h2>
            <p className="mt-3 text-[0.9375rem] text-foreground/62">
              Suscríbete por sector y ubicación. Cuando RASTRO detecta una licitación nueva que
              coincide, te llega por correo al mismo tiempo que a cualquier otra empresa suscrita
              — para que todos partan con la misma información.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-foreground/8 bg-surface-raised p-9">
            <div className="grid size-13 place-items-center rounded-2xl bg-action-primary-hover/15 text-2xl">🔐</div>
            <h2 className="mt-6 font-display text-[1.375rem] font-bold">Estudio de seguridad por cédula</h2>
            <p className="mt-3 text-[0.9375rem] text-foreground/62">
              Antecedentes penales, disciplinarios y fiscales, procesos judiciales, EPS activa y
              multas de tránsito — cruzados en un solo dossier con niveles de evidencia, nunca un
              veredicto. Acceso restringido a cuentas de empresa/estado autenticadas.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
