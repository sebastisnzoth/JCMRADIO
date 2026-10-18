import { Tv } from 'lucide-react';
import type { AppConfig } from '../../types';
import { safeUrl } from './radio';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from './icons';

export type SocialNetwork = 'facebook' | 'instagram' | 'youtube' | 'tv' | 'tiktok' | 'whatsapp';

export interface SocialLink {
  network: SocialNetwork;
  label: string;
  href: string;
}

export function whatsappHref(value?: string): string {
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits.length >= 6 ? `https://wa.me/${digits}` : '';
}

function isYoutube(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^(www|m)\./, '');
    return host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com');
  } catch {
    return false;
  }
}

/**
 * Redes configuradas en el panel (Firestore `config/main`).
 * El enlace de TV se muestra con el logo de YouTube cuando apunta a YouTube.
 */
export function getSocialLinks(config: AppConfig | null, options: { includeWhatsapp?: boolean } = {}): SocialLink[] {
  const social = config?.socialLinks;
  const links: SocialLink[] = [];
  const facebook = safeUrl(social?.facebook);
  const instagram = safeUrl(social?.instagram);
  const tv = safeUrl(config?.tvLink);
  const tiktok = safeUrl(social?.tiktok);
  const whatsapp = options.includeWhatsapp ? whatsappHref(social?.whatsapp) : '';

  if (facebook) links.push({ network: 'facebook', label: 'Facebook', href: facebook });
  if (instagram) links.push({ network: 'instagram', label: 'Instagram', href: instagram });
  if (tv) links.push(isYoutube(tv) ? { network: 'youtube', label: 'YouTube', href: tv } : { network: 'tv', label: 'TV en vivo', href: tv });
  if (tiktok) links.push({ network: 'tiktok', label: 'TikTok', href: tiktok });
  if (whatsapp) links.push({ network: 'whatsapp', label: 'WhatsApp', href: whatsapp });
  return links;
}

function SocialGlyph({ network }: { network: SocialNetwork }) {
  switch (network) {
    case 'facebook':
      return <FacebookIcon />;
    case 'instagram':
      return <InstagramIcon />;
    case 'youtube':
      return <YoutubeIcon />;
    case 'tiktok':
      return <TiktokIcon />;
    case 'whatsapp':
      return <WhatsappIcon />;
    default:
      return <Tv aria-hidden="true" />;
  }
}

export function SocialLinks({ links, className = '' }: { links: SocialLink[]; className?: string }) {
  if (!links.length) return null;
  return (
    <ul className={`jcm-socials ${className}`.trim()}>
      {links.map((link) => (
        <li key={link.network}>
          <a
            className={`jcm-social jcm-social--${link.network}`}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} de JCM Radio (se abre en una pestaña nueva)`}
            title={link.label}
          >
            <SocialGlyph network={link.network} />
          </a>
        </li>
      ))}
    </ul>
  );
}
