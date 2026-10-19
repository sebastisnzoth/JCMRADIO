import { NAV_ITEMS } from './content';
import { Logo } from './Logo';
import { SocialLinks, type SocialLink } from './SocialLinks';

export function Footer({ socials }: { socials: SocialLink[] }) {
  return (
    <footer className="jcm-footer">
      <div className="jcm-container jcm-footer__inner">
        <div>
          <Logo />
          <p className="jcm-footer__claim">Música, información y entretenimiento las 24 horas.</p>
        </div>
        <nav className="jcm-footer__nav" aria-label="Enlaces del pie de página">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <SocialLinks links={socials} />
      </div>
      <div className="jcm-container jcm-footer__bottom">
        <small>© {new Date().getFullYear()} JCM Radio. Todos los derechos reservados.</small>
        <a className="jcm-footer__admin" href={`${import.meta.env.BASE_URL}admin`}>
          Panel de control
        </a>
      </div>
    </footer>
  );
}
