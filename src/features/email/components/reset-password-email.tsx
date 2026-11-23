import Image from "next/image";
import type { ReactNode } from "react";

export type ResetPasswordEmailText = {
  title: string;
  cta: string;
  body: string;
  ignore: string;
  copyLink: string;
  footerBefore: string;
  footerAfter: string;
};

const EmailFrame = ({ children, footer }: { children: ReactNode; footer?: ReactNode }) => (
  <div className="flex w-full max-w-[45rem] flex-col items-center px-m pt-12 pb-12">
    <Image src="/brand/Brand.svg" alt="Stolos" width={89} height={24} />
    <article className="relative mt-[1.625rem] flex w-full max-w-[32.375rem] flex-col items-center overflow-hidden rounded-m border border-white/10 bg-black/40 px-[1.75rem] pt-12 pb-[2.9375rem] text-center shadow-[0_20px_40px_rgb(0_0_0/0.25)]">
      <Image
        src="/brand/stolos-mark.svg"
        alt=""
        aria-hidden
        width={180}
        height={216}
        className="pointer-events-none absolute top-[17.625rem] left-1/2 -translate-x-1/2 opacity-[0.06] select-none"
      />
      <div className="relative flex w-full flex-col items-center">{children}</div>
    </article>
    {footer}
  </div>
);


export const ResetPasswordEmail = ({ link, text }: { link: string; text: ResetPasswordEmailText }) => (
  <EmailFrame
    footer={
      <p className="mt-[1.6875rem] text-sx text-white/50">
        {text.footerBefore}{" "}
        <a href="https://histia.net" className="underline hover:text-white">
          Histia
        </a>
        {text.footerAfter}
      </p>
    }
  >
    <h1 className="text-m leading-[1.8125rem] font-semibold text-white">{text.title}</h1>
    <a
      href={link}
      className="mt-12 inline-flex h-11 items-center rounded-xs bg-primary-400 px-m text-s text-white transition-colors hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
    >
      {text.cta}
    </a>
    <p className="mt-[2.9375rem] text-s leading-[1.5625rem] text-white/80">{text.body}</p>
    <p className="mt-2.5 max-w-[28.5rem] text-sx leading-[1.3125rem] text-white/50">{text.ignore}</p>
    <p className="mt-[1.375rem] text-xs leading-[1.125rem] text-white/50">{text.copyLink}</p>
    <a href={link} className="text-xs leading-[1.125rem] break-all text-primary-200 hover:text-white">
      {link}
    </a>
  </EmailFrame>
);

export const NoResetEmail = ({ title, body, cta, href }: { title: string; body: string; cta: string; href: string }) => (
  <EmailFrame>
    <h1 className="text-m leading-[1.8125rem] font-semibold text-white">{title}</h1>
    <p className="mt-m text-s leading-[1.5625rem] text-white/80">{body}</p>
    <a
      href={href}
      className="mt-xl inline-flex h-11 items-center rounded-xs bg-primary-400 px-m text-s text-white transition-colors hover:bg-primary-500"
    >
      {cta}
    </a>
  </EmailFrame>
);
