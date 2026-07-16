import type { ImgHTMLAttributes } from 'react';
import whatsappLogo from '../../assets/whatsapp-latest.png';

export function WhatsAppIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={whatsappLogo} alt="" draggable={false} {...props} />;
}
